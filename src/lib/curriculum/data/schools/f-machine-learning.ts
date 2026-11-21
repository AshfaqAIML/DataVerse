/**
 * SCHOOL F — MACHINE LEARNING (F1–F12)
 * Supervised and unsupervised learning end to end: the math underneath at
 * intuition level, the evaluation discipline alongside, and the failure
 * modes in plain sight.
 *
 * Design note: statistics/math prerequisites are HARD gates here — the
 * academy enforces "math and statistics before ML".
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolF: SubjectDef[] = [
  // ------------------------------------------------------------------ F1
  {
    slug: "ml-fundamentals",
    school: "F",
    code: "F1",
    title: "Machine Learning Fundamentals",
    blurb: "What learning from data really means — the workflow, the tradeoffs, and the failure modes that quietly kill real projects.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["pandas", "descriptive-statistics", "linear-algebra"],
    softPrerequisites: ["probability", "optimization"],
    objectives: [
      "Distinguish machine learning from rules-based programming and from marketing hype",
      "Frame a real problem as supervised, unsupervised, or not-an-ML-problem",
      "Explain overfitting, the bias-variance tradeoff, and data leakage in plain language",
      "Walk the six-stage ML workflow from question to deployment",
      "Judge when a simple rule or baseline outperforms a learned model",
    ],
    outcomes: [
      "A learner can classify a described business problem into supervised, unsupervised, or no-ML-needed with justification",
      "A learner can diagnose overfitting from train vs test performance numbers and propose remedies",
      "A learner can trace a dataset through the full ML workflow and name the failure risks at each stage",
      "A learner can spot three classic data-leakage patterns in a feature list before any model is trained",
    ],
    modules: [
      mod(
        "What Machine Learning Actually Is",
        "Define the field without the fog: programs that estimate patterns from data, and the three families that organize everything else.",
        ["State what machine learning is and is not, with concrete examples", "Map a described problem to supervised, unsupervised, or reinforcement learning"],
        ["concept-check", "case-analysis"],
        [
          ch("Defining the Field", "What learning from data means, and the myths that need to die early", [
            L("What Machine Learning Actually Is", 25, ["machine learning", "experience data", "generalization"], "Define ML the honest way: programs whose performance on a task improves because they learn from data."),
            L("What Machine Learning Is Not", 25, ["hype", "automation myth", "assumption failure"], "Debunk the myths: ML is not magic, not self-correcting, and not a substitute for domain thinking.", "reading"),
          ]),
          ch("The Three Families of Learning", "Supervised, unsupervised, and reinforcement learning told through one example each", [
            L("Supervised, Unsupervised, and Reinforcement Learning", 30, ["supervised learning", "unsupervised learning", "reinforcement learning"], "Tour the three families with a concrete use case each and learn to tell them apart in the wild."),
            L("Classifying Real Business Asks by Family", 25, ["task framing", "labels", "reward signal"], "Practice mapping vague business requests onto the right learning family — or onto no ML at all.", "guided-practice"),
          ]),
        ]
      ),
      mod(
        "Generalization and Its Enemies",
        "The single idea that separates ML from curve fitting: performance on data the model has never seen.",
        ["Explain why held-out performance is the only score that matters", "Diagnose overfitting and underfitting from train/validation curves"],
        ["concept-check", "interpret-results"],
        [
          ch("Training, Testing, and Generalization", "Held-out data, memorization, and the bias-variance tradeoff", [
            L("The Train/Test Mindset", 30, ["generalization", "holdout set", "out-of-sample error"], "Adopt the only mindset that matters: a model is judged on data it has never seen."),
            L("Overfitting: Memorizing Instead of Learning", 30, ["overfitting", "memorization", "noise fitting"], "Watch a model ace its training set and collapse on new data — the industry's most common failure.", "worked-example"),
            L("Underfitting and the Bias-Variance Tradeoff", 35, ["bias", "variance", "model complexity"], "Split error into bias, variance, and noise at intuition level and choose models on that basis."),
          ]),
          ch("Failure Modes in Plain Sight", "Leakage and the cases where rules beat models", [
            L("Data Leakage: The Silent Killer of Models", 30, ["data leakage", "target leakage", "train-test contamination"], "Meet the failure that quietly ruins real projects: information in your features that will not exist at prediction time.", "reading"),
            L("When a Simple Rule Beats a Model", 25, ["heuristic rules", "baseline", "cost of complexity"], "Recognize the situations where a hand-written rule wins and a model would be expensive theater."),
          ]),
        ]
      ),
      mod(
        "The ML Workflow End to End",
        "The six-stage loop — question, data, features, model, evaluation, deployment — that every real project walks (and rewinds).",
        ["Walk a dataset through the six-stage ML workflow", "Frame a vague business question as a measurable prediction problem"],
        ["concept-check", "design-review", "case-analysis"],
        [
          ch("From Question to Data", "Framing first: turning a business ask into a target, a metric, and a data plan", [
            L("The Six-Stage ML Workflow", 30, ["workflow", "question framing", "deployment"], "Follow one running example through question, data, features, model, evaluation, and deployment."),
            L("Framing a Question as an ML Problem", 30, ["problem framing", "success metric", "feasibility check"], "Turn reduce churn into a target definition, a metric, and a data requirement — the framing that decides success.", "guided-practice"),
          ]),
          ch("Iteration and Honest Expectations", "The modeling loop and the expectations you set out loud", [
            L("The Iterative Modeling Loop", 25, ["iteration", "error analysis", "experiment tracking"], "See why real projects loop through data, features, and models repeatedly before anything ships."),
            L("Honest Expectations for ML Projects", 25, ["data quality ceiling", "timelines", "diminishing returns"], "Set realistic expectations about accuracy, timelines, and the quality of the data you actually have.", "reading"),
          ]),
        ]
      ),
      mod(
        "First Models, First Mistakes",
        "Hands on keyboards: train a first model with scikit-learn and interrogate what it gets wrong before trusting what it gets right.",
        ["Train and score a first scikit-learn estimator end to end", "Read a model's errors and connect them to workflow failure modes"],
        ["write-code", "interpret-results", "concept-check"],
        [
          ch("Your First Model", "The estimator API in the hands, with errors inspected line by line", [
            L("A First Model in scikit-learn", 35, ["estimator", "fit", "predict", "score"], "Train, predict, and score your first model and read every line of the estimator API.", "code", 3),
            L("Reading a Model's Mistakes", 30, ["error analysis", "residuals", "misclassified rows"], "Interrogate what the model gets wrong first — the habit that separates practitioners from tutorials.", "worked-example"),
          ]),
          ch("Judgment and Review", "The litmus test for ML-worthy problems, and the subject's mental map", [
            L("The ML Litmus Test: Ten Questions Before You Model", 25, ["feasibility", "ml litmus test", "decision criteria"], "Apply a ten-question checklist that decides whether a problem deserves ML, simpler analytics, or nothing.", "guided-practice"),
            L("Review: Thinking in Models", 20, ["review", "mental model", "vocabulary"], "Consolidate the vocabulary, the workflow, and the failure modes into one mental map.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Machine Learning Fundamentals Final", 50, 20),
    projects: [
      proj(
        "Baseline Before Models",
        "Pick a public tabular dataset, frame one prediction question, build a trivial baseline (majority class or mean predictor), then train one scikit-learn model and compare honestly. Close with a one-page decision memo: is the model worth its complexity?",
        6,
        "guided",
        [
          "Notebook with question framing, baseline, and one trained model",
          "Train/validation/test comparison table with the same splits for both models",
          "A one-page decision memo: ship, iterate, or skip",
        ],
        [
          "Baseline built and reported before the model",
          "Comparison uses identical splits and states uncertainty",
          "Memo names at least one risk (leakage, drift, or complexity) with a mitigation",
        ],
        ["python", "scikit-learn", "pandas", "jupyter"]
      ),
      proj(
        "Leakage Hunt: Audit a Feature Catalogue",
        "You receive a feature catalogue for a loan-default prediction task. Audit every feature for leakage potential, write a keep/drop/transform verdict for each with reasons, and design the split protocol that keeps the honest features honest.",
        4,
        "guided",
        [
          "A written audit table: feature, verdict, reasoning",
          "A proposed train/test protocol with justification",
          "The three most dangerous features, each with the test that would expose it",
        ],
        [
          "Verdicts cite timing, provenance, or target proximity — not vague caution",
          "Split protocol matches the deployment scenario",
          "The exposure tests are concrete and runnable",
        ],
        ["pandas", "scikit-learn"]
      ),
    ],
    placementEligible: true,
    keywords: ["machine learning", "overfitting", "bias-variance tradeoff", "data leakage", "ml workflow", "supervised vs unsupervised"],
  },

  // ------------------------------------------------------------------ F2
  {
    slug: "supervised-learning",
    school: "F",
    code: "F2",
    title: "Supervised Learning",
    blurb: "The anatomy of every supervised task — features, targets, losses, splits — anchored by k-NN and the modeling loop professionals actually run.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["ml-fundamentals"],
    softPrerequisites: [],
    objectives: [
      "Decompose any supervised problem into features, target, and loss",
      "Apply the fit/predict cycle and the train/validation/test discipline",
      "Use k-NN as the anchor algorithm for understanding decision boundaries and overfitting",
      "Run the iterative modeling loop with baselines and error analysis",
      "Recognize the common failure patterns of supervised projects",
    ],
    outcomes: [
      "A learner can split a dataset into train, validation, and test with a strategy that matches the deployment scenario",
      "A learner can train k-NN models and predict how k affects overfitting before seeing the results",
      "A learner can build baseline models and use error analysis to drive one improvement iteration",
      "A learner can explain why test-set reuse invalidates performance estimates",
    ],
    modules: [
      mod(
        "Anatomy of a Supervised Task",
        "Features, targets, and losses: dissect any supervised problem into the parts every algorithm shares.",
        ["Decompose a dataset into feature matrix X and target y", "Explain how a loss function turns being wrong into a number an algorithm can minimize"],
        ["concept-check", "predict-output", "write-code"],
        [
          ch("Features, Targets, and Loss", "The universal anatomy: X, y, and the loss that makes learning computable", [
            L("Features and Targets: The Shape of a Problem", 30, ["feature matrix", "target variable", "X and y"], "Decompose any supervised dataset into X and y and understand exactly what a model consumes."),
            L("Loss Functions: Pricing Wrongness", 30, ["loss function", "squared error", "optimization target"], "See how a numeric loss converts being wrong into a surface an algorithm can walk down.", "worked-example"),
            L("Classification vs Regression Targets", 25, ["classification", "regression", "ordinal targets"], "Choose the task family from the target's type — and catch targets that are secretly ordinal."),
          ]),
          ch("The fit/predict Cycle", "The two-verb contract behind every scikit-learn model", [
            L("fit and predict: The Two-Verb Contract", 30, ["fit", "predict", "estimator state"], "Learn the fit/predict contract shared by every scikit-learn estimator — and the state fitting creates.", "code"),
            L("What fit Actually Learns", 25, ["learned parameters", "coef_", "model internals"], "Inspect the attributes a fitted model stores and connect them back to the math they encode.", "code"),
          ]),
        ]
      ),
      mod(
        "Splitting Data Honestly",
        "Train, validation, and test: the discipline that keeps performance estimates honest.",
        ["Split data into train, validation, and test with a defensible strategy", "Use the test set exactly once and explain why reuse invalidates it"],
        ["write-code", "interpret-results", "debug"],
        [
          ch("Train, Validation, and Test", "Three splits, three jobs, and the rituals that protect the test set", [
            L("Why We Hold Out Data", 30, ["holdout", "generalization estimate", "model selection"], "Split data into train, validation, and test — and know which question each split is allowed to answer."),
            L("The Test Set: Spend It Once", 25, ["single use", "adaptive overfitting", "final estimate"], "Treat the test set as a one-shot resource; every peek debases the currency.", "reading"),
            L("Random, Stratified, and Time-Based Splits", 35, ["stratification", "temporal split", "group awareness"], "Choose a splitting strategy that mirrors how the model will actually be used in the world.", "worked-example"),
          ]),
          ch("k-Nearest Neighbors: The Anchor Algorithm", "The simplest learner — the clearest window into decision boundaries and overfitting", [
            L("k-NN: Democracy Among Neighbors", 30, ["k-nearest neighbors", "distance metric", "majority vote"], "Grasp the simplest supervised learner: store the data, let the closest points vote."),
            L("Decision Boundaries: Where Models Draw Lines", 30, ["decision boundary", "nearest-neighbor geometry", "flexibility"], "Visualize how k and distance carve feature space into regions — the geometry behind all classifiers.", "worked-example"),
            L("Tuning k: Overfitting Made Visible", 30, ["hyperparameter k", "smoothing", "validation curve"], "Watch k=1 memorize noise and k=200 blur everything — the clearest bias-variance demo in ML.", "code", 3),
          ]),
        ]
      ),
      mod(
        "The Iterative Modeling Loop",
        "Baselines, error analysis, and the diagnose-refine loop that turns guesswork into engineering.",
        ["Build baseline models that set the bar for anything smarter", "Run the fit-diagnose-refine loop driven by error analysis"],
        ["concept-check", "case-analysis", "design-review"],
        [
          ch("Baselines Before Brilliance", "Dumb models first: the bar every serious model must clear", [
            L("Baseline Models That Set the Bar", 30, ["majority baseline", "mean predictor", "trivial rules"], "Build the dumb models every real system must beat before complexity earns trust.", "code"),
            L("The Iterate-Diagnose-Refine Loop", 30, ["error analysis", "hypothesis", "refinement"], "Turn modeling into a loop: fit, inspect the errors, form a hypothesis, and refit.", "guided-practice"),
          ]),
          ch("Common Failure Patterns", "The recurring ways supervised projects die — and the debugging playbook", [
            L("Five Ways Supervised Projects Fail", 30, ["distribution shift", "shortcut learning", "metric mismatch"], "Catalog the recurring failures: leakage, shift, imbalance, mismatched metrics, and complexity addiction.", "reading"),
            L("Debugging a Model That Won't Learn", 30, ["sanity checks", "overfit-a-batch", "diagnostic order"], "Follow the diagnostic playbook when loss will not fall: data, labels, scaling, capacity — in that order.", "guided-practice"),
          ]),
        ]
      ),
      mod(
        "Supervised Learning in Practice",
        "One complete task, carried honestly from raw table to reported metric.",
        ["Carry a real tabular task through the full supervised loop", "Compare candidate models with the humility small datasets demand"],
        ["dataset-task", "interpret-results", "concept-check"],
        [
          ch("A Complete Task End to End", "The whole discipline in one notebook: split, baseline, model, compare, report", [
            L("End to End: One Dataset Through the Full Loop", 40, ["modeling pipeline", "train-validate-test", "honest reporting"], "Carry one real dataset from raw table to reported metric with every discipline applied.", "guided-practice", 3),
            L("Comparing Candidates Honestly", 30, ["model comparison", "estimate variance", "reporting"], "Compare models with the humility that small validation sets — and shared folds — demand.", "worked-example"),
          ]),
          ch("Review", "The anatomy, the splits, and the anchor algorithm, consolidated", [
            L("Transferring the Template Across Domains", 25, ["tabular", "text", "images"], "See how the same supervised template transfers across tabular, text, and image problems."),
            L("Supervised Learning Review", 20, ["review", "fit/predict", "splits"], "Reinforce the anatomy, the split discipline, and the anchor algorithm before the final.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Supervised Learning Final", 50, 22),
    projects: [
      proj(
        "k-NN From Scratch and the Boundary Lab",
        "Implement k-NN by hand in NumPy, validate it against scikit-learn on three datasets, and produce decision-boundary plots for k = 1, 5, 50, and 200 with a written diagnosis of under- and overfitting.",
        6,
        "guided",
        [
          "A working k-NN implementation matching scikit-learn's predictions",
          "Four decision-boundary plots labeled by k",
          "A short written diagnosis: which k underfits, which overfits, and the evidence",
        ],
        [
          "Implementation validated against scikit-learn on the same splits",
          "Boundary plots show the smoothing effect of larger k",
          "Diagnosis uses train vs validation numbers, not adjectives",
        ],
        ["python", "numpy", "scikit-learn", "matplotlib"]
      ),
      proj(
        "The Full Supervised Loop",
        "Choose a tabular dataset with a clear target and run the complete loop — stratified splits, two baselines, two models, error analysis, and one improvement iteration — closing with a report that would survive a senior review.",
        8,
        "independent",
        [
          "A reproducible notebook from raw data to reported metric",
          "Baseline ladder and candidate models evaluated on shared folds",
          "One error-analysis-driven improvement, documented",
        ],
        [
          "Splits are stratified and reused identically across models",
          "The improvement is motivated by observed errors, not blind tuning",
          "The report states the metric, its uncertainty, and one limitation",
        ],
        ["python", "scikit-learn", "pandas", "jupyter"]
      ),
    ],
    placementEligible: true,
    keywords: ["supervised learning", "features and targets", "loss function", "k-nearest neighbors", "decision boundary", "train validation test split", "baselines"],
  },

  // ------------------------------------------------------------------ F3
  {
    slug: "unsupervised-learning",
    school: "F",
    code: "F3",
    title: "Unsupervised Learning",
    blurb: "Learning without labels: structure, compression, and anomalies — plus the humility to evaluate what no one can grade.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["ml-fundamentals"],
    softPrerequisites: [],
    objectives: [
      "Explain when unsupervised methods are the right tool and when they are not",
      "Apply PCA with an honest component-count decision",
      "Build anomaly detectors with defensible thresholds",
      "Evaluate unsupervised output without ground truth",
      "Scope unsupervised projects to decisions that ship",
    ],
    outcomes: [
      "A learner can run PCA and choose a component count with a stated information budget",
      "A learner can explain why distance and scaling define what similar means in clustering",
      "A learner can validate clusters with stability and silhouette checks before reporting them",
      "A learner can scope an unsupervised project to a deliverable with a decision attached",
    ],
    modules: [
      mod(
        "Learning Without Labels",
        "What to do when the targets don't exist: the four canonical unsupervised use cases and the mindset behind them.",
        ["Explain when and why unsupervised methods are the right tool", "Describe how distance choices define what similar means"],
        ["concept-check", "case-analysis"],
        [
          ch("Why Unsupervised Learning Exists", "The label problem, and the four jobs labels cannot do", [
            L("The Case for Learning Without Labels", 30, ["unlabeled data", "label cost", "structure discovery"], "Understand what to do when labels don't exist, are too expensive, or can't be trusted."),
            L("Four Use Cases: Segmentation, Structure, Compression, Anomaly", 30, ["segmentation", "dimensionality reduction", "anomaly detection"], "Map the four canonical unsupervised jobs to concrete business problems you will actually meet."),
          ]),
          ch("The Unsupervised Mindset", "No targets, no loss — structure assumptions and distances do the deciding", [
            L("No Target, No Loss: What Are We Optimizing?", 30, ["unsupervised objective", "structure assumption", "proxy criteria"], "Learn what unsupervised algorithms optimize instead — and why better always needs quotes."),
            L("Distance and Similarity: The Hidden Foundation", 30, ["distance metric", "feature scaling", "similarity"], "See how the choice of distance — and the scaling of features — quietly defines what similar means.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Dimensionality Reduction",
        "High-dimensional intuition, the curse that breaks it, and PCA as principled lossy compression.",
        ["Explain why high dimensions break distance intuition", "Run PCA, read a scree plot, and choose a component count honestly"],
        ["write-code", "interpret-results", "predict-output"],
        [
          ch("The Curse of Dimensionality", "Why neighborhoods, distances, and volume stop behaving as dimensions grow", [
            L("Why High Dimensions Break Intuition", 30, ["curse of dimensionality", "distance concentration", "sparsity"], "Explore how distances and neighborhoods misbehave as dimensions grow — and what it costs your models."),
            L("Compression as Learning", 25, ["dimensionality reduction", "reconstruction error", "information budget"], "Frame dimensionality reduction as lossy compression with an explicit information budget."),
          ]),
          ch("PCA Intuition and Practice", "Principal components, eigenvectors at intuition level, and choosing k in code", [
            L("Principal Components: Directions of Maximum Variance", 35, ["principal component analysis", "variance maximization", "orthogonal axes"], "Build PCA intuition: rotate the axes to the directions where the data actually spreads."),
            L("Eigenvectors Without Tears: The Math Under PCA", 35, ["covariance matrix", "eigenvector", "eigenvalue"], "Connect the covariance matrix's eigenvectors to principal components — at intuition level, with pictures.", "worked-example"),
            L("PCA in Code: Scree Plots and Choosing Components", 35, ["explained variance", "scree plot", "component choice"], "Run PCA, read a scree plot, and decide how many components to keep — with stated reasons.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Clustering, Density, and Anomalies",
        "Clusters, density estimates, and anomaly scoring — plus the failure modes that flood alert queues.",
        ["Distinguish clustering from density estimation and use each appropriately", "Diagnose masking, swamping, and drift in anomaly pipelines"],
        ["write-code", "dataset-task", "debug"],
        [
          ch("Clustering vs Density Estimation", "Two different dreams of structure — grouped points versus a landscape of probability", [
            L("Clusters Are Not Always There: A Caution", 25, ["cluster assumption", "imposed structure", "continuity"], "Learn why clustering algorithms always output clusters — even when the data has none.", "reading"),
            L("Density Estimation and Anomaly Scoring", 30, ["density estimation", "anomaly score", "thresholding"], "Score anomalies as points in low-density regions — and face the threshold game that follows."),
          ]),
          ch("Anomaly Detection in Practice", "Building detectors when almost everything is normal", [
            L("Anomaly Detection Without Labels", 35, ["outlier detection", "contamination", "isolation forest"], "Build anomaly detectors and set thresholds when 99% of your data is boring.", "guided-practice", 3),
            L("Masking, Swamping, and Alert Floods", 30, ["masking", "swamping", "drift"], "Diagnose the classic anomaly failures that quietly bury your alert queue in noise.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Scoping and Evaluating Unsupervised Work",
        "How to judge output nobody can grade — and how to scope projects that still ship.",
        ["Evaluate clustering and reduction output without ground truth", "Scope an unsupervised project to a decision, not a vibe"],
        ["case-analysis", "design-review", "concept-check"],
        [
          ch("Evaluating the Un-Evaluable", "Stability, cohesion-separation, and expert review when no labels exist", [
            L("Evaluation Without Ground Truth", 30, ["stability", "cohesion", "downstream utility"], "Evaluate unsupervised results with stability checks, cohesion-separation scores, and downstream utility."),
            L("When Human Judgment Is the Metric", 25, ["qualitative review", "domain expert", "actionability"], "Design expert-review loops that keep unsupervised outputs accountable to reality.", "reading"),
          ]),
          ch("Scoping Unsupervised Projects", "From find-insights to a deliverable with a decision attached", [
            L("Scoping a Project That Ships", 30, ["project scoping", "deliverable design", "success criteria"], "Turn a vague exploration request into a scoped deliverable with a decision attached.", "guided-practice"),
            L("Review: Structure Without a Supervisor", 20, ["review", "pca", "anomaly detection"], "Consolidate reduction, clustering, and anomaly thinking into one honest playbook.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Unsupervised Learning Final", 45, 20),
    projects: [
      proj(
        "PCA Compression Study",
        "Compress a high-dimensional dataset with PCA. Plot cumulative explained variance, reconstruct at 2, 10, and 50 components, and recommend a keep-count with a quantified information budget.",
        5,
        "guided",
        [
          "Scree and cumulative-variance plots with a chosen component count",
          "Reconstruction comparison at 2, 10, and 50 components",
          "A recommendation memo: keep how many, why, and what it costs",
        ],
        [
          "Component choice justified by explained variance and task need",
          "Reconstructions quantified (reconstruction error or visual)",
          "Memo states the information budget in plain language",
        ],
        ["python", "scikit-learn", "numpy", "matplotlib"]
      ),
      proj(
        "Anomaly Watchlist with a False-Alarm Budget",
        "Build an unsupervised anomaly detector over transaction-like data, set thresholds against a stated alert budget, profile what flagged rows have in common, and deliver a watchlist plus a false-alarm plan.",
        8,
        "independent",
        [
          "Detector with a documented threshold rule",
          "Profile of flagged anomalies: what they share",
          "A one-page watchlist memo with alert-budget math",
        ],
        [
          "Threshold set from the alert budget, not a default constant",
          "Flagged rows profiled with evidence, not vibes",
          "Memo covers what happens when the data drifts",
        ],
        ["python", "scikit-learn", "pandas"]
      ),
    ],
    placementEligible: true,
    keywords: ["unsupervised learning", "pca", "dimensionality reduction", "anomaly detection", "clustering", "density estimation", "explained variance"],
  },

  // ------------------------------------------------------------------ F4
  {
    slug: "ml-regression",
    school: "F",
    code: "F4",
    title: "Machine Learning for Regression",
    blurb: "Regression as machine learning: gradient-fitted linear models, regularized to behave, and reported with metrics that mean something.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["supervised-learning", "regression"],
    softPrerequisites: [],
    objectives: [
      "Retell linear regression as a model that learns by minimizing loss",
      "Implement gradient-based fitting at intuition level and in code",
      "Apply ridge, LASSO, and ElasticNet with an understanding of what each penalty does",
      "Choose regression metrics from real error costs",
      "Avoid the classic regression pitfalls: extrapolation, outliers, and leakage",
    ],
    outcomes: [
      "A learner can implement gradient descent for linear regression and diagnose divergence",
      "A learner can standardize features and tune a regularized linear model inside a pipeline",
      "A learner can read residual plots and name the model violation they reveal",
      "A learner can decide when a target transform or outlier policy is justified — and report it",
    ],
    modules: [
      mod(
        "Linear Regression as a Learning Machine",
        "Retell the statistics classic as a model that learns by descending a loss surface.",
        ["Explain MSE and MAE as pricing schemes for wrongness", "Implement gradient descent for a regression loss by hand"],
        ["write-code", "predict-output", "debug"],
        [
          ch("From Statistics to Machine Learning", "The same equation, retold as a learner minimizing a loss", [
            L("Linear Regression, Retold as a Model That Learns", 30, ["conditional mean", "linear model", "learning view"], "Re-see linear regression as a learner optimizing a loss, not just a statistics formula."),
            L("The Loss Landscape: MSE and MAE", 30, ["mean squared error", "mean absolute error", "outlier sensitivity"], "Feel how MSE punishes outliers quadratically while MAE shrugs — and what that means downstream.", "worked-example"),
          ]),
          ch("Fitting by Gradient", "Walking downhill on a loss surface, one step at a time", [
            L("Gradient Descent at Intuition Level", 35, ["gradient descent", "learning rate", "convergence"], "Watch the loss walk downhill and learn why step size and feature scale decide success."),
            L("Gradient Descent in Code: Converge, Oscillate, Diverge", 35, ["descent loop", "step size", "divergence"], "Implement the descent loop yourself and watch three learning rates behave very differently.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Regularization: Complexity Has a Price",
        "Polynomial wiggles, then ridge and LASSO: paying a complexity tax to buy generalization.",
        ["Explain what L1 and L2 penalties shrink and why it helps", "Standardize features so penalties are applied fairly"],
        ["concept-check", "write-code", "interpret-results"],
        [
          ch("Ridge and LASSO", "Penalties on coefficients: shrinkage and sparsity from two different taxes", [
            L("Overfitting a Straight Line: Polynomial Wiggles", 25, ["polynomial features", "model capacity", "wiggle"], "Watch polynomial terms turn a humble linear model into an overfitting machine.", "worked-example"),
            L("Ridge Regression: Shrinking the Wiggles", 30, ["ridge", "L2 penalty", "shrinkage"], "Add the L2 penalty, understand what alpha shrinks, and when ridge wins."),
            L("LASSO: Automatic Feature Selection", 30, ["lasso", "L1 penalty", "sparsity"], "See how the L1 penalty drives coefficients to exactly zero and builds sparse models by itself."),
          ]),
          ch("Choosing and Standardizing", "Penalty choice by feature structure, and the scaling it demands", [
            L("Ridge vs LASSO vs ElasticNet in Practice", 30, ["elasticnet", "penalty choice", "correlated features"], "Choose penalties from the structure of your features — correlated groups, sparse signals — not fashion.", "guided-practice"),
            L("Why Regularization Demands Standardization", 30, ["standardization", "scale sensitivity", "pipeline"], "See why penalties are unfair unless features share a scale — and fix it inside a pipeline.", "code"),
          ]),
        ]
      ),
      mod(
        "Metrics That Mean Something",
        "RMSE, MAE, R-squared, and the residual plots that confess what metrics hide.",
        ["Select a regression metric from how errors actually cost the business", "Read residual plots to find structure your metrics are hiding"],
        ["interpret-results", "concept-check", "case-analysis"],
        [
          ch("RMSE, MAE, and R-Squared", "Three headline metrics, each answering a different question", [
            L("RMSE and MAE: Same Units, Different Stories", 30, ["rmse", "mae", "error distribution"], "Choose between RMSE and MAE by asking how large errors actually cost your stakeholder."),
            L("R-Squared: The Metric Everyone Quotes and Few Read", 30, ["r-squared", "variance explained", "mean baseline"], "Interpret R-squared as improvement over a mean predictor — and spot its misleading edge cases.", "worked-example"),
            L("Baseline and Benchmark Regressors", 25, ["mean predictor", "naive forecast", "benchmarks"], "Anchor every regression result against dumb baselines before celebrating anything."),
          ]),
          ch("Metrics in Context", "Percentage traps, and the residual plots that tell the truth", [
            L("MAPE and Other Percentage Traps", 25, ["mape", "percentage error", "zero division"], "Understand why percentage metrics mislead near zero — and what to report instead.", "reading"),
            L("Residual Analysis: The Plots That Confess", 35, ["residuals", "heteroscedasticity", "structure in errors"], "Read residual plots like a detective: any pattern is your model confessing a missing truth.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Pitfalls and Power Moves",
        "Extrapolation, outliers, leakage, and target transforms — the regression traps and the fixes that ship.",
        ["Recognize extrapolation and target-transform decisions in real problems", "Ship a regularized regression workflow with an honest report"],
        ["dataset-task", "debug", "design-review"],
        [
          ch("Classic Regression Pitfalls", "Where linear models lie: outside their range, inside their outliers", [
            L("Extrapolation: Where Linear Models Lie Boldly", 30, ["extrapolation", "training range", "distribution shift"], "Learn why models are honest inside their data range and confident fiction outside it."),
            L("Outliers and Target Transforms", 30, ["log transform", "winsorization", "heavy tails"], "Decide when to transform the target, cap outliers, or model them as their own population.", "worked-example"),
            L("Leakage Revisited for Regression", 30, ["target leakage", "future information", "proxy features"], "Hunt the regressions that leak: features that encode the answer, the future, or the sampling.", "guided-practice"),
          ]),
          ch("Shipping a Regression Model", "The full workflow, assembled and reported like a professional", [
            L("A Regression Study End to End", 40, ["pipeline", "alpha sweep", "honest report"], "Assemble the full workflow: standardize inside a pipeline, sweep alpha, and report honestly.", "guided-practice", 3),
            L("Regression Review", 20, ["review", "regularization", "metrics"], "Lock in losses, penalties, metrics, and pitfalls before the final exam.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Machine Learning for Regression Final", 50, 22),
    projects: [
      proj(
        "Regularized House Price Models",
        "Model prices on a real estate dataset with linear, ridge, and LASSO regressions: standardize inside a pipeline, tune alpha on validation, and report which features LASSO zeroed out — and whether that matches domain sense.",
        8,
        "guided",
        [
          "Pipeline notebook with all three models on shared splits",
          "Validation curve over alpha for ridge and LASSO",
          "Report: chosen model, chosen metric, and the zeroed features reviewed",
        ],
        [
          "Standardization happens inside the pipeline, not before the split",
          "Metric choice justified by how errors cost the business",
          "LASSO's sparsity is sanity-checked against domain intuition",
        ],
        ["python", "scikit-learn", "pandas", "matplotlib"]
      ),
      proj(
        "Gradient Descent From Scratch",
        "Implement batch gradient descent for linear regression from first principles, reproduce scikit-learn's coefficients to numerical tolerance, and plot convergence for three learning rates — including one that diverges.",
        5,
        "independent",
        [
          "A gradient descent implementation with convergence history",
          "Coefficient match against sklearn's LinearRegression",
          "Three convergence plots: smooth, slow, and diverging",
        ],
        [
          "Gradients derived and verified on a toy example",
          "Diverging case explained in terms of step size",
          "Code is vectorized and readable",
        ],
        ["python", "numpy", "matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["linear regression", "gradient descent", "ridge", "lasso", "regularization", "rmse", "residual analysis", "log transform"],
  },

  // ------------------------------------------------------------------ F5
  {
    slug: "classification",
    school: "F",
    code: "F5",
    title: "Classification",
    blurb: "Classifiers from odds to thresholds: logistic regression, trees, and the confusion-matrix discipline that makes predictions cost-aware.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["supervised-learning"],
    softPrerequisites: [],
    objectives: [
      "Derive logistic regression from odds to sigmoid and use it well",
      "Read confusion matrices, precision/recall, and ROC/PR curves fluently",
      "Tune decision thresholds from explicit business costs",
      "Handle class imbalance with strategies that do not fool themselves",
      "Communicate classifier performance in dollars and decisions",
    ],
    outcomes: [
      "A learner can compute precision, recall, and F1 from a confusion matrix and explain each",
      "A learner can choose between ROC and PR curves based on class prevalence",
      "A learner can select an operating threshold from stated false-positive and false-negative costs",
      "A learner can explain why accuracy fails under imbalance and what to report instead",
    ],
    modules: [
      mod(
        "Classifiers and Their Boundaries",
        "Logistic regression built from odds to sigmoid, and decision trees — the intuitive, unstable workhorse.",
        ["Derive the sigmoid from odds and train a logistic regression", "Explain why decision trees overfit and what that implies"],
        ["concept-check", "predict-output", "write-code"],
        [
          ch("Logistic Regression from First Principles", "Odds, log-odds, and the curve that turns scores into probabilities", [
            L("From Odds to the Sigmoid", 35, ["odds", "log-odds", "sigmoid function"], "Build the logistic function step by step and see why it maps any linear score into a probability."),
            L("Logistic Loss: Why Not Just Accuracy", 30, ["log loss", "surrogate loss", "differentiability"], "Understand the smooth loss that makes logistic regression learnable — and why accuracy cannot be optimized directly."),
            L("Logistic Regression in Code", 30, ["predict_proba", "coef_", "log-odds"], "Train a logistic classifier, read its coefficients as log-odds, and predict real probabilities.", "code", 3),
          ]),
          ch("Decision Trees and Their Instability", "Greedy splits, pure leaves, and a structural allergy to small changes", [
            L("Decision Trees: Greedy Splits and Pure Leaves", 35, ["decision tree", "gini impurity", "greedy splitting"], "Grow a tree by hand and meet the myopic greedy rule that decides every split."),
            L("Why Trees Flip-Flop: Instability Demonstrated", 30, ["instability", "high variance", "perturbation"], "Perturb a handful of rows and watch the entire tree reorganize — variance you must respect.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Reading a Classifier Through Its Errors",
        "The confusion matrix, precision/recall/F1, and thresholds tuned to real costs.",
        ["Derive precision, recall, and F1 from the confusion matrix", "Tune the decision threshold from an explicit cost analysis"],
        ["interpret-results", "concept-check", "case-analysis"],
        [
          ch("The Confusion Matrix", "Four cells, four meanings, and the questions each answers", [
            L("Confusion Matrix Anatomy", 30, ["true positive", "false positive", "error taxonomy"], "Decompose predictions into four cells and learn what each one costs in the real world."),
            L("Precision, Recall, and F1", 30, ["precision", "recall", "f1 score"], "Derive precision and recall from the matrix and know which question each answers."),
            L("Threshold Tuning: The Cheapest Win in ML", 30, ["decision threshold", "operating point", "default 0.5"], "Move the threshold off 0.5 deliberately — buying back precision or recall at will.", "guided-practice", 3),
          ]),
          ch("The Cost of Being Wrong", "Pricing errors with the people who bear them", [
            L("False Positives vs False Negatives: Who Pays?", 30, ["error cost", "asymmetric costs", "stakeholder alignment"], "Price your errors with the people who bear them — before choosing any metric.", "reading"),
            L("Cost-Sensitive Classification", 30, ["class weights", "cost matrix", "threshold from costs"], "Turn a cost matrix into class weights or thresholds, and stop pretending all errors are equal.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Curves, Imbalance, and Judgement",
        "ROC and PR curves, the imbalance toolbox, and why 99% accuracy can mean nothing.",
        ["Read ROC and PR curves and choose between them by prevalence", "Compare imbalance strategies without fooling yourself"],
        ["interpret-results", "predict-output", "write-code"],
        [
          ch("ROC and PR Curves", "Every threshold at once, and the two curves that draw it", [
            L("The ROC Curve: Every Threshold at Once", 30, ["roc curve", "true positive rate", "false positive rate"], "Sweep the threshold from 0 to 1 and read the tradeoff curve every classifier paints."),
            L("Precision-Recall Curves Under Imbalance", 30, ["pr curve", "prevalence", "baseline"], "Understand why PR curves tell the truth under imbalance while ROC flatters."),
            L("AUC: What It Measures and What It Hides", 30, ["auc", "ranking metric", "limitations"], "Interpret AUC as a ranking property — and learn exactly when it misleads."),
          ]),
          ch("Class Imbalance Strategies", "Resampling, weights, and reframes that work — and the ones that lie", [
            L("Imbalanced Data: Four Honest Responses", 30, ["undersampling", "oversampling", "class weights"], "Compare undersampling, oversampling, SMOTE, and class weighting — and what not to do.", "code"),
            L("When 99% Accuracy Means Nothing", 25, ["accuracy paradox", "base rate", "minority class"], "Compute why a lazy majority classifier hits 99% on fraud data — and what to report instead.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Classification in Production Thinking",
        "A churn classifier built honestly, and the medical case that makes prevalence personal.",
        ["Deliver a classifier with a PR-curve readout and a chosen operating point", "Communicate classifier performance in dollars and decisions"],
        ["dataset-task", "case-analysis", "design-review"],
        [
          ch("A Complete Classification Workflow", "Churn end to end: baseline, model, PR curve, threshold, dollars", [
            L("End to End: A Churn Classifier with an Honest Readout", 40, ["churn model", "pr-auc", "operating point"], "Build a churn classifier and report the PR curve — with a threshold chosen from stated costs.", "guided-practice", 3),
            L("Communicating Classifiers to Stakeholders", 25, ["expected value", "dollar framing", "reporting"], "Translate matrices and curves into dollars and decisions for non-technical owners.", "reading"),
          ]),
          ch("Review", "A prevalence case study, then the whole subject on one page", [
            L("Case Study: Screening and the Prevalence Flip", 30, ["screening", "prevalence", "positive predictive value"], "Walk a medical screening example where prevalence flips the meaning of every metric.", "worked-example"),
            L("Classification Review", 20, ["review", "thresholds", "curves"], "Consolidate thresholds, curves, and costs into exam-ready mental models.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Classification Final", 55, 24),
    projects: [
      proj(
        "Churn Classifier with an Honest PR-Curve Readout",
        "Build a churn classifier on an imbalanced dataset: a majority baseline, logistic regression, and a tree model. Report the PR curve, choose an operating threshold from stated business costs, and translate the confusion matrix into expected dollars.",
        10,
        "guided",
        [
          "PR curves for all three models on the same test split",
          "A threshold memo: chosen operating point and the costs behind it",
          "Expected-dollar analysis of the confusion matrix at the threshold",
        ],
        [
          "Baseline reported alongside both models",
          "Threshold decision cites explicit FP and FN costs",
          "The dollar analysis is arithmetic, not adjectives",
        ],
        ["python", "scikit-learn", "pandas", "matplotlib"]
      ),
      proj(
        "Imbalance Strategy Bake-Off",
        "Take a heavily imbalanced dataset and compare class weights, undersampling, oversampling, and SMOTE against a plain baseline — all fit inside a cross-validated pipeline. Report PR curves and name the honest winner.",
        6,
        "independent",
        [
          "Five strategies compared on shared folds with PR curves",
          "A table of precision, recall, and PR-AUC at a fixed threshold",
          "A verdict memo naming the winner and the margin's significance",
        ],
        [
          "All resampling happens inside the folds, never before the split",
          "Comparison uses PR metrics, not accuracy",
          "Verdict acknowledges what the margin means practically",
        ],
        ["python", "scikit-learn", "imbalanced-learn", "matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["classification", "logistic regression", "confusion matrix", "precision and recall", "roc curve", "pr curve", "class imbalance", "threshold tuning"],
  },

  // ------------------------------------------------------------------ F6
  {
    slug: "clustering",
    school: "F",
    code: "F6",
    title: "Clustering",
    blurb: "k-means, hierarchies, and density: the three clustering families, their validation, and the human handoff that makes segments matter.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["unsupervised-learning", "linear-algebra"],
    softPrerequisites: [],
    objectives: [
      "Implement k-means from scratch and choose k honestly",
      "Apply hierarchical clustering and read dendrograms",
      "Use DBSCAN's density thinking for arbitrary shapes and noise",
      "Validate clusters with silhouette, stability, and expert review",
      "Turn centroid geometry into personas and decisions",
    ],
    outcomes: [
      "A learner can implement Lloyd's algorithm and k-means++ initialization and validate them against scikit-learn",
      "A learner can explain why scaling and shape assumptions decide clustering outcomes",
      "A learner can validate a clustering with silhouette and resampling stability before reporting it",
      "A learner can profile clusters into named personas and write an action memo per segment",
    ],
    modules: [
      mod(
        "k-Means from the Ground Up",
        "The most-used clustering algorithm, built by hand: the loop, the init, the k, and the scale.",
        ["Implement Lloyd's algorithm from scratch and validate it", "Diagnose k-means' shape bias and scaling sensitivity"],
        ["write-code", "predict-output", "debug"],
        [
          ch("The Algorithm", "Assign and update: the two-step loop that defines k-means", [
            L("k-Means: Assign, Update, Repeat", 30, ["k-means", "centroid", "convergence"], "Run the two-step k-means loop by hand on paper before any code touches it."),
            L("k-Means from Scratch in NumPy", 40, ["lloyd's algorithm", "vectorization", "validation"], "Implement Lloyd's algorithm vectorized and validate it against scikit-learn.", "code", 3),
            L("Initialization: Why k-means++ Exists", 30, ["initialization", "k-means++", "local optima"], "See why random starts betray k-means and how k-means++ buys reliable starts.", "worked-example"),
          ]),
          ch("Choosing k and Taming Scale", "The elbow, the silhouette, and the feature that hijacks distance", [
            L("Elbow, Silhouette, and Choosing k Honestly", 30, ["elbow method", "silhouette score", "choosing k"], "Choose the number of clusters with tools that argue back — not tools that dictate.", "guided-practice"),
            L("Scaling: The Feature That Dominates Distance", 30, ["feature scaling", "distance domination", "standardization"], "Watch one unscaled column hijack every cluster assignment — then fix it.", "worked-example"),
            L("k-Means Assumes Balls: Shape Bias", 25, ["spherical clusters", "voronoi partition", "assumption failure"], "Understand the spherical-geometry assumption built into k-means and the shapes it can never find."),
          ]),
        ]
      ),
      mod(
        "Beyond Centroids: Hierarchies and Density",
        "Dendrograms and density-based clustering: two escapes from k-means' geometry.",
        ["Read a dendrogram and choose a cut with reasons", "Tune DBSCAN's epsilon and minPts without guessing"],
        ["interpret-results", "concept-check", "dataset-task"],
        [
          ch("Hierarchical Clustering", "Bottom-up merging, linkage choices, and the dendrogram's verdict", [
            L("Agglomerative Clustering: Bottom-Up Trees", 30, ["agglomerative", "linkage", "merge order"], "Grow clusters by repeatedly merging nearest pairs — and learn what each linkage choice implies."),
            L("Dendrograms: Reading the Merge History", 30, ["dendrogram", "cut height", "granularity"], "Read a dendrogram like a family tree and choose your cut with defensible reasons.", "guided-practice", 3),
          ]),
          ch("DBSCAN and Density Thinking", "Clusters as crowded neighborhoods, noise as a first-class answer", [
            L("Density: Clusters as Crowded Neighborhoods", 30, ["dbscan", "density-based clustering", "epsilon neighborhood"], "Redefine a cluster as a dense region and meet the algorithm that finds any shape."),
            L("DBSCAN's Two Knobs: Epsilon and MinPts", 30, ["epsilon", "min_samples", "k-distance plot"], "Tune DBSCAN with k-distance plots instead of guessing epsilon blindly.", "code"),
            L("Noise Points: The Courage to Say Neither", 25, ["noise label", "border points", "outlier detection"], "Appreciate DBSCAN's third label — points that belong to no cluster at all."),
          ]),
        ]
      ),
      mod(
        "Validating Clusters",
        "Silhouettes, stability, and ground truth: separating real structure from algorithmic wishful thinking.",
        ["Compute and interpret silhouette-based validation", "Test cluster stability under resampling"],
        ["dataset-task", "interpret-results", "debug"],
        [
          ch("Metrics for Cluster Quality", "Cohesion vs separation, and internal vs external validation", [
            L("Silhouette: Cohesion vs Separation", 30, ["silhouette coefficient", "cohesion", "separation"], "Compute silhouette scores, interpret them, and learn when they reward the wrong thing."),
            L("Internal vs External Validation", 30, ["internal validation", "adjusted rand index", "ground truth"], "Separate the validation you can do alone from the validation that needs ground truth."),
          ]),
          ch("Stability and Sanity", "Distrust clusters that dissolve under resampling", [
            L("Cluster Stability Under Resampling", 30, ["stability", "bootstrap", "consensus"], "Trust clusters that survive resampling — and distrust the ones that dissolve.", "guided-practice"),
            L("Failure Modes: Clusters That Aren't", 30, ["imposed structure", "over-clustering", "noise clusters"], "Catalog how clustering invents structure from noise — and the checks that catch it.", "reading"),
          ]),
        ]
      ),
      mod(
        "Clusters for Humans",
        "From centroid coordinates to personas to decisions: the handoff that makes clustering matter.",
        ["Turn centroid geometry into named, actionable personas", "Deliver a segmentation study with validation and a decision handoff"],
        ["case-analysis", "design-review", "concept-check"],
        [
          ch("Interpreting and Communicating", "Profiling clusters into personas a stakeholder can act on", [
            L("Profiling Clusters: From Geometry to Personas", 35, ["cluster profile", "persona", "segment means"], "Turn centroid coordinates into named, memorable personas people can act on.", "guided-practice", 3),
            L("A Clustering Study End to End", 40, ["segmentation pipeline", "validation", "decision handoff"], "Segment a customer dataset end to end: scale, cluster, validate, profile, hand off.", "guided-practice", 3),
          ]),
          ch("Review", "The three algorithm families compared, then consolidated", [
            L("Choosing Among k-Means, Hierarchical, and DBSCAN", 25, ["algorithm families", "assumptions", "match to data"], "Match each clustering family to data shape, noise level, and business need."),
            L("Clustering Review", 20, ["review", "dendrogram", "silhouette"], "Lock in algorithms, validation, and human handoffs before the final.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Clustering Final", 50, 22),
    projects: [
      proj(
        "Customer Segmentation Study",
        "Segment a customer dataset end to end: scale, cluster with k-means and DBSCAN, validate with silhouette and stability checks, profile clusters into personas, and write a one-page memo recommending an action per segment.",
        9,
        "guided",
        [
          "Scaled-and-clustered analysis with both algorithms",
          "Validation: silhouette scores plus a resampling stability check",
          "Persona profiles and a one-page action memo",
        ],
        [
          "Scaling and preprocessing precede distance-based clustering",
          "The k choice is argued from evidence, not convenience",
          "Each persona ties to a concrete recommended action",
        ],
        ["python", "scikit-learn", "pandas", "matplotlib"]
      ),
      proj(
        "Implement and Stress-Test k-Means",
        "Implement k-means++ and Lloyd's iterations from scratch; stress-test on blobs, moons, and rings; and write what the failure geometry teaches about when k-means should not be trusted.",
        6,
        "independent",
        [
          "From-scratch implementation validated against sklearn on blobs",
          "Clustering results on all three synthetic shapes",
          "A short write-up of failure geometry with the plots as evidence",
        ],
        [
          "k-means++ init implemented, not just plain random",
          "Results match scikit-learn within tolerance on blobs",
          "Failure analysis names the spherical assumption explicitly",
        ],
        ["python", "numpy", "scikit-learn", "matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["clustering", "k-means", "dbscan", "hierarchical clustering", "dendrogram", "silhouette score", "customer segmentation"],
  },

  // ------------------------------------------------------------------ F7
  {
    slug: "ensemble-learning",
    school: "F",
    code: "F7",
    title: "Ensemble Learning",
    blurb: "Why crowds of models win: bagging, boosting, and stacking — built with the math underneath and the judgment to know when they are overkill.",
    difficulty: "advanced",
    track: "core",
    prerequisites: ["ml-regression", "classification"],
    softPrerequisites: [],
    objectives: [
      "Explain why ensembles reduce error and when they cannot",
      "Build bagged and random-forest models with honest feature importance",
      "Fit and tune gradient boosting, including XGBoost and LightGBM at API level",
      "Construct leakage-free stacking ensembles",
      "Judge when ensemble complexity is not worth its cost",
    ],
    outcomes: [
      "A learner can decompose error into bias, variance, and noise and name which ensemble attacks which",
      "A learner can tune a boosted model's learning rate, depth, and early stopping with reasons",
      "A learner can implement out-of-fold stacking without leakage",
      "A learner can audit feature importances and explain their failure modes",
    ],
    modules: [
      mod(
        "Why Ensembles Win",
        "The error math behind crowds of models: decorrelation, averaging, and the bias-variance budget.",
        ["Explain why averaging decorrelated models reduces error", "Diagnose when an ensemble cannot help"],
        ["concept-check", "interpret-results"],
        [
          ch("The Wisdom of Crowds of Models", "When many wrongs make a right — and when they do not", [
            L("Why Averaging Models Works", 30, ["ensemble", "error decorrelation", "averaging"], "See when and why averaging models reduces error — and when it does nothing at all."),
            L("Bias-Variance Decomposition, Practically", 35, ["bias-variance", "error budget", "variance reduction"], "Split prediction error into bias, variance, and noise — and target the right term with the right ensemble."),
          ]),
          ch("Correlation Is the Enemy", "Diversity levers, and the ceilings no vote can break", [
            L("Diversity: The Ingredient That Makes Ensembles Work", 30, ["model diversity", "decorrelation", "randomization levers"], "Learn the levers that decorrelate models: different data, features, parameters, algorithms."),
            L("When Ensembles Cannot Save You", 25, ["irreducible error", "shared bias", "diminishing returns"], "Understand the ceilings: shared bias, shared data problems, and noise no vote can remove.", "reading"),
          ]),
        ]
      ),
      mod(
        "Bagging and Random Forests",
        "Bootstrap resampling, feature lotteries, and out-of-bag validation — variance tamed by design.",
        ["Explain bagging and the extra randomness forests add", "Read feature importance with the skepticism it requires"],
        ["write-code", "interpret-results", "debug"],
        [
          ch("Bootstrap Aggregation", "Many trees on many resampled views of the data", [
            L("The Bootstrap, Reused for Models", 30, ["bootstrap sample", "bagging", "out-of-bag"], "Resample rows to grow many models on many partial views of the data."),
            L("Random Forests: Bagging Plus a Feature Lottery", 30, ["random forest", "feature subsampling", "decorrelation"], "Add the per-split feature lottery that breaks tree correlation and makes forests strong."),
            L("Out-of-Bag Scores: Validation for Free", 25, ["oob score", "honest estimate", "efficiency"], "Exploit the validation data bagging creates for free — and verify it against a holdout.", "code"),
          ]),
          ch("Feature Importance, Honestly", "Impurity importances lie; permutation importances confess", [
            L("Impurity Importance and Its Lies", 30, ["gini importance", "cardinality bias", "importance inflation"], "Learn why impurity importances adore high-cardinality features — and how to distrust them."),
            L("Permutation Importance for Forests", 30, ["permutation importance", "model-agnostic", "leakage detector"], "Measure importance by the damage of removal — and use it as a leakage detector.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Boosting: Learning From Residuals",
        "Sequential correction: shallow trees fitting what the ensemble still gets wrong, at API and intuition level.",
        ["Explain gradient boosting as functional gradient descent", "Drive XGBoost and LightGBM with tuned knobs and early stopping"],
        ["write-code", "concept-check", "predict-output"],
        [
          ch("Gradient Boosting Mechanics", "The evolutionary loop: add, shrink, and stop early", [
            L("Boosting: The Evolutionary Loop", 30, ["boosting", "sequential correction", "residual fitting"], "Follow the additive logic: each shallow tree corrects what the ensemble still gets wrong."),
            L("The Gradient in Gradient Boosting", 35, ["functional gradient descent", "learning rate", "additive modeling"], "See boosting as gradient descent in function space — at intuition level, without the calculus wall."),
            L("Shrinkage, Depth, and Early Stopping", 30, ["learning rate", "n_estimators", "early stopping"], "Tune the three knobs that steer boosting's bias-variance trajectory.", "worked-example"),
          ]),
          ch("Modern Boosting Libraries", "XGBoost and LightGBM at API level, with their native superpowers", [
            L("XGBoost and LightGBM at API Level", 35, ["xgboost", "lightgbm", "api mapping"], "Train both libraries, map their APIs to scikit-learn idioms, and know when each wins.", "code", 3),
            L("Categorical and Missing Values in Boosters", 30, ["native categorical", "missing direction", "split handling"], "Use native categorical and missing-value handling — and verify it helps rather than hurts.", "code"),
          ]),
        ]
      ),
      mod(
        "Stacking and Judgment",
        "Meta-learners over diverse bases — built without leakage — and the judgment to skip ensembles when they do not pay.",
        ["Build a leakage-free stacking ensemble from out-of-fold predictions", "Decide when ensemble complexity is not worth its cost"],
        ["case-analysis", "design-review", "debug"],
        [
          ch("Stacked Ensembles", "A model that learns to blend models — honestly or not at all", [
            L("Stacking: Learning to Blend Models", 30, ["stacking", "meta-learner", "diversity requirement"], "Combine heterogeneous models with a meta-learner — over genuinely diverse base learners."),
            L("Out-of-Fold Stacking in Code", 35, ["out-of-fold predictions", "cross_val_predict", "leakage-proof stacking"], "Implement stacking on out-of-fold predictions and avoid the classic leak.", "code", 3),
          ]),
          ch("Ensemble Judgment", "The times the forest should stay unplanted", [
            L("When Ensembles Are Overkill", 30, ["complexity budget", "interpretability", "maintenance cost"], "Choose against ensembles when latency, transparency, or maintenance dominates raw accuracy."),
            L("Ensemble Review", 20, ["review", "bagging", "boosting", "stacking"], "Consolidate the three ensemble families and their tradeoffs before the final.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Ensemble Learning Final", 55, 22),
    projects: [
      proj(
        "Tabular Shootout: Linear vs Forest vs Boosted",
        "On two real tabular datasets, build the best tuned linear model, random forest, and gradient booster you can within a fixed compute budget — and report where each family wins, with the validation protocol that makes the comparison fair.",
        10,
        "independent",
        [
          "Three tuned model families per dataset on shared folds",
          "A comparison table with uncertainty per dataset",
          "A written verdict on which family wins where — and why",
        ],
        [
          "Same folds, same preprocessing, same tuning budget per family",
          "Results reported with fold-level variance",
          "Verdict references the datasets' structure, not folklore",
        ],
        ["python", "scikit-learn", "xgboost", "pandas"]
      ),
      proj(
        "A Stacking Ensemble Without Leakage",
        "Build a stacking ensemble over three diverse base learners using strictly out-of-fold predictions. Quantify the gain against your best single model, and document what breaks if the out-of-fold discipline is skipped.",
        8,
        "independent",
        [
          "Out-of-fold stacking implementation with a meta-learner",
          "Gain analysis versus the best single model on a final holdout",
          "A leakage demonstration: what happens when stacking is done naively",
        ],
        [
          "Out-of-fold discipline verifiable in the code",
          "Gain reported with uncertainty, including ties",
          "The naive-stacking comparison quantifies the inflation",
        ],
        ["python", "scikit-learn", "numpy"]
      ),
    ],
    placementEligible: true,
    keywords: ["ensemble learning", "bagging", "random forest", "gradient boosting", "xgboost", "lightgbm", "stacking", "feature importance"],
  },

  // ------------------------------------------------------------------ F8
  {
    slug: "feature-engineering",
    school: "F",
    code: "F8",
    title: "Feature Engineering",
    blurb: "The craft that decides model quality before any algorithm runs — transforms, encodings, and pipelines that cannot leak.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["supervised-learning"],
    softPrerequisites: [],
    objectives: [
      "Transform numeric features with log, winsorizing, and binning — fitted on training data only",
      "Encode categoricals without inventing order or leaking targets",
      "Engineer datetime and text features at intro level",
      "Build ColumnTransformer pipelines that are reproducible and leakage-proof",
      "Prune features that do not earn their keep",
    ],
    outcomes: [
      "A learner can build a ColumnTransformer pipeline for mixed feature types and explain why it cannot leak",
      "A learner can choose encodings by cardinality and model family, with leakage warnings stated",
      "A learner can quantify the value of a feature family with a validation-backed measurement",
      "A learner can design datetime features that respect point-in-time correctness",
    ],
    modules: [
      mod(
        "The Feature Mindset",
        "Models only know what features tell them — and every transform must learn from training data only.",
        ["Adopt the leakage-first mindset for every feature decision", "Choose numeric transforms by the pathology in front of you"],
        ["concept-check", "write-code", "debug"],
        [
          ch("Garbage In, Garbage Out", "Representation is reality for a model — and leakage is the occupational disease", [
            L("Features Are the Model's Entire World", 25, ["feature representation", "information exposure", "model food"], "Internalize the truth that models only know what features tell them — nothing more."),
            L("The Leakage-First Mindset", 30, ["data leakage", "fit on train only", "transform discipline"], "Adopt the habit that prevents most leakage: every transform learns from training data only."),
          ]),
          ch("Numeric Feature Transforms", "Taming skew, outliers, and continuous excess", [
            L("Log, Sqrt, and the Taming of Skew", 30, ["log transform", "skewness", "monotone transforms"], "Reshape skewed features with monotone transforms — and know when each one applies.", "code"),
            L("Winsorizing and Clipping Outliers", 30, ["winsorize", "clipping", "outlier policy"], "Contain extreme values with principled caps — fitted on training data and reused forever.", "guided-practice"),
            L("Binning: When Discrete Beats Continuous", 25, ["discretization", "bin boundaries", "signal loss"], "Turn continuous features into interpretable bins — and learn when binning destroys signal."),
          ]),
        ]
      ),
      mod(
        "Categorical Features Without Regret",
        "One-hot, ordinal, and target encoding — with the leakage discipline each demands.",
        ["Choose encodings by cardinality and model family", "Apply target encoding without leaking the target"],
        ["write-code", "predict-output", "case-analysis"],
        [
          ch("Encoding Strategies", "Three encodings, three very different failure modes", [
            L("One-Hot Encoding and the Dimension Explosion", 30, ["one-hot", "dummy variables", "high cardinality"], "Encode categories as indicators and manage the width cost on wide, wild columns.", "code"),
            L("Ordinal Encoding: Only When Order Is Real", 25, ["ordinal encoding", "invented order", "likert scales"], "Reserve integer codes for genuinely ordered categories — never invent an order the data does not have."),
            L("Target Encoding and the Leakage Minefield", 35, ["target encoding", "smoothing", "out-of-fold encoding"], "Use the most powerful categorical encoding with out-of-fold discipline — or it lies to you.", "worked-example", 3),
          ]),
          ch("Scale and Interactions", "Picking scalers with reasons, and features that meet each other", [
            L("StandardScaler, MinMax, Robust: Choosing", 30, ["standardization", "min-max", "robust scaling"], "Pick a scaling strategy by algorithm family and data pathology — not by habit.", "code", 3),
            L("Interaction Features: Let Features Meet", 30, ["interactions", "polynomial features", "domain mechanisms"], "Hand-craft products and ratios that encode real mechanisms linear models cannot see.", "guided-practice"),
          ]),
        ]
      ),
      mod(
        "Time, Text, and Composite Signals",
        "Datetimes mined without time travel, and text turned into numbers at intro level.",
        ["Build datetime and lag features that never peek at the future", "Produce bag-of-words and TF-IDF features and know their pitfalls"],
        ["write-code", "dataset-task", "predict-output"],
        [
          ch("Datetime Features", "Cycles, recency, and the temporal leakage that ruins them", [
            L("Mining Datetimes: Components and Recency", 30, ["datetime features", "recency", "period extraction"], "Extract hour, day, month — and encode cycles as sin and cos so midnight meets itself.", "code"),
            L("Time Features Without Time Travel", 30, ["temporal leakage", "point-in-time correctness", "lag features"], "Build recency and lag features that never peek at the future.", "guided-practice"),
          ]),
          ch("Text Features at Intro Level", "Bag of words, TF-IDF, and the drift that breaks them", [
            L("Bag of Words and TF-IDF in One Sitting", 30, ["bag of words", "tf-idf", "sparse matrices"], "Turn text into sparse numeric features and understand what the weighting fixes.", "code"),
            L("Text Pitfalls: Vocabulary Drift and Case", 25, ["vocabulary drift", "unseen tokens", "normalization"], "Handle casing, vocabularies, and unseen words without silent breakage at serving time.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Pipelines and Selection",
        "Composable, reproducible, leakage-proof pipelines — and pruning features that do not earn their keep.",
        ["Build ColumnTransformer pipelines that cannot leak", "Prune features with validated, reproducible methods"],
        ["dataset-task", "design-review", "debug"],
        [
          ch("Feature Pipelines in Code", "One artifact that runs identically at train and serve time", [
            L("ColumnTransformer and Pipeline: Composable Featurization", 35, ["columntransformer", "sklearn pipeline", "fit-only-on-train"], "Build leakage-proof pipelines that apply different transforms to different columns.", "code", 3),
            L("Reproducibility: Same Features at Train and Serve", 25, ["train-serve skew", "artifact discipline", "serialization"], "Ensure the exact same transformation runs in training and production — from one artifact."),
          ]),
          ch("Selection and Review", "Dropping features that do not earn their keep, then consolidating", [
            L("Feature Selection: Drop What Doesn't Earn", 30, ["filter methods", "embedded selection", "importance pruning"], "Prune features with filters and embedded methods — validated at every step.", "guided-practice"),
            L("Feature Engineering Review", 20, ["review", "encodings", "pipelines"], "Consolidate transforms, encodings, and pipeline discipline before the final.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Feature Engineering Final", 50, 22),
    projects: [
      proj(
        "The Leakage-Proof Feature Factory",
        "Build a ColumnTransformer pipeline for a messy tabular dataset — skewed numerics, high-cardinality categoricals, datetimes, and a text column — then prove no leakage by reporting scores with transforms inside vs outside the folds, and explain the gap.",
        10,
        "independent",
        [
          "A working pipeline handling all four feature families",
          "Inside-vs-outside folds comparison quantifying the leakage risk",
          "A write-up of each transform and why it must live inside the folds",
        ],
        [
          "All transforms (including target encoding) fit within folds",
          "The gap between the two scores is explained, not just observed",
          "Pipeline runs end to end without manual steps",
        ],
        ["python", "scikit-learn", "pandas", "numpy"]
      ),
      proj(
        "Feature Bake-Off: Measuring What Each Family Buys",
        "Start from a raw dataset and add feature families one at a time — numeric transforms, encodings, interactions, datetime — measuring validation gain at each step. Deliver a chart of gain-per-family and a final keep list.",
        6,
        "guided",
        [
          "A stepwise notebook measuring each family's contribution",
          "A gain-per-family chart with error bars",
          "A final keep-list of features with reasons",
        ],
        [
          "Each family's gain measured on identical splits",
          "Gains reported with fold-level uncertainty",
          "Keep-list prunes features that did not earn their place",
        ],
        ["python", "scikit-learn", "pandas", "matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["feature engineering", "one-hot encoding", "target encoding", "feature scaling", "interaction features", "columntransformer", "data leakage", "datetime features"],
  },

  // ------------------------------------------------------------------ F9
  {
    slug: "model-evaluation",
    school: "F",
    code: "F9",
    title: "Model Evaluation",
    blurb: "Evaluation as an engineering discipline: cross-validation done right, significance done honestly, and reports that survive hostile review.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["supervised-learning", "hypothesis-testing"],
    softPrerequisites: [],
    objectives: [
      "Design evaluations that answer the deployment question",
      "Run cross-validation with preprocessing inside the folds",
      "Test model differences for statistical significance",
      "Audit for leakage and assess calibration",
      "Write evaluation reports that state uncertainty and limitations",
    ],
    outcomes: [
      "A learner can choose split designs (grouped, temporal, stratified) that match deployment reality",
      "A learner can run a leakage audit on a dataset and model with a concrete checklist",
      "A learner can read a reliability diagram and decide whether probabilities need recalibration",
      "A learner can report model comparisons with fold-level uncertainty and paired statistics",
    ],
    modules: [
      mod(
        "The Evaluation Mindset",
        "Evaluation is modeling the decision: design it to answer the deployment question, not the leaderboard question.",
        ["Design an evaluation around the actual deployment decision", "Choose metrics that reflect real error costs"],
        ["concept-check", "case-analysis"],
        [
          ch("Evaluation Before Modeling", "The question your evaluation must answer comes first", [
            L("Evaluation as Modeling the Decision", 30, ["evaluation design", "deployment question", "proxy risk"], "Design the evaluation to answer the deployment question — not the leaderboard question."),
            L("The Evaluation Matrix: Choices That Shape Answers", 30, ["split design", "metric choice", "protocol"], "See evaluation as a matrix of choices — split, metric, protocol, uncertainty — each changing the answer."),
          ]),
          ch("Metrics for Real Costs", "From a business loss table to the metric your model optimizes", [
            L("Matching Metrics to Business Costs", 30, ["cost matrix", "expected cost", "utility metric"], "Convert a business loss table into the metric your model should optimize.", "worked-example"),
            L("Ranking, Regression, and Probability Metrics", 30, ["metric families", "ranking metrics", "calibration loss"], "Choose among metric families by what the consumer needs: decisions, rankings, or probabilities."),
          ]),
        ]
      ),
      mod(
        "Cross-Validation Done Right",
        "k-fold mechanics, the leaks that corrupt them, and the statistical honesty small datasets demand.",
        ["Run k-fold CV and report fold-to-fold uncertainty", "Select group and temporal splits that match deployment reality"],
        ["write-code", "interpret-results", "debug"],
        [
          ch("The Mechanics and the Violations", "Folds that tell the truth, and the rituals that keep them honest", [
            L("k-Fold Cross-Validation Mechanics", 30, ["k-fold", "validation estimate", "variance across folds"], "Run k-fold CV, read the fold-to-fold spread, and report uncertainty like a professional."),
            L("Where CV Lies: Preprocessing Inside the Fold", 35, ["fold leakage", "pipeline in cv", "scaling on folds"], "Put every transform inside the CV loop — and learn the subtle leaks when you do not.", "code", 3),
            L("Grouped and Time-Series Splits", 35, ["groupkfold", "temporal validation", "entity overlap"], "Prevent the twin catastrophes: the same user in two folds, and the future in your training data."),
          ]),
          ch("Statistical Honesty", "Significance for model differences, and the many-look trap", [
            L("Is Model A Really Better? Paired Comparisons", 30, ["paired test", "fold variance", "significance"], "Test model differences with paired statistics — stop trusting one lucky fold.", "worked-example"),
            L("The Multiple Comparisons Trap", 25, ["multiple comparisons", "adaptive overfitting", "winner's curse"], "Understand how trying many models on one validation set overfits it — and the humility it demands.", "reading"),
          ]),
        ]
      ),
      mod(
        "Leakage Detection and Calibration",
        "Forensics for too-good-to-be-true scores, and probabilities that have to mean what they say.",
        ["Audit a dataset and model for leakage with a concrete checklist", "Assess calibration and decide when to fix it"],
        ["dataset-task", "case-analysis", "interpret-results"],
        [
          ch("Leakage Forensics", "Feature provenance, suspicious scores, and a casebook of famous leaks", [
            L("Auditing Datasets for Leakage", 30, ["leakage audit", "feature provenance", "too-good-to-be-true"], "Run a leakage audit: suspicious names, suspicious AUCs, suspicious timing.", "guided-practice", 3),
            L("Too Good to Be True: A Forensics Casebook", 30, ["forensics", "case studies", "sanity benchmarks"], "Study famous leakage patterns — the future field, the duplicate patient, the post-outcome timestamp.", "reading"),
          ]),
          ch("Calibration at Intro Level", "When a probability of 0.7 must mean 70 percent", [
            L("Are Predicted Probabilities Honest?", 30, ["calibration", "reliability diagram", "brier score"], "Check whether a model's 0.7 really happens about 70% of the time — and why it matters for decisions."),
            L("Calibration Curves in Code", 30, ["calibration curve", "platt scaling", "isotonic regression"], "Plot reliability diagrams and decide when to recalibrate before acting on probabilities.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Reports That Survive Review",
        "The evaluation report as an engineering artifact — assumptions, uncertainty, limitations, all in the open.",
        ["Write an evaluation report that states question, protocol, and limits", "Review an evaluation plan and find the flaws that would sink it"],
        ["design-review", "interpret-results", "concept-check"],
        [
          ch("The Evaluation Report", "Question, protocol, metric, uncertainty, limitations — in that order", [
            L("Anatomy of an Evaluation Report", 30, ["evaluation report", "uncertainty", "limitations"], "Write evaluations that state the question, protocol, metric, uncertainty, and limitations — explicitly."),
            L("Tearing Down a Real Evaluation", 30, ["design review", "protocol critique", "flaw finding"], "Review a real evaluation plan and find the five flaws that would sink it.", "guided-practice"),
          ]),
          ch("Review and Consolidation", "The anti-patterns checklist, then the subject in one map", [
            L("The Evaluation Anti-Patterns Checklist", 25, ["anti-patterns", "test set reuse", "metric cherry-picking"], "Memorize the checklist of evaluation sins — from test-set reuse to metric cherry-picking.", "reading"),
            L("Model Evaluation Review", 20, ["review", "cross-validation", "calibration"], "Consolidate splits, significance, leakage, and calibration before the final.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Model Evaluation Final", 50, 22),
    projects: [
      proj(
        "The Evaluation Audit",
        "A colleague hands you a model, a dataset, and a claimed 0.95 AUC. Design and run an evaluation that either confirms or destroys the claim: protocol design, leakage forensics, significance, and a written audit with a verdict.",
        8,
        "independent",
        [
          "An audit protocol memo written before any code runs",
          "A leakage forensics report on features and splits",
          "A final audit: the confirmed or corrected score with uncertainty",
        ],
        [
          "The protocol is designed to answer the deployment question",
          "Leakage checks are concrete and evidence-based",
          "The verdict distinguishes score inflation from real performance",
        ],
        ["python", "scikit-learn", "pandas"]
      ),
      proj(
        "Split Design Lab: Random vs Group vs Time",
        "On a dataset with repeated users and timestamps, quantify how a naive random split inflates scores compared with GroupKFold and a temporal split — and report the inflation with fold-level variance.",
        5,
        "guided",
        [
          "Three split designs run on identical models and features",
          "A table of scores with fold-level variance per design",
          "A write-up: which split mirrors deployment, and why",
        ],
        [
          "Entity overlap demonstrated and quantified",
          "Temporal split respects time direction strictly",
          "Inflation explained in terms of information reuse",
        ],
        ["python", "scikit-learn", "pandas"]
      ),
    ],
    placementEligible: true,
    keywords: ["model evaluation", "cross-validation", "data leakage", "calibration", "groupkfold", "statistical significance", "evaluation report"],
  },

  // ------------------------------------------------------------------ F10
  {
    slug: "model-selection",
    school: "F",
    code: "F10",
    title: "Model Selection",
    blurb: "Choosing models like a professional: baselines first, ablations that reveal the truth, and selection under real constraints.",
    difficulty: "advanced",
    track: "core",
    prerequisites: ["model-evaluation"],
    softPrerequisites: [],
    objectives: [
      "Compare models honestly with baselines and fair protocols",
      "Connect complexity to generalization and apply Occam operationally",
      "Design and run ablation studies",
      "Design validation strategies that answer specific questions",
      "Choose under latency, interpretability, and cost constraints — and document it",
    ],
    outcomes: [
      "A learner can build a baseline ladder and state when complexity pays rent",
      "A learner can run an ablation study and identify the components that carry performance",
      "A learner can design a validation scheme that simulates the deployment scenario",
      "A learner can write a model card and a selection decision record",
    ],
    modules: [
      mod(
        "Comparing Models Honestly",
        "The baseline ladder, fair protocols, and statistics that can tell a tie from a win.",
        ["Build the baseline ladder from rules to serious models", "Compare candidates with shared folds and paired statistics"],
        ["concept-check", "interpret-results"],
        [
          ch("Baselines First", "Every point of complexity must pay rent above the dumb models", [
            L("The Baseline Ladder: Dumb to Simple to Serious", 30, ["baseline ladder", "trivial models", "paying rent"], "Climb from rules to linear models to sophisticated ones — and demand each step pay rent."),
            L("How Much Is That Extra Point Worth?", 25, ["improvement significance", "deployment cost", "diminishing returns"], "Interpret small metric gains against deployment costs — with uncertainty stated out loud."),
          ]),
          ch("Fair Comparison Protocols", "Same folds, same data, same chance — or the comparison lies", [
            L("Fair Fights: Shared Splits and Seeds", 30, ["fair comparison", "shared folds", "variance control"], "Compare models on identical folds with shared randomness — the only fair fight."),
            L("Statistical Comparison of Competing Models", 35, ["paired test", "confidence intervals", "decision rules"], "Apply paired tests and intervals to crown a winner — or declare a tie honestly.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Complexity and Generalization",
        "Capacity versus the generalization gap, and ablations that reveal what actually works.",
        ["Connect model capacity to the train-test gap", "Design and read an ablation study"],
        ["case-analysis", "design-review"],
        [
          ch("The Complexity Dial", "Degrees of freedom, and Occam's razor made operational", [
            L("Capacity, Degrees of Freedom, and the Gap", 30, ["model capacity", "generalization gap", "effective complexity"], "Connect model capacity to the gap between train and test performance."),
            L("Occam's Razor, Operationally", 25, ["parsimony", "tie-breaking", "simplicity bias"], "Operationalize Occam: among equal performers, ship the simplest thing that works.", "reading"),
          ]),
          ch("Ablation Studies", "Removing parts to find the ones that carry the model", [
            L("Ablations: What Actually Carries the Model?", 35, ["ablation study", "feature ablation", "component ablation"], "Remove features and components one at a time to find what does the real work.", "guided-practice", 3),
            L("Ablation Surprises: The Two-Feature Model That Ties", 30, ["minimal models", "surprising ablations", "simplification wins"], "Study cases where ablation reveals two features doing the work of fifty.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Validation Strategy Design",
        "Splits designed to answer specific questions — nested validation, shift tests, and leaderboards that lie.",
        ["Design validation schemes that simulate deployment", "Explain nested validation and the leaderboard fallacy"],
        ["dataset-task", "write-code", "interpret-results"],
        [
          ch("Matching Splits to Questions", "Each question gets the split that can honestly answer it", [
            L("What Split Answers What Question", 30, ["split design", "question-driven validation", "deployment simulation"], "Match each validation scheme to the exact question it can honestly answer."),
            L("Validation for Time and Entity Effects", 35, ["temporal splits", "entity splits", "shift simulation"], "Design splits that simulate the future and unseen customers — not random luck."),
            L("Stress Tests: Validation Under Shift", 30, ["stress testing", "slices", "worst-case evaluation"], "Stress-test models on slices and shifted data before production embarrasses you.", "guided-practice", 3),
          ]),
          ch("Nested Validation and the Tuning Trap", "Selecting without self-deception", [
            L("Nested CV: Selecting Without Self-Deception", 35, ["nested cross-validation", "selection bias", "unbiased estimates"], "Understand why tuning on your comparison folds inflates results — and how nesting fixes it.", "code", 3),
            L("The Leaderboard Fallacy", 25, ["leaderboard overfitting", "validation reuse", "winner's curse"], "Internalize why the leaderboard winner is usually not the best model.", "reading"),
          ]),
        ]
      ),
      mod(
        "Choosing Under Constraints",
        "Latency, cost, and interpretability as first-class objectives — documented like they matter.",
        ["Weigh accuracy against latency, cost, and explainability", "Produce a model card that survives regulatory review"],
        ["design-review", "case-analysis"],
        [
          ch("Real-World Constraints", "The objective function is not accuracy — it is the deployment", [
            L("Latency, Cost, Interpretability: The Real Objective", 30, ["latency budget", "inference cost", "interpretability needs"], "Weigh accuracy against latency, compute cost, and explainability demands — with numbers."),
            L("The Selection Decision Record", 30, ["decision record", "alternatives table", "rationale"], "Document candidates, constraints, and rationale so the choice survives review.", "guided-practice"),
          ]),
          ch("Model Cards and Final Reporting", "What the model is for, and where it fails — on the record", [
            L("Model Cards: What, For Whom, Where It Fails", 30, ["model card", "intended use", "limitations"], "Write a model card that states intended use, data, metrics, slices, and failure modes."),
            L("Model Selection Review", 20, ["review", "baselines", "nested validation"], "Consolidate honest comparison, ablations, and constraint-driven choice.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Model Selection Final", 55, 20),
    projects: [
      proj(
        "The Model Selection Dossier",
        "Given three candidate models, one messy dataset, and real constraints (latency, interpretability), produce a complete selection dossier: fair comparison with shared folds, an ablation study, a validation design memo, a model card for the winner, and a recommendation with its strongest dissent recorded.",
        12,
        "capstone",
        [
          "A fair-comparison table with paired statistics",
          "An ablation study isolating what carries performance",
          "A model card for the winner and a one-page recommendation memo with the strongest dissent recorded",
        ],
        [
          "Comparison protocol is fair and stated before results",
          "Ablation results drive the final recommendation",
          "Constraints (latency, interpretability) appear as first-class criteria",
          "The dissent is recorded honestly, not strawmanned",
        ],
        ["python", "scikit-learn", "pandas", "matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["model selection", "baselines", "ablation study", "nested cross-validation", "model card", "generalization", "decision record"],
  },

  // ------------------------------------------------------------------ F11
  {
    slug: "hyperparameter-tuning",
    school: "F",
    code: "F11",
    title: "Hyperparameter Tuning",
    blurb: "The knobs above the learning: search spaces, strategies, and budgets — tuned without fooling the validation set.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["model-evaluation", "optimization"],
    softPrerequisites: [],
    objectives: [
      "Distinguish hyperparameters from parameters and design search spaces",
      "Run grid, random, and Bayesian searches with realistic budgets",
      "Apply early stopping and Hyperband-style budget allocation",
      "Recognize and prevent validation-set overfitting",
      "Maintain tuning hygiene: fixed seeds, logged runs, reproducibility",
    ],
    outcomes: [
      "A learner can define a search space with sensible ranges and log scales for scale-sensitive knobs",
      "A learner can run RandomizedSearchCV with a stated compute budget and fold discipline",
      "A learner can explain why heavy tuning overfits the validation set and how to defend against it",
      "A learner can run a complete tuning campaign with early stopping and a final holdout verdict",
    ],
    modules: [
      mod(
        "Hyperparameters: The Knobs Above Learning",
        "What you decide versus what the model learns — and how to design the space you search.",
        ["Distinguish parameters from hyperparameters with examples", "Design search spaces with sensible ranges and scales"],
        ["concept-check", "design-review"],
        [
          ch("Parameters vs Hyperparameters", "Who sets what, and why the distinction matters", [
            L("Parameters vs Hyperparameters: Who Sets What", 25, ["hyperparameter", "parameter", "configuration"], "Separate what the model learns from what you decide — and why the distinction matters."),
            L("A Field Guide to the Knobs That Matter", 30, ["learning rate", "tree depth", "regularization strength"], "Tour the handful of knobs that matter across model families — and their sensible ranges.", "reading"),
          ]),
          ch("Search Spaces", "Ranges, scales, and conditional structure", [
            L("Defining a Search Space: Ranges and Scales", 30, ["search space", "log scale", "plausible ranges"], "Choose ranges and scales so your search actually covers the plausible good configurations."),
            L("Conditional and Hierarchical Spaces", 30, ["conditional hyperparameters", "nested options", "search structure"], "Structure searches when knobs only exist conditionally — boosted trees as the running example."),
          ]),
        ]
      ),
      mod(
        "Search Strategies",
        "Grid, random, Bayesian, and early-stopping strategies — matched to budgets and costs.",
        ["Explain why random search beats grid in high dimensions", "Apply early stopping to kill hopeless configurations early"],
        ["write-code", "predict-output", "dataset-task"],
        [
          ch("Grid, Random, and the Budget", "Exhaustive grids, clever sampling, and the scikit-learn drivers", [
            L("Grid Search: Exhaustive and Expensive", 30, ["grid search", "combinatorial explosion", "exhaustiveness"], "Feel the combinatorial explosion — and learn when a small grid is still right.", "code"),
            L("Random Search and the High-Dimensional Argument", 30, ["random search", "coverage", "important subspace"], "Understand the classic result: random search wins when only a few knobs matter.", "worked-example"),
            L("Running Searches: GridSearchCV and RandomizedSearchCV", 35, ["gridsearchcv", "randomizedsearchcv", "n_iter budget"], "Drive both search classes with proper budgets, folds, and pipelines inside.", "code", 3),
          ]),
          ch("Smarter Search", "Model-guided search and ruthless early termination", [
            L("Bayesian Optimization at Intuition Level", 35, ["bayesian optimization", "surrogate model", "acquisition function"], "Learn how sequential model-guided search beats blind guessing when evaluations cost real money."),
            L("Hyperband and Early Stopping: Kill Losers Early", 30, ["hyperband", "successive halving", "early stopping"], "Terminate hopeless configurations early and spend the budget where it counts.", "code"),
          ]),
        ]
      ),
      mod(
        "The Tuning Loop and Its Pathologies",
        "Budgets, validation hygiene, and the quiet overfitting of the validation set itself.",
        ["Plan a tuning campaign with an explicit budget", "Recognize and defend against validation-set overfitting"],
        ["case-analysis", "design-review", "concept-check"],
        [
          ch("Budgets and Validation Hygiene", "The loop, the budget, and the silent killer", [
            L("The Tuning Loop: Budget, Schedule, Stopping", 30, ["tuning loop", "compute budget", "stopping rules"], "Plan a tuning campaign: what to search, how long, and when good enough is good enough."),
            L("Overfitting the Validation Set", 30, ["adaptive overfitting", "validation reuse", "holdout renewal"], "See how heavy tuning quietly overfits the validation set — and the defenses that keep scores honest.", "reading"),
          ]),
          ch("Tuning Hygiene and Judgment", "Reproducible campaigns, a full case study, and review", [
            L("Hygiene: Same Folds, Fixed Seeds, Logged Everything", 30, ["reproducibility", "experiment logging", "tuning hygiene"], "Adopt the hygiene that makes tuning reproducible: fixed seeds, versioned data, logged runs.", "guided-practice"),
            L("Case Study: Tuning Boosted Trees End to End", 40, ["xgboost tuning", "learning rate schedule", "early stopping rounds"], "Run a complete tuning campaign on a boosted-tree model with a defensible budget.", "guided-practice", 3),
            L("Hyperparameter Tuning Review", 20, ["review", "search strategies", "hygiene"], "Consolidate strategies, budgets, and pathologies before the final.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Hyperparameter Tuning Final", 45, 18),
    projects: [
      proj(
        "A Tuning Campaign with a Compute Budget",
        "Run a full tuning campaign on a boosted-tree model: grid and random search plus early stopping, under a fixed compute budget. Report the gain-per-compute curve, the validation-hygiene protocol you enforced, and the final holdout verdict.",
        10,
        "independent",
        [
          "A logged campaign: searches, budgets, and best configurations",
          "A gain-per-compute chart across strategies",
          "A final holdout verdict comparing validation winner vs honest score",
        ],
        [
          "Budget discipline is explicit and respected",
          "Validation hygiene (folds, seeds, logging) documented",
          "Holdout verdict discusses validation overfitting honestly",
        ],
        ["python", "scikit-learn", "xgboost", "jupyter"]
      ),
      proj(
        "Search Space Design Review",
        "Three teams submit flawed search spaces for the same model: wrong scales, implausible ranges, no budget. Review each against the course's design rules and rewrite one into a defensible campaign plan.",
        4,
        "guided",
        [
          "A written review of each space: what is wrong and why",
          "A rewritten search space with scales, ranges, and budget justified",
          "A one-paragraph campaign plan for the rewritten space",
        ],
        [
          "Reviews cite concrete principles (log scales, plausible ranges, budgets)",
          "The rewrite fixes every named flaw",
          "The campaign plan states stopping rules and hygiene",
        ],
        ["python", "scikit-learn"]
      ),
    ],
    placementEligible: true,
    keywords: ["hyperparameter tuning", "grid search", "random search", "bayesian optimization", "early stopping", "search space", "validation overfitting"],
  },

  // ------------------------------------------------------------------ F12
  {
    slug: "model-interpretation",
    school: "F",
    code: "F12",
    title: "Model Interpretation",
    blurb: "Opening the black box honestly: importances, dependencies, SHAP, and counterfactuals — with their limits stated out loud.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["model-evaluation"],
    softPrerequisites: [],
    objectives: [
      "Choose global versus local explanation tools by the question asked",
      "Apply permutation importance, PDPs, and ICE curves with their traps in view",
      "Explain SHAP values at intuition level and use them in practice",
      "Generate counterfactual explanations and test explanation faithfulness",
      "Report interpretation results without causal overreach",
    ],
    outcomes: [
      "A learner can distinguish global and local explanations and pick the right tool for each audience",
      "A learner can compute and interpret SHAP value plots for a trained model",
      "A learner can diagnose correlated-feature traps in permutation importance",
      "A learner can state honestly what an explanation can and cannot claim, including causality limits",
    ],
    modules: [
      mod(
        "Why Interpretation Matters",
        "Debugging, trust, and regulation: the three audiences, and the global-versus-local map of tools.",
        ["Match interpretation needs to the right tool category", "Explain when interpretability is a hard requirement"],
        ["concept-check", "case-analysis"],
        [
          ch("The Three Audiences", "Engineers debug, stakeholders trust, regulators require", [
            L("Debug, Trust, Regulate: Three Reasons to Interpret", 25, ["interpretation", "debugging", "regulatory compliance"], "Meet the three audiences of interpretation — engineers, stakeholders, regulators — and their questions."),
            L("The Black-Box Tax", 25, ["interpretability tradeoff", "explainability requirements", "domain norms"], "Understand when interpretability is a hard requirement, not a nice-to-have.", "reading"),
          ]),
          ch("Global vs Local Explanation", "Which question are you actually answering?", [
            L("Global vs Local: Which Question Are You Answering?", 30, ["global explanation", "local explanation", "question mapping"], "Match what-drives-the-model and why-this-prediction questions to the right family of tools."),
            L("The Interpretation Stack: A Preview", 30, ["coefficients", "importances", "attributions"], "Preview the toolbox — coefficients, importances, plots, attributions — and when each is honest."),
          ]),
        ]
      ),
      mod(
        "Global Explanation Tools",
        "Permutation importance and its traps, partial dependence and its averages, and SHAP's fair credit assignment.",
        ["Apply permutation importance while avoiding its correlated-feature traps", "Read PDP and ICE curves and spot where they extrapolate"],
        ["write-code", "interpret-results", "debug"],
        [
          ch("Importance and Its Traps", "Importance measured by damage, and curves that show the shape", [
            L("Permutation Importance and Its Traps", 35, ["permutation importance", "correlated features", "importance deflation"], "Run permutation importance — and learn how correlated features make it lie in both directions.", "code", 3),
            L("Partial Dependence Plots: Seeing the Shape", 30, ["partial dependence", "average effect", "edge behavior"], "Trace how a feature moves predictions on average — and where PDPs extrapolate fiction."),
            L("ICE Curves: When the Average Hides Everyone", 25, ["ice curves", "heterogeneity", "interactions revealed"], "Break the PDP into per-instance curves to reveal interactions the average conceals.", "guided-practice"),
          ]),
          ch("SHAP at Intuition Level", "Fair credit from game theory, and the plots that persuade", [
            L("Shapley Values: Fair Credit Assignment", 35, ["shapley values", "credit assignment", "cooperative games"], "Grasp the fair-division logic behind SHAP — without the combinatorics."),
            L("SHAP in Practice: Plots That Persuade", 35, ["shap library", "beeswarm plot", "force plot"], "Compute SHAP values and read beeswarm, dependence, and force plots correctly.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Local Explanations and Honest Limits",
        "Minimal edits, explanation stability, faithfulness tests, and the causal overreach to avoid.",
        ["Generate counterfactual explanations for individual decisions", "State honestly what an explanation can and cannot claim"],
        ["interpret-results", "design-review", "concept-check"],
        [
          ch("Explaining One Prediction", "The minimal edit, and the instability of local stories", [
            L("Counterfactuals: The Minimal Edit That Flips the Decision", 30, ["counterfactual explanation", "recourse", "actionability"], "Answer what would change this decision with the smallest credible edit to the inputs."),
            L("Explanation Instability: The Rashomon Effect", 25, ["rashomon effect", "explanation instability", "method disagreement"], "Confront explanation instability: different tools tell different stories about the same prediction.", "reading"),
          ]),
          ch("Honest Reporting and Review", "Faithfulness checks, ethical limits, and the exam-ready map", [
            L("Faithfulness: Does the Explanation Explain the Model?", 30, ["faithfulness", "sanity checks", "explanation evaluation"], "Test explanations against the model they claim to explain — delete features, watch predictions.", "guided-practice"),
            L("Interpretation Anti-Patterns and Ethics", 30, ["causal overreach", "proxy features", "explanation theater"], "Avoid claiming causality from correlational attributions — and other interpretation sins.", "reading"),
            L("Model Interpretation Review", 20, ["review", "shap", "counterfactuals"], "Consolidate global, local, and honest-limit thinking before the final.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Model Interpretation Final", 45, 18),
    projects: [
      proj(
        "An Interpretation Package for a Black Box",
        "Take a trained boosted-tree classifier and produce a complete interpretation package: permutation and SHAP importances, PDP/ICE plots for two key features, one counterfactual explanation, and a written honesty section stating what the package cannot claim.",
        10,
        "independent",
        [
          "Importance analysis: permutation and SHAP, with disagreements discussed",
          "PDP and ICE plots for two features with extrapolation warnings",
          "One counterfactual explanation and a faithfulness check",
          "An honesty section: limits, causal caveats, and audience notes",
        ],
        [
          "Correlated-feature traps in importance are addressed explicitly",
          "Plots annotate where data is sparse or extrapolated",
          "The honesty section distinguishes correlation from causation",
          "The package names its audience and answers its question",
        ],
        ["python", "scikit-learn", "shap", "matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["model interpretation", "explainability", "shap", "permutation importance", "partial dependence", "counterfactual explanations", "global vs local explanation"],
  },
];
