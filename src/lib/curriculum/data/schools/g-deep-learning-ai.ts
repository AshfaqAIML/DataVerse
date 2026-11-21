/**
 * SCHOOL G — DEEP LEARNING & AI (G1–G8)
 * Neural networks, backpropagation, deep learning optimization, PyTorch,
 * computer vision, NLP, transformers, and model deployment — taught
 * without magic: every architecture motivated by the problem it solves,
 * the math underneath at intuition level, foundations never skipped.
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolG: SubjectDef[] = [
  {
    slug: "neural-networks",
    school: "G",
    code: "G1",
    title: "Neural Networks",
    blurb:
      "Build the artificial neuron from the linear models you already know, then see exactly what stacking layers buys you — and what it doesn't.",
    difficulty: "advanced",
    track: "core",
    prerequisites: ["ml-fundamentals", "linear-algebra"],
    softPrerequisites: ["calculus"],
    objectives: [
      "Explain what a neural network computes, layer by layer, without hand-waving",
      "Trace a complete forward pass on a small network with real numbers",
      "Choose activations, output layers, and losses with reasons rather than habit",
      "Reason about width, depth, and parameter count like a practitioner",
      "Decide honestly when a neural net is the wrong tool for the job",
    ],
    outcomes: [
      "A learner can compute a full forward pass of a 2-3-1 network by hand",
      "A learner can explain why nonlinear activations are what make depth meaningful",
      "A learner can match an output layer and loss to a task type and defend the choice",
      "A learner can argue when classical ML or gradient boosting beats a neural network on a given dataset",
    ],
    keywords: ["neural networks", "activation functions", "forward pass", "hidden layers", "softmax", "cross-entropy", "capacity", "inductive bias"],
    modules: [
      mod(
        "The Artificial Neuron",
        "From the linear models you already trust to the unit every network is built from — and the one ingredient that makes depth possible.",
        ["Reconstruct the neuron from a linear model you already know", "Explain why activation functions exist, not just what they are called"],
        ["concept-check", "predict-output", "derive"],
        [
          ch(
            "From Linear Models to Neurons",
            "The neuron as a weighted sum plus bias — familiar territory under a new name",
            [
              L("A Neuron Is a Weighted Sum Plus a Bias", 25, ["artificial neuron", "weighted sum", "bias term"], "Rebuild the neuron from linear and logistic regression — parts you already command."),
              L("Why Stacking Linear Layers Buys You Nothing", 30, ["linearity", "composition", "collapse to one matrix"], "Prove with two small matrices that pure linear stacks collapse — the trap activations escape.", "worked-example", 3),
              L("The Activation Function Breaks the Linearity Trap", 30, ["activation function", "nonlinearity", "universal approximation idea"], "See how one nonlinear squish between layers unlocks everything deep learning does."),
            ]
          ),
          ch(
            "The Activation Zoo",
            "The handful of activations you will actually meet, and the job each one does",
            [
              L("Sigmoid and Tanh: The Old Squashers", 25, ["sigmoid", "tanh", "saturation"], "Meet the classic squashing functions and the saturation problem that retired them from hidden layers."),
              L("ReLU: The Default You Should Still Justify", 30, ["ReLU", "dead neuron", "sparse activation"], "Understand the rectifier's brutal simplicity, why it became the default, and how it dies."),
              L("Softmax: Scores In, Probabilities Out", 30, ["softmax", "logits", "probability distribution"], "Turn raw scores into a probability distribution — and see why the output layer is a special case.", "code", 3),
            ]
          ),
        ]
      ),
      mod(
        "The Forward Pass, By Hand",
        "Matrix arithmetic you can do on paper — because the framework will not debug your intuition for you.",
        ["Compute a complete forward pass through a small network by hand", "Select a loss for a task and compute its value on a prediction"],
        ["predict-output", "derive", "concept-check"],
        [
          ch(
            "One Layer of Arithmetic",
            "Layers as matrix multiplies, traced with small real numbers",
            [
              L("A Layer Is a Matrix Times a Vector", 30, ["matrix multiplication", "layer weights", "dimension check"], "See a layer as one matrix multiply and finally make the dimensions line up on purpose.", "worked-example", 2),
              L("Tracing a 2-3-1 Network with Real Numbers", 40, ["forward pass", "hidden layer", "hand trace"], "Push two inputs through a tiny network by hand and watch every intermediate number appear.", "guided-practice", 4),
              L("Batching: Many Inputs, One Matrix Multiply", 30, ["batch", "vectorization", "matrix shapes"], "Turn the forward pass sideways: one matrix for a whole batch — the trick GPUs live on.", "worked-example", 2),
            ]
          ),
          ch(
            "Scoring Wrongness",
            "How a network's output becomes one honest number to minimize",
            [
              L("Cross-Entropy: The Loss Classification Lives By", 35, ["cross-entropy", "negative log-likelihood", "one-hot target"], "Derive cross-entropy from the idea of punishing confident wrongness, then compute it by hand.", "worked-example", 3),
              L("Mean Squared Error and the Regression Corner", 25, ["mean squared error", "regression loss", "outlier sensitivity"], "See where squared error still fits — and where its outlier punishment works against you."),
            ]
          ),
        ]
      ),
      mod(
        "Architecture Intuition",
        "Width, depth, and capacity — the two dials of network design, and the honesty about what each one buys.",
        ["Compare width and depth as two different capacity strategies", "Decide when a neural network is the wrong tool for a problem"],
        ["concept-check", "case-analysis", "interpret-results"],
        [
          ch(
            "Width and Depth",
            "The two ways to add parameters, and what each actually purchases",
            [
              L("Wide vs Deep: Two Ways to Spend a Parameter Budget", 30, ["width", "depth", "parameter count"], "Count parameters for both designs and see that equal budgets buy very different networks."),
              L("What Depth Actually Buys: Composable Features", 30, ["feature hierarchy", "composition", "representation learning"], "Understand the real argument for depth: later layers reusing features built by earlier ones."),
              L("More Capacity Is Not More Accuracy", 30, ["overfitting", "generalization gap", "capacity control"], "Watch capacity push training accuracy to perfection while validation begs you to stop."),
            ]
          ),
          ch(
            "Choosing Your Weapon",
            "Matching model class to data shape, size, and structure",
            [
              L("When Classical ML Beats Neural Networks", 30, ["tabular data", "gradient boosting", "data efficiency"], "Learn the honest cases where boosted trees or logistic regression simply win — and why."),
              L("Inductive Bias: Matching Architecture to Data", 30, ["inductive bias", "architecture choice", "data structure"], "See why convolutions fit images and why a plain MLP wastes the structure your data already has."),
            ]
          ),
        ]
      ),
      mod(
        "Assembling the Network",
        "The full picture, the parameter bookkeeping, and the bridge to training.",
        ["Assemble a complete network and count its parameters correctly", "Explain what training will do to this network before learning backprop"],
        ["write-code", "concept-check", "predict-output"],
        [
          ch(
            "The Full Picture",
            "Everything this subject taught, bolted into one coherent object",
            [
              L("Parameters and Hyperparameters: What You Control", 30, ["parameters", "hyperparameters", "design choices"], "Sort every knob in a network into learned-versus-chosen and own the difference."),
              L("A Complete Network in Fifty Lines of NumPy", 40, ["NumPy", "MLP forward pass", "switchable activations"], "Write the whole forward pass in plain NumPy and prove it against your hand trace.", "code", 4),
            ]
          ),
          ch(
            "Looking Ahead",
            "The bridge from a network that computes to a network that learns",
            [
              L("What Training Means: Loss, Gradients, Stepping", 25, ["training loop preview", "gradient", "loss surface"], "Preview the predict-score-nudge loop that the rest of School G builds in earnest."),
              L("The Neural Network Mental Model", 20, ["mental model", "layered representation", "review"], "Consolidate the whole subject into one durable picture you can redraw from memory.", "review", 3),
            ]
          ),
        ]
      ),
    ],
    finalExam: exam("Neural Networks Final", 50, 20),
    projects: [
      proj(
        "The Neuron Playground in NumPy",
        "Implement a configurable MLP forward pass in pure NumPy — arbitrary width and depth, switchable activations — and use it to show a linear stack collapsing while a nonlinear stack bends decision boundaries.",
        6,
        "guided",
        [
          "NumPy MLP with configurable layer sizes and switchable activations (sigmoid, tanh, ReLU, softmax)",
          "Notebook demo contrasting a linear stack with a ReLU stack on a toy 2-D dataset",
          "A hand-computed 2-3-1 test case that your implementation must match exactly",
        ],
        [
          "Forward pass matches the hand trace on the 2-3-1 test case",
          "All four activations implemented correctly, including a numerically safe softmax",
          "Decision-boundary plots with honest commentary on what depth changed",
        ],
        ["python", "numpy", "matplotlib"]
      ),
      proj(
        "When Networks Lose: The Baseline Shootout",
        "Take two datasets — one tabular, one with spatial structure — train a classical baseline and a small MLP on each, and write an evidence-backed verdict on when the network is worth its complexity.",
        5,
        "independent",
        [
          "Both models trained and evaluated on identical, honestly-constructed splits",
          "Comparison table with at least three metrics and a training-cost column",
          "One-page verdict naming the conditions that favored each model class",
        ],
        [
          "Evaluation is apples-to-apples: same splits, same metrics, same compute story",
          "The verdict cites evidence from the actual runs, not folklore",
          "Limitations are stated honestly, including data size and tuning effort",
        ],
        ["python", "scikit-learn", "numpy"]
      ),
    ],
    placementEligible: true,
  },
  {
    slug: "backpropagation",
    school: "G",
    code: "G2",
    title: "Backpropagation",
    blurb:
      "The chain rule dressed for work: how gradients actually flow backwards through a network — derived by hand long before any framework does it for you.",
    difficulty: "advanced",
    track: "core",
    prerequisites: ["neural-networks", "calculus"],
    softPrerequisites: [],
    objectives: [
      "Represent any forward pass as a computation graph",
      "Apply the chain rule through a real network, operation by operation",
      "Compute the gradients of a 2-layer network by hand, correctly",
      "Explain what an autodiff engine does — and verify it instead of trusting it",
      "Diagnose vanishing and exploding gradients from the chain rule itself",
    ],
    outcomes: [
      "A learner can draw the computation graph of a small network and run backpropagation on it by hand",
      "A learner can derive the gradient of a matrix multiplication and check it by shapes alone",
      "A learner can implement finite-difference gradient checking and catch a broken backward pass",
      "A learner can explain why deep networks suffer vanishing and exploding gradients and name the standard countermeasures",
    ],
    keywords: ["backpropagation", "chain rule", "computation graph", "automatic differentiation", "gradient checking", "vanishing gradients", "reverse-mode autodiff"],
    modules: [
      mod(
        "Computation Graphs and the Chain Rule",
        "Turn calculus into bookkeeping: the forward pass as a diagram, the chain rule as traffic rules on it.",
        ["Express any forward computation as a graph of primitive operations", "Apply the chain rule along graph paths, including when paths fork and merge"],
        ["derive", "concept-check", "predict-output"],
        [
          ch(
            "Computation Graphs",
            "The forward pass as a diagram you can differentiate",
            [
              L("Every Forward Pass Is a Graph of Operations", 30, ["computation graph", "operations", "dataflow"], "Redraw a network as nodes and edges — the diagram all differentiation runs on."),
              L("Local Gradients: Every Node Minds Its Own Business", 30, ["local gradient", "primitive operation", "modularity"], "See why backprop scales: each node needs only its own derivative rule.", "worked-example", 2),
            ]
          ),
          ch(
            "The Chain Rule as the Engine",
            "One theorem doing all the work of deep learning",
            [
              L("The Chain Rule, Rebuilt for Graphs", 35, ["chain rule", "composition", "path product"], "Rebuild the chain rule as multiplying along a path — and never fear it again.", "worked-example", 3),
              L("When Paths Fork: Sum the Routes", 35, ["multivariable chain rule", "fan-out", "gradient accumulation"], "Handle nodes with many consumers: gradients arrive along every route and add.", "worked-example", 3),
            ]
          ),
        ]
      ),
      mod(
        "The Full Backward Trace",
        "One small network, forwards and then backwards, in real numbers — the subject's main event.",
        ["Run a complete forward and backward pass on a 2-layer network by hand", "Verify a hand-derived gradient against an autograd engine"],
        ["derive", "predict-output", "write-code"],
        [
          ch(
            "Backprop on a Toy Network",
            "The canonical two-layer trace, digit by digit",
            [
              L("Setting Up: A 2-Layer Network with Real Numbers", 25, ["toy network", "notation", "one training example"], "Fix tiny weights, one example, and a loss — the stage for the main event."),
              L("The Backward Pass, Operation by Operation", 45, ["backward pass", "error signal", "hand trace"], "Walk the loss gradient back through both layers and write down every intermediate number.", "guided-practice", 5),
              L("Collecting the Parameter Gradients", 30, ["parameter gradient", "update direction", "sanity checks"], "Gather the gradients that actually touch weights — the numbers a training step consumes.", "worked-example", 3),
            ]
          ),
          ch(
            "The Vectorized Backward Pass",
            "The same story in matrix form — the code frameworks actually run",
            [
              L("The Gradient of a Matrix Multiply", 40, ["matrix gradient", "transpose pattern", "shape checking"], "Derive the two gradient rules that cover most of deep learning, then prove them by shapes.", "worked-example", 4),
              L("Backprop with Batches and Broadcasting", 35, ["batched gradients", "sum over examples", "broadcasting"], "See how batching sums gradients over examples — and how broadcasting hides quiet bugs."),
            ]
          ),
        ]
      ),
      mod(
        "Autodiff: Build Versus Use",
        "What the engine does, and what still belongs to you.",
        ["Distinguish forward-mode from reverse-mode autodiff and when each wins", "Use an autograd engine while knowing exactly what it computed"],
        ["concept-check", "write-code", "debug"],
        [
          ch(
            "Automatic Differentiation",
            "Autodiff as an algorithm, not magic",
            [
              L("Forward Mode vs Reverse Mode: Two Ways to Differentiate a Program", 30, ["forward mode", "reverse mode", "cost of derivatives"], "Two sweep directions, two cost profiles — and why networks with millions of weights need exactly one."),
              L("Why Reverse Mode Makes Deep Learning Affordable", 30, ["one backward sweep", "parameter count", "cost analysis"], "Count derivative computations: reverse mode prices every parameter's gradient in a single sweep."),
            ]
          ),
          ch(
            "Autograd in Practice",
            "Day-to-day autograd without blind faith",
            [
              L("What the Engine Stores: Graphs, Tapes, and .grad", 30, ["tape", "graph retention", "grad buffers"], "Look inside an autograd engine: what it records, when it lets go, and where the memory goes."),
              L("Numerical Sanity Checks: Finite Differences", 35, ["gradient checking", "finite differences", "epsilon choice"], "Implement gradient checking — the two-line test that catches broken backward passes.", "code", 3),
            ]
          ),
        ]
      ),
      mod(
        "When Gradients Misbehave",
        "The pathologies of depth, and how to spot them from the math.",
        ["Explain vanishing and exploding gradients from the chain rule itself", "Apply gradient checking and gradient statistics to debug a network"],
        ["case-analysis", "debug", "interpret-results"],
        [
          ch(
            "Vanishing and Exploding Gradients",
            "Multiplication along deep paths is inherently unstable",
            [
              L("Deep Paths Multiply: 0.9 to the 100th Power", 30, ["vanishing gradient", "exploding gradient", "multiplicative decay"], "Watch chain-rule products shrink to nothing or blow up — the arithmetic behind two famous failures.", "worked-example", 3),
              L("Saturated Activations Kill the Signal", 30, ["saturation", "sigmoid derivative", "dead zone"], "See why a sigmoid's flat regions multiply already-small gradients by nearly zero."),
              L("The Countermeasures: Clipping, Init, Normalization", 30, ["gradient clipping", "initialization", "normalization preview"], "Survey the standard fixes honestly — each is covered in depth later in the school."),
            ]
          ),
          ch(
            "Trust but Verify",
            "Instruments for gradients you can actually read",
            [
              L("Reading Gradient Statistics Like Lab Results", 30, ["gradient norms", "per-layer statistics", "diagnostics"], "Learn the four numbers to log per layer that reveal most gradient pathologies.", "guided-practice", 3),
              L("The Backpropagation Mental Model", 20, ["mental model", "chain rule", "review"], "Lock in the whole subject: a graph, a rule, and one backward sweep.", "review", 3),
            ]
          ),
        ]
      ),
    ],
    finalExam: exam("Backpropagation Final", 50, 20),
    projects: [
      proj(
        "A Tiny Autograd Engine",
        "Build a reverse-mode automatic differentiation engine in pure Python and NumPy — a Value class supporting add, mul, matmul, and tanh/ReLU with .backward() — then train a small MLP on a toy dataset and prove every gradient against finite differences.",
        12,
        "independent",
        [
          "Engine module implementing each operation's forward and backward",
          "A small MLP trained on a 2-D toy dataset using only your engine",
          "Gradient-check report comparing engine gradients to finite differences",
        ],
        [
          "Gradients match finite differences within a stated tolerance",
          "Nodes with multiple consumers accumulate gradients correctly (the sum rule)",
          "The API prevents silent bugs: one backward per graph, gradients reset between steps",
        ],
        ["python", "numpy"]
      ),
      proj(
        "The Two-Layer Trace, Annotated",
        "Produce a notebook that walks the complete forward and backward pass of a fixed 2-layer network by hand — every intermediate number shown and justified — then verifies the whole trace programmatically with NumPy.",
        5,
        "guided",
        [
          "Annotated step-by-step hand trace of both passes",
          "Verification cells that recompute each step with NumPy",
          "A short reflection on the steps where intuition and arithmetic disagreed",
        ],
        [
          "Arithmetic is correct at every hop, verified by code",
          "The chain rule is cited explicitly at each graph edge",
          "The reflection is specific to this trace, not generic advice",
        ],
        ["python", "numpy"]
      ),
    ],
    placementEligible: true,
  },
  {
    slug: "deep-learning-optimization",
    school: "G",
    code: "G3",
    title: "Deep Learning Optimization",
    blurb:
      "SGD's whole family tree — momentum, RMSProp, Adam, schedules, initialization, normalization — plus the loss-curve literacy that separates a working run from a prayer.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["backpropagation", "optimization"],
    softPrerequisites: [],
    objectives: [
      "Explain what momentum, RMSProp, and Adam each change about plain SGD",
      "Configure learning-rate schedules and warmup with reasons",
      "Choose batch size and initialization deliberately, not by folklore",
      "Deploy dropout, weight decay, and early stopping as a coherent regularization plan",
      "Diagnose a broken training run from its curves and logs alone",
    ],
    outcomes: [
      "A learner can implement SGD with momentum, RMSProp, and Adam from their update rules",
      "A learner can select a learning-rate schedule and justify warmup for a given setup",
      "A learner can read train and validation loss curves and name the most likely failure",
      "A learner can explain batch normalization at intuition level, including the train/eval distinction",
    ],
    keywords: ["optimizers", "momentum", "Adam", "learning rate schedule", "dropout", "weight decay", "batch normalization", "loss curves"],
    modules: [
      mod(
        "SGD and Its Descendants",
        "The optimizers everyone names — derived as fixes to real problems, so you can reason about them instead of reciting them.",
        ["Explain what momentum, RMSProp, and Adam each change about plain SGD", "Choose and configure a learning-rate schedule with reasons"],
        ["concept-check", "predict-output", "interpret-results"],
        [
          ch(
            "The Optimizer Family",
            "From raw gradients to Adam — each optimizer as a fix to a real problem",
            [
              L("Minibatch SGD: The Workhorse Under Everything", 30, ["minibatch", "stochastic gradient", "gradient noise"], "Descend on noisy minibatch gradients and learn what the noise costs and what it buys."),
              L("Momentum: A Ball with Memory", 35, ["momentum", "velocity", "exponential moving average"], "Add inertia to the update and watch ravines, plateaus, and jitter all improve.", "worked-example", 3),
              L("RMSProp and Adam: A Learning Rate per Parameter", 40, ["RMSProp", "Adam", "adaptive step size"], "Let every weight keep its own step size — the idea behind the optimizer most people default to.", "worked-example", 3),
            ]
          ),
          ch(
            "Learning-Rate Craft",
            "The one hyperparameter that dominates all others",
            [
              L("The Learning Rate Is the Hyperparameter", 30, ["learning rate", "divergence", "step size"], "Watch one network trained at three learning rates and learn to read the wreckage.", "guided-practice", 3),
              L("Warmup, Decay, and the Schedules People Actually Run", 35, ["warmup", "cosine decay", "step decay"], "Meet the standard schedules — warmup, step, cosine — and when each earns its keep."),
            ]
          ),
        ]
      ),
      mod(
        "The Invisible Hyperparameters",
        "Batch size, initialization, and the regularizers that make deep networks generalize.",
        ["Reason about batch size as a compute-stability-generalization tradeoff", "Deploy dropout, weight decay, and early stopping with intent"],
        ["case-analysis", "concept-check", "interpret-results"],
        [
          ch(
            "Batch Size and Initialization",
            "Two choices made before training starts that shape everything after",
            [
              L("Batch Size: The Great Compromise Knob", 35, ["batch size", "gradient noise", "generalization effect"], "Trace batch size through speed, stability, and generalization — and why bigger is not free."),
              L("Initialization: Where the Optimization Starts", 35, ["variance preservation", "Xavier init", "He init"], "Learn why random weights need a variance budget — and the two schemes that provide it.", "worked-example", 3),
            ]
          ),
          ch(
            "Regularization for Deep Networks",
            "Fighting overfitting with tools built for millions of parameters",
            [
              L("Weight Decay: Nudging Every Weight Toward Zero", 30, ["weight decay", "L2 penalty", "AdamW"], "Shrink weights a little every step and watch capacity quietly come back under control."),
              L("Dropout: Forcing Redundancy by Sabotage", 35, ["dropout", "inverted dropout", "ensemble interpretation"], "Randomly silence neurons during training and gain something like an ensemble for free."),
              L("Early Stopping: The Cheapest Regularizer", 25, ["early stopping", "patience", "best-checkpoint discipline"], "Stop when validation says so — the regularizer that costs one if-statement."),
            ]
          ),
        ]
      ),
      mod(
        "Stabilizing and Debugging Training",
        "Normalization layers, and loss curves read like flight instruments.",
        ["Explain batch normalization's effect at an honest, intuition level", "Diagnose a broken training run from its curves and logs alone"],
        ["debug", "case-analysis", "interpret-results"],
        [
          ch(
            "Normalization Layers",
            "What batch normalization does, honestly told",
            [
              L("Batch Norm at Intuition Level", 35, ["batch normalization", "train/eval modes", "running statistics"], "What batch norm does to activations — and the train-versus-eval trap that bites everyone once."),
              L("Internal Covariate Shift: The Story vs the Evidence", 30, ["internal covariate shift", "reparametrization", "honest theory"], "Separate the original explanation from what later research says actually helps.", "reading", 2),
            ]
          ),
          ch(
            "Loss Curves as Instruments",
            "Reading runs like a pilot reads gauges",
            [
              L("Reading a Run: Train Loss, Val Loss, and the Gap", 35, ["loss curves", "overfitting signature", "plateau"], "Learn the six curve shapes and what each one is telling you to change.", "guided-practice", 4),
              L("A Field Guide to Broken Training Runs", 35, ["NaN loss", "divergence", "debug checklist"], "From a NaN at step three to a validation creep — match symptoms to causes and fixes.", "reading", 3),
              L("The Tuning Order: What to Fix First", 30, ["hyperparameter priority", "learning rate first", "methodical debugging"], "Replace random knob-twiddling with a fixed order of operations for fixing a run.", "review", 3),
            ]
          ),
        ]
      ),
    ],
    finalExam: exam("Deep Learning Optimization Final", 50, 20),
    projects: [
      proj(
        "The Optimizer Zoo, From Scratch",
        "Implement SGD, SGD with momentum, RMSProp, and Adam as plain NumPy update rules behind one interface — then race them on a quadratic bowl, the Rosenbrock valley, and a small synthetic regression, and report what the curves say.",
        10,
        "independent",
        [
          "Optimizer module implementing the four update rules behind a common interface",
          "Race harness running all four on at least two objectives with shared seeds and budgets",
          "Report with plots, the update-rule equations, and honest findings",
        ],
        [
          "Each update rule matches a reference implementation on a fixed test case",
          "Experiments are controlled: same inits, same seeds, same step budgets",
          "Conclusions cite the measured curves, including where the results surprised you",
        ],
        ["python", "numpy", "matplotlib"]
      ),
      proj(
        "The Loss Curve Clinic",
        "You receive five anonymized training logs from runs that went wrong. Diagnose each run from its loss curves and logged statistics, prescribe a fix in priority order, and defend every diagnosis with specific evidence from the charts.",
        5,
        "guided",
        [
          "A diagnosis per run citing the exact curve feature that gives it away",
          "A prescribed fix per run with the curve change you expect to see",
          "A priority-ordered action list for the team that owns these runs",
        ],
        [
          "Diagnoses match the actual (hidden) causes of each broken run",
          "Fixes target root causes, not symptoms",
          "Every claim points to a specific line, number, or curve shape",
        ],
        ["python", "matplotlib"]
      ),
    ],
    placementEligible: true,
  },
  {
    slug: "pytorch",
    school: "G",
    code: "G4",
    title: "PyTorch Fundamentals",
    blurb:
      "PyTorch from tensors to a complete, checkpointed training loop you write yourself — the framework as a tool you understand, not a mystery you invoke.",
    difficulty: "advanced",
    track: "core",
    prerequisites: ["backpropagation"],
    softPrerequisites: [],
    objectives: [
      "Create, reshape, and move tensors, and predict the shapes of operations",
      "Use autograd deliberately: track, compute, inspect, and disable gradients",
      "Build models with nn.Module and wire them to losses and optimizers",
      "Feed data through Dataset and DataLoader",
      "Write a complete training loop — with evaluation and checkpointing — by hand",
    ],
    outcomes: [
      "A learner can write a PyTorch model class and explain what nn.Module registers",
      "A learner can write the full training loop from memory with correct zero_grad and step ordering",
      "A learner can implement a custom Dataset and serve batches through a DataLoader",
      "A learner can move a run between CPU and GPU and save and load state_dict checkpoints correctly",
    ],
    keywords: ["pytorch", "tensors", "autograd", "nn.Module", "DataLoader", "training loop", "checkpointing", "GPU"],
    modules: [
      mod(
        "Tensors and Autograd",
        "The data structure everything runs on, and the engine you already understand in concept.",
        ["Create, reshape, and broadcast tensors confidently", "Run and inspect autograd: build the graph, call backward, read .grad"],
        ["write-code", "predict-output", "debug"],
        [
          ch(
            "Tensors",
            "Tensors as NumPy arrays that also remember how they were made",
            [
              L("Tensors Are NumPy Arrays That Remember", 30, ["torch.Tensor", "shape", "creation ops"], "Meet the tensor: familiar indexing and broadcasting plus a memory of how it was made.", "code", 2),
              L("Shapes, Views, and the Reshape You Will Fight", 35, ["reshape", "view", "contiguity"], "Flatten, permute, and squeeze tensors without lying about their memory.", "code", 3),
              L("dtype and device: The Two Labels That Bite", 25, ["dtype", "device", "type promotion"], "Float32 on CPU meets Float64 on GPU: prevent the classic mismatch crashes before they happen.", "code", 2),
            ]
          ),
          ch(
            "Autograd in Practice",
            "The engine you studied conceptually, now in your hands",
            [
              L("requires_grad and the Graph PyTorch Builds", 30, ["requires_grad", "computational graph", "leaf tensors"], "See exactly what PyTorch records the moment a tensor opts in to gradients.", "code", 2),
              L("backward(): One Call, Every Gradient", 30, ["backward", "grad attribute", "vector-Jacobian product"], "Call backward, read every .grad — and know what the call actually computes.", "code", 3),
              L("no_grad and detach: Turning the Tape Off", 30, ["torch.no_grad", "detach", "inference mode"], "Stop tracking when you should — evaluation, weight updates — and recognize the bugs that come from forgetting.", "code", 3),
            ]
          ),
        ]
      ),
      mod(
        "Building Models with nn.Module",
        "Models as organized, inspectable parameter containers.",
        ["Write model classes with nn.Module and register layers correctly", "Wire loss functions and optimizers to a model's parameters"],
        ["write-code", "concept-check", "debug"],
        [
          ch(
            "nn.Module",
            "The class every PyTorch model inherits from, and the contract it imposes",
            [
              L("nn.Module: Parameters, Children, and Their Parameters", 30, ["nn.Module", "nn.Parameter", "module tree"], "Understand the container contract: register once, traverse everything, own nothing global."),
              L("Writing Your First Model Class", 40, ["__init__", "forward", "model.parameters()"], "Write an MLP class end to end and inspect exactly what it registered.", "code", 3),
            ]
          ),
          ch(
            "The Standard Toolkit",
            "Losses and optimizers — the prebuilt pieces you will use daily",
            [
              L("Loss Functions and the Task Table", 30, ["CrossEntropyLoss", "MSELoss", "BCEWithLogitsLoss"], "Pick the right prebuilt loss for regression, binary, and multiclass — and skip hand-rolling.", "concept", 2),
              L("torch.optim and the zero_grad/step Ritual", 35, ["optimizer", "zero_grad", "step"], "Learn the two-call liturgy every training step repeats — and the silent bug from skipping one.", "code", 3),
            ]
          ),
        ]
      ),
      mod(
        "Data and the Training Loop",
        "From raw arrays to a loop you wrote yourself and can defend line by line.",
        ["Serve data through Dataset and DataLoader", "Write a complete training loop with evaluation and checkpointing by hand"],
        ["write-code", "debug", "dataset-task"],
        [
          ch(
            "Dataset and DataLoader",
            "PyTorch's contract for feeding tensors to models",
            [
              L("Dataset: The __getitem__ Contract", 35, ["Dataset", "__len__", "__getitem__"], "Wrap any data source in the two-method interface every loader expects.", "code", 3),
              L("DataLoader: Batches, Shuffles, and Workers", 35, ["DataLoader", "batch_size", "num_workers"], "Configure batching and shuffling — and learn where the CPU-to-GPU pipeline really stalls.", "code", 3),
            ]
          ),
          ch(
            "The Loop, by Hand",
            "The five steps, written from scratch, then never forgotten",
            [
              L("The Five Steps of Every Training Step", 40, ["zero_grad", "forward", "backward", "step", "logging"], "Write the canonical step by hand and understand why the order is the order.", "worked-example", 4),
              L("The Validation Loop and model.eval()", 35, ["model.eval", "torch.no_grad", "epoch metrics"], "Evaluate honestly: eval mode, no gradients, and metrics computed on the right set.", "code", 3),
              L("Checkpointing and Resuming a Run", 35, ["checkpoint", "optimizer state", "RNG state"], "Save everything a restart needs — weights, optimizer, epoch, RNG — and prove it resumes.", "code", 3),
            ]
          ),
        ]
      ),
      mod(
        "Devices, Saving, and a Real Run",
        "Running on hardware you understand, and ending with a complete training session.",
        ["Move models and data between CPU and GPU correctly", "Complete a structured end-to-end training run with saved artifacts"],
        ["write-code", "interpret-results", "dataset-task"],
        [
          ch(
            "GPU Discipline",
            "What .to(device) does and what a GPU actually wants from you",
            [
              L("What .to(device) Actually Does", 30, ["device", "cuda", "cpu fallback"], "Move tensors and models to the GPU and learn the mismatch errors by heart.", "code", 2),
              L("Feed the Beast: Batches, Pinning, and Sync Points", 30, ["GPU utilization", "data pipeline", "synchronization"], "Learn why the GPU idles and how batching and pinning keep it busy."),
            ]
          ),
          ch(
            "End to End",
            "One structured run, from data to saved model",
            [
              L("state_dict: How Models Really Travel", 30, ["state_dict", "torch.save", "torch.load"], "Save and load parameters the PyTorch way — and know the full-checkpoint alternative.", "code", 3),
              L("A Training Session, Structured Like a Professional's", 40, ["training script", "config", "artifacts"], "Structure a training script like a repo-worthy project: config, loops, logging, outputs.", "guided-practice", 4),
            ]
          ),
        ]
      ),
    ],
    finalExam: exam("PyTorch Fundamentals Final", 55, 22),
    projects: [
      proj(
        "MNIST From Scratch — No Copying the Tutorial",
        "Train a handwritten-digit classifier end to end: your own Dataset, your DataLoader, your hand-written training loop, evaluation with a confusion matrix, and checkpoints you can resume from. The famous 60-line tutorial is forbidden — you write the loop from memory, because that is the point.",
        12,
        "independent",
        [
          "Training script with a custom Dataset and a hand-written training loop",
          "Evaluation report with per-class accuracy and a confusion matrix",
          "A checkpoint plus a demonstrated resume of an interrupted run",
        ],
        [
          "The training loop is written by hand with correct zero_grad and step ordering",
          "The data pipeline uses Dataset and DataLoader properly, not preloaded tensors",
          "The test split is evaluated exactly once, at the end, with the honesty that implies",
        ],
        ["python", "pytorch", "torchvision"]
      ),
      proj(
        "The Resumable Training Harness",
        "Build a reusable training harness: config-driven, with train and validation loops, early stopping, checkpoint/resume, and CSV metric logging — then demonstrate it by interrupting a run mid-training and resuming it.",
        8,
        "guided",
        [
          "Harness module with configuration living outside the code",
          "A demonstration run interrupted and resumed from a checkpoint",
          "README with usage examples and the resume protocol",
        ],
        [
          "Resume restores model, optimizer, and epoch state correctly",
          "Early stopping honors its patience and keeps the best checkpoint",
          "Training, evaluation, and configuration are cleanly separated",
        ],
        ["python", "pytorch"]
      ),
    ],
    placementEligible: true,
  },
  {
    slug: "computer-vision",
    school: "G",
    code: "G5",
    title: "Computer Vision",
    blurb:
      "Why convolutions fit images, the arithmetic behind every CNN, transfer learning as the default — and how to read the famous architectures without drowning.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["pytorch"],
    softPrerequisites: [],
    objectives: [
      "Explain why convolutions fit images and fully connected layers do not",
      "Compute convolution output sizes and parameter counts by hand",
      "Assemble, train, and evaluate a CNN for image classification",
      "Design augmentation policies that respect the label",
      "Run a transfer-learning workflow: freeze, train the head, fine-tune",
      "Read famous architectures conceptually, starting with ResNet",
    ],
    outcomes: [
      "A learner can compute the output size and parameter count of a conv layer by hand",
      "A learner can build and train a small CNN in PyTorch with augmentation and honest evaluation",
      "A learner can execute a two-phase transfer-learning recipe and explain each phase",
      "A learner can explain ResNet's residual connections and why they enabled deeper networks",
    ],
    keywords: ["computer vision", "convolutions", "CNN", "pooling", "data augmentation", "transfer learning", "ResNet", "object detection"],
    modules: [
      mod(
        "Why Convolutions",
        "The structural assumptions images carry — and the arithmetic of the operation that respects them.",
        ["Explain why fully connected layers fail on images", "Compute convolution output sizes and channel counts by hand"],
        ["concept-check", "predict-output", "derive"],
        [
          ch(
            "Images Are Not Tables",
            "The structural assumptions that flattening throws away",
            [
              L("The Problem with Flattening a Picture", 30, ["parameter explosion", "spatial structure", "translation"], "Count the parameters an MLP needs for a 224×224 image — and meet the fix.", "concept", 2),
              L("Convolutions: Local Fields, Shared Weights", 35, ["local receptive field", "weight sharing", "translation invariance"], "The two assumptions that make vision tractable — with the parameter math that proves it.", "worked-example", 3),
            ]
          ),
          ch(
            "Convolution Arithmetic",
            "Kernels, strides, padding, and channels — numbers first",
            [
              L("Kernels, Strides, and Padding", 35, ["kernel", "stride", "padding"], "Slide a kernel across an image and compute every output dimension yourself.", "guided-practice", 4),
              L("Channels: The Depth Dimension, Explained Once", 35, ["input channels", "output channels", "filters"], "RGB in, 64 channels out — untangle the shape story that confuses everyone at first.", "worked-example", 3),
              L("The Output-Size Formula and a Shapes Drill", 30, ["output size formula", "shape arithmetic", "sanity checks"], "Drill the one formula every vision engineer uses weekly until it is reflex.", "guided-practice", 3),
            ]
          ),
        ]
      ),
      mod(
        "CNN Anatomy",
        "The parts list of a standard CNN, and what each depth of features is actually detecting.",
        ["Assemble the conv/pool/FC stack of a standard CNN", "Explain what feature maps at each depth are detecting"],
        ["write-code", "concept-check", "interpret-results"],
        [
          ch(
            "The Standard Blocks",
            "The parts list of every classic CNN",
            [
              L("Conv, ReLU, Pool: The Canonical Stack", 30, ["convolution layer", "max pooling", "downsampling"], "Build the repeating motif of vision models and know each part's job."),
              L("Feature Maps: What Each Layer Sees", 35, ["feature map", "edge detector", "hierarchy"], "Visualize early edges, middle textures, late parts — the hierarchy convolutions grow on their own.", "guided-practice", 3),
            ]
          ),
          ch(
            "From Features to Prediction",
            "Gluing a classifier onto a convolutional backbone",
            [
              L("Backbone and Head: The Two-Part Model", 30, ["backbone", "classifier head", "global average pooling"], "See the architecture split that makes transfer learning possible at all."),
              L("Receptive Fields: Why Depth Compounds", 30, ["receptive field", "stacked convolutions", "context"], "One 3×3 kernel sees almost nothing; eight stacked see a lot — trace the arithmetic.", "worked-example", 2),
            ]
          ),
        ]
      ),
      mod(
        "Training Vision Models Well",
        "Augmentation and transfer learning — the two habits that make vision projects work in the real world.",
        ["Design an augmentation policy that respects the label", "Execute a transfer-learning workflow: freeze, train head, fine-tune"],
        ["dataset-task", "write-code", "case-analysis"],
        [
          ch(
            "Data Augmentation",
            "More data from existing data — without lying about labels",
            [
              L("Augmentation as Regularization", 30, ["augmentation", "invariance", "memorization race"], "Why a flipped cat is still a cat — and how synthetic variety slows the memorization race.", "concept", 2),
              L("The Augmentation Menu and Its Limits", 35, ["flips", "random crops", "color jitter"], "Learn the standard transforms — and the label-breaking ones to refuse.", "code", 3),
            ]
          ),
          ch(
            "Transfer Learning",
            "Starting from pretrained weights is the professional default",
            [
              L("Transfer Learning Is the Default, Not the Trick", 30, ["pretrained weights", "feature reuse", "dataset size"], "Meet the workflow behind most real vision systems and why it works when data is scarce.", "concept", 2),
              L("Freezing, Fine-Tuning, and Discriminative Learning Rates", 40, ["freezing", "fine-tuning", "layer-wise learning rate"], "Run the two-phase recipe: train the head, then thaw the backbone gently.", "code", 4),
            ]
          ),
        ]
      ),
      mod(
        "Beyond Classification",
        "Famous architectures read conceptually, and the big tasks past classification.",
        ["Read ResNet's residual connection and explain why it helped", "Describe detection and segmentation as extensions of classification"],
        ["concept-check", "case-analysis", "interpret-results"],
        [
          ch(
            "Famous Architectures, Read Conceptually",
            "How to read an architecture without drowning in tables",
            [
              L("ResNet's Skip Connections: Learning the Residual", 35, ["skip connection", "residual learning", "identity path"], "The one diagram that unblocked hundred-layer networks — read it slowly.", "concept", 2),
              L("Reading an Architecture Paper as a Practitioner", 30, ["architecture paper", "ablation study", "scaling behavior"], "A method for mining papers: find the claim, the ablation, and the cost.", "reading", 2),
            ]
          ),
          ch(
            "Detection and Segmentation",
            "The two big tasks beyond classifying a whole image",
            [
              L("Object Detection: Classification with Locations", 35, ["bounding box", "detection", "anchor idea"], "Where is it and what is it — the framing behind every detection family.", "concept", 2),
              L("Segmentation: A Class for Every Pixel", 30, ["semantic segmentation", "encoder-decoder", "upsampling"], "Per-pixel labels and the encoder-decoder shape that produces them.", "concept", 2),
            ]
          ),
        ]
      ),
    ],
    finalExam: exam("Computer Vision Final", 55, 22),
    projects: [
      proj(
        "CIFAR-10 CNN From Scratch",
        "Build and train a CNN on CIFAR-10 with a sensible augmentation policy. Set your own baseline with a simple model first, then beat it and explain what actually moved the metric. The test split is touched exactly once, at the very end.",
        12,
        "independent",
        [
          "A baseline (MLP or tiny CNN) and a final CNN with augmentation, trained from scratch",
          "Train/validation curves and a confusion matrix on the test split",
          "Short report on what moved the metric and what did not",
        ],
        [
          "Conv shapes and parameter counts are stated and correct for the architecture used",
          "Augmentation is applied to training data only, never validation or test",
          "The test split is used exactly once, and the report says so explicitly",
        ],
        ["python", "pytorch", "torchvision"]
      ),
      proj(
        "Transfer Learning on a Small Dataset",
        "Take a small image dataset — a public flowers or pets set, or your own photos — and run the full transfer recipe: freeze the backbone and train a new head, then fine-tune. Compare head-only against full fine-tuning and report honestly on when thawing helped.",
        8,
        "guided",
        [
          "Two-phase training script with explicit, verified freezing logic",
          "Comparison of head-only vs fine-tuned results on a held-out split",
          "Short report on when fine-tuning helped and when it did not",
        ],
        [
          "Freezing is verified by printing trainable parameter counts before and after",
          "Evaluation uses a proper held-out split that training never touches",
          "Conclusions reflect the measured numbers, not hopes",
        ],
        ["python", "pytorch", "torchvision"]
      ),
    ],
    placementEligible: true,
  },
  {
    slug: "nlp",
    school: "G",
    code: "G6",
    title: "Natural Language Processing",
    blurb:
      "Text becomes numbers, numbers become meaning: tokenization, embeddings, and sequence models — right up to the moment attention changes everything.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["pytorch"],
    softPrerequisites: [],
    objectives: [
      "Tokenize text with word- and subword-level schemes and explain the tradeoffs",
      "Build a vocabulary and batch ragged text into fixed-shape tensors",
      "Explain and use embeddings, including their geometry and their biases",
      "Describe how RNNs and LSTMs modeled order — and why attention replaced them",
      "Build and evaluate a text classifier end to end",
    ],
    outcomes: [
      "A learner can implement a tokenizer, vocabulary, and padding/masking pipeline",
      "A learner can train an embedding layer and probe it with nearest-neighbor queries",
      "A learner can build a text classifier from raw text to metrics and analyze its errors",
      "A learner can explain the sequence bottleneck that motivated attention",
    ],
    keywords: ["natural language processing", "tokenization", "BPE", "embeddings", "word vectors", "RNN", "LSTM", "text classification"],
    modules: [
      mod(
        "Text as Data",
        "The first and most underestimated decisions in NLP: how text is cut into pieces and shaped into tensors.",
        ["Tokenize text with word- and subword-level schemes", "Build a vocabulary and batch ragged text into tensors"],
        ["write-code", "concept-check", "dataset-task"],
        [
          ch(
            "Tokenization",
            "How text is cut into pieces — the decision that shapes everything downstream",
            [
              L("Text into Numbers: The Tokenization Problem", 30, ["tokenization", "tokens", "vocabulary size"], "Why the choice of token shapes vocabulary size, unknown words, and model scale.", "concept", 2),
              L("Words, Subwords, and Byte-Pair Encoding", 35, ["subword tokenization", "byte pair encoding", "merge rules"], "How BPE builds a vocabulary from frequency — worked on a toy corpus by hand.", "worked-example", 4),
            ]
          ),
          ch(
            "Vocabulary and Batching",
            "Turning tokens into fixed-shape tensors",
            [
              L("Building and Managing a Vocabulary", 30, ["vocabulary", "special tokens", "frequency cutoff"], "Fit a vocabulary to your corpus — with the special tokens that carry real meaning.", "code", 3),
              L("Padding, Masking, and Batching Sentences", 30, ["padding", "attention mask", "batching"], "Make ragged text rectangular — and remember which numbers are real.", "code", 3),
            ]
          ),
        ]
      ),
      mod(
        "Embeddings",
        "From one-hot waste to meaning geometry — the representation every NLP model starts from.",
        ["Explain embeddings as learned, dense representations", "Use embedding layers in PyTorch and probe what they learned"],
        ["write-code", "concept-check", "interpret-results"],
        [
          ch(
            "Word Vectors",
            "From one-hot waste to meaning geometry",
            [
              L("One-Hot Vectors Are a Dead End", 25, ["one-hot encoding", "orthogonality", "sparsity"], "See why one-hot vectors make every word equally distant from every other word.", "concept", 2),
              L("Embeddings: Words as Points in Meaning Space", 35, ["embedding", "distributional hypothesis", "cosine similarity"], "Words that appear in similar contexts land close together — and cosine similarity measures it.", "concept", 3),
              L("Word2Vec's Skip-Gram Idea", 35, ["word2vec", "skip-gram", "negative sampling idea"], "Predict the context from the word: the training scheme that made vectors famous.", "worked-example", 2),
            ]
          ),
          ch(
            "Using Embeddings",
            "Embedding layers as the front door of every NLP model",
            [
              L("nn.Embedding in Practice", 30, ["nn.Embedding", "lookup table", "trainable vectors"], "An embedding layer is a lookup table you can train — and inspect.", "code", 3),
              L("The Geometry of Embeddings — and Their Biases", 30, ["analogy arithmetic", "embedding bias", "fairness"], "King minus man plus woman works — and so does the bias: read embeddings critically.", "guided-practice", 3),
            ]
          ),
        ]
      ),
      mod(
        "Sequences and Their Models",
        "Why order matters, how recurrence modeled it, and the bottleneck that motivated attention.",
        ["Explain why order matters and bag-of-words discards it", "Describe RNNs and LSTMs at concept level, including their limits"],
        ["concept-check", "predict-output", "case-analysis"],
        [
          ch(
            "The Sequence Problem",
            "What sentences have that bags of words do not: order",
            [
              L("Bag of Words Forgets Everything That Matters", 25, ["bag of words", "word order", "composition"], "A sentence and its shuffle are identical to a bag — and that is exactly the problem.", "concept", 2),
              L("RNNs: A Loop over Time", 35, ["recurrent network", "hidden state", "unrolling"], "The network that reads one token at a time carrying a summary — unrolled on paper.", "worked-example", 3),
              L("LSTM: Gates and a Protected Memory Lane", 35, ["LSTM", "gates", "long-range dependencies"], "The gate mechanism that let gradients survive longer sequences — conceptually and honestly."),
            ]
          ),
          ch(
            "Attention Emerges",
            "The bottleneck that motivated the field's turning point",
            [
              L("The Bottleneck: One Vector to Summarize Everything", 30, ["fixed-size encoding", "seq2seq context", "information loss"], "Squashing a whole sentence into one hidden state — and why long inputs broke it.", "concept", 2),
              L("What Should the Model Look At? The Attention Question", 30, ["attention motivation", "alignment", "soft lookup"], "Let each output position gather from every input position — the idea transformers run on.", "concept", 3),
            ]
          ),
        ]
      ),
      mod(
        "Text Classification, End to End",
        "Every stage wired together on a real dataset, with the evaluation habits text demands.",
        ["Build a complete text classifier from raw text to metrics", "Evaluate NLP models with metrics that respect class imbalance"],
        ["write-code", "dataset-task", "interpret-results"],
        [
          ch(
            "The Full Pipeline",
            "Every stage wired together on a real dataset",
            [
              L("A Sentiment Classifier, Raw Text to Prediction", 40, ["text classification", "pipeline", "training"], "Tokenize, embed, pool, classify, train — the whole ladder climbed in one lesson.", "code", 4),
              L("Evaluation for Text: Beyond Accuracy", 30, ["precision", "recall", "F1"], "When 95 percent of reviews are positive, accuracy lies — read precision, recall, and F1 instead.", "concept", 3),
            ]
          ),
          ch(
            "Wrap-Up",
            "The state of sequence modeling as transformers arrive",
            [
              L("Where RNNs Still Live and Why Transformers Took Over", 30, ["RNN legacy", "parallelism", "transformer motivation"], "A fair accounting: what recurrence still does well and what attention changed forever.", "concept", 2),
              L("The NLP Mental Model Before Transformers", 20, ["mental model", "review", "pipeline"], "Consolidate tokens, embeddings, and sequences — the foundation the next subject builds on.", "review", 3),
            ]
          ),
        ]
      ),
    ],
    finalExam: exam("Natural Language Processing Final", 50, 20),
    projects: [
      proj(
        "A Sentiment Classifier, End to End",
        "From a raw reviews dataset to a trained classifier: your own tokenizer and vocabulary, an embedding-based model, honest evaluation with F1 and a confusion matrix, and an error analysis of the examples it got wrong.",
        10,
        "independent",
        [
          "Pipeline script that reproduces everything from raw data with one command",
          "Evaluation report with F1, precision, recall, and a confusion matrix",
          "Error analysis of at least ten misclassified examples",
        ],
        [
          "The pipeline runs from raw text without manual in-between steps",
          "Metrics are chosen to match the class imbalance, with justification",
          "The error analysis names concrete patterns, not vibes",
        ],
        ["python", "pytorch"]
      ),
      proj(
        "Train and Probe Your Own Word Embeddings",
        "Train a skip-gram model on a corpus of your choosing — a public book corpus, a Wikipedia slice, or your own collection — then probe what it learned: nearest neighbors, analogy arithmetic, and at least one documented bias.",
        6,
        "guided",
        [
          "Training script with a configurable corpus and vector size",
          "Probe notebook with nearest neighbors and analogies",
          "Short written reflection including a bias you found in the vectors",
        ],
        [
          "Training converges and the probe runs reproducibly from a seed",
          "Analogies and neighbors are computed with cosine similarity correctly",
          "The bias discussion is concrete and cites actual vector arithmetic",
        ],
        ["python", "pytorch"]
      ),
    ],
    placementEligible: true,
  },
  {
    slug: "transformers",
    school: "G",
    code: "G7",
    title: "Transformers Fundamentals",
    blurb:
      "Self-attention computed by hand, transformer blocks assembled from parts, BERT vs GPT demystified — and the Hugging Face stack you will actually use.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["nlp"],
    softPrerequisites: ["probability-distributions"],
    objectives: [
      "Compute single-head self-attention by hand for a tiny sequence",
      "Explain multi-head attention, positional encodings, and the transformer block",
      "Contrast encoder and decoder stacks, including cross-attention",
      "Explain the BERT and GPT training objectives and what each family is good for",
      "Fine-tune a pretrained model with the Hugging Face stack",
      "Reason about context length, attention cost, and model choice honestly",
    ],
    outcomes: [
      "A learner can compute scaled dot-product attention for a three-token sequence by hand",
      "A learner can assemble a transformer block and name every component's role",
      "A learner can fine-tune a small pretrained model on a custom classification task",
      "A learner can estimate the compute cost of attention and defend a model-size choice",
    ],
    keywords: ["transformers", "self-attention", "multi-head attention", "positional encodings", "BERT", "GPT", "fine-tuning", "Hugging Face"],
    modules: [
      mod(
        "Self-Attention, Step by Step",
        "The mechanism with the intimidating name, computed with arithmetic you already own.",
        ["Compute single-head self-attention by hand for a tiny sequence", "Explain multi-head attention and positional encodings"],
        ["derive", "predict-output", "write-code"],
        [
          ch(
            "The Attention Handshake",
            "Queries, keys, values — the mechanism with the intimidating name and simple arithmetic",
            [
              L("Queries, Keys, Values: The Attention Handshake", 35, ["query", "key", "value"], "Every token asks a question, every token advertises an answer — attention is the matchmaker.", "concept", 2),
              L("Scaled Dot-Product Attention: The Formula, Demystified", 40, ["dot-product similarity", "sqrt(d) scaling", "attention weights"], "Scores, scale, softmax — compute the full formula on three tokens by hand.", "worked-example", 4),
              L("Softmax Over Scores: A Differentiable Spotlight", 30, ["softmax", "attention distribution", "differentiability"], "Why attention weights form a probability distribution — and why that makes the mechanism trainable."),
            ]
          ),
          ch(
            "Multi-Head and Positional",
            "The two upgrades that make plain attention practical",
            [
              L("Multi-Head Attention: Eight Views at Once", 35, ["multi-head", "subspace", "concat and project"], "Parallel attention heads each learn a different relationship, merged at the end.", "concept", 3),
              L("Attention Is Order-Blind: Positional Encodings", 35, ["positional encoding", "sinusoidal encoding", "learned positions"], "Permute the input and attention will not notice — so we bolt position back on.", "worked-example", 3),
            ]
          ),
        ]
      ),
      mod(
        "The Block and the Stacks",
        "How one block becomes a hundred-layer model — and why encoder and decoder stacks are arranged differently.",
        ["Assemble a transformer block from attention, FFN, residuals, and layernorm", "Contrast encoder and decoder stacks, including cross-attention"],
        ["write-code", "concept-check", "derive"],
        [
          ch(
            "Assembling the Block",
            "The repeating unit behind every transformer",
            [
              L("The Block: Attention, Feed-Forward, Residuals, Norm", 40, ["transformer block", "feed-forward layer", "pre-norm vs post-norm"], "Bolt the four parts together in order and trace one token's path through the block.", "worked-example", 3),
              L("The Residual Highway and Layer Normalization", 30, ["residual connection", "layer normalization", "gradient flow"], "The plumbing that keeps hundred-layer stacks trainable — G2's lessons, applied.", "concept", 2),
            ]
          ),
          ch(
            "Encoder and Decoder Stacks",
            "Two arrangements of the same block, two different jobs",
            [
              L("The Encoder Stack: Bidirectional Context", 30, ["encoder", "bidirectional", "contextual representation"], "Every token attends to every token — the arrangement BERT made famous.", "concept", 2),
              L("The Decoder Stack: Predict One Token at a Time", 35, ["decoder", "causal mask", "autoregressive"], "The triangle mask that stops a decoder from peeking at the future.", "worked-example", 3),
              L("Cross-Attention: Where the Decoder Reads the Encoder", 30, ["cross-attention", "seq2seq", "query-key-value roles"], "The bridge between two stacks: queries from the decoder, keys and values from the encoder.", "concept", 2),
            ]
          ),
        ]
      ),
      mod(
        "The Model Families",
        "Two pretraining objectives, two model personalities — and the fine-tuning workflow practitioners actually run.",
        ["Contrast BERT's and GPT's training objectives and what each is good for", "Fine-tune a pretrained model on a custom task"],
        ["case-analysis", "write-code", "concept-check"],
        [
          ch(
            "BERT vs GPT",
            "Two pretraining objectives, two model personalities",
            [
              L("BERT: Masked Language Modeling, Looking Both Ways", 35, ["masked language modeling", "bidirectional encoder", "MASK token"], "Fill in the blank at scale — and why bidirectionality suits understanding tasks.", "concept", 2),
              L("GPT: Next-Token Prediction at Scale", 35, ["next-token prediction", "autoregressive", "decoder-only"], "Predict the next token, forever — the objective behind the generative era.", "concept", 2),
              L("Pretraining vs Fine-Tuning: What the Loss Shapes", 30, ["pretraining", "fine-tuning", "task head"], "Why a model pretrained on trillions of tokens needs hours, not months, on your task.", "concept", 2),
            ]
          ),
          ch(
            "Fine-Tuning in Practice",
            "The workflow practitioners actually run",
            [
              L("Fine-Tuning a Pretrained Model on Your Task", 40, ["fine-tuning", "classification head", "gentle learning rates"], "Add a head, freeze or thaw, train gently — the recipe and its classic failure modes.", "code", 4),
              L("LoRA and Parameter-Efficient Fine-Tuning", 35, ["LoRA", "adapters", "trainable parameter budget"], "Train a small fraction of the weights and keep the rest frozen — how and when that works."),
            ]
          ),
        ]
      ),
      mod(
        "The Ecosystem and Its Costs",
        "The libraries that made transformers usable — and the economics of running them.",
        ["Run a fine-tuning and inference workflow with the Hugging Face stack", "Reason about context length, cost, and model size honestly"],
        ["dataset-task", "case-analysis", "interpret-results"],
        [
          ch(
            "Hugging Face in Practice",
            "The libraries that made transformers usable",
            [
              L("Transformers, Datasets, Tokenizers: The Three Libraries", 35, ["transformers", "datasets", "tokenizers"], "The standard stack: what each library owns and how the three click together.", "code", 3),
              L("A Fine-Tuning Run with Trainer, Understood", 40, ["Trainer", "TrainingArguments", "loop vs framework"], "Run the Trainer on a real task — then map every argument back to the loop you already know.", "code", 4),
            ]
          ),
          ch(
            "The Economics of Context",
            "What attention costs, and how to choose a model honestly",
            [
              L("Context Length: The Quadratic Cost of Attention", 35, ["quadratic complexity", "context window", "throughput"], "Why doubling context more than doubles the bill — the arithmetic behind the limits.", "worked-example", 3),
              L("Choosing a Model Size Honestly", 30, ["model cards", "benchmark skepticism", "cost per inference"], "Read model cards like a buyer: base versus instruct, licenses, and honest benchmark reading.", "concept", 3),
            ]
          ),
        ]
      ),
    ],
    finalExam: exam("Transformers Fundamentals Final", 55, 22),
    projects: [
      proj(
        "Single-Head Attention From Scratch in NumPy",
        "Implement scaled dot-product self-attention in plain NumPy: project Q, K, V, compute the weights, apply them — then verify its properties (rows sum to one, order-blindness without positional information) and visualize the weight matrix on a toy sentence.",
        6,
        "guided",
        [
          "Attention implementation with shape tests on every intermediate",
          "Property tests: attention rows sum to one, and permuting inputs permutes outputs",
          "Visualization notebook on a toy sentence with honestly-labeled weights",
        ],
        [
          "The formula is correct, including the sqrt(d_k) scaling",
          "The property tests actually assert the mathematical properties",
          "The visualization is legible and its limits are stated",
        ],
        ["python", "numpy", "matplotlib"]
      ),
      proj(
        "Fine-Tune a Transformer for Text Classification",
        "Pick a public text classification dataset, fine-tune a small pretrained encoder (DistilBERT-class) with the Hugging Face stack, compare it against a pre-transformer baseline from the previous subject, and write a model-card-style README documenting data, metrics, and compute.",
        10,
        "independent",
        [
          "Fine-tuning script with tokenization matched to the pretrained model",
          "Evaluation report comparing against the non-transformer baseline",
          "Model-card-style README with data, metrics, and compute used",
        ],
        [
          "Tokenization and model are correctly matched (inputs the model was pretrained on)",
          "The held-out evaluation is honest and single-use",
          "The comparison controls for data and reports compute honestly",
        ],
        ["python", "pytorch", "transformers"]
      ),
    ],
    placementEligible: true,
  },
  {
    slug: "model-deployment",
    school: "G",
    code: "G8",
    title: "Model Deployment",
    blurb:
      "From a notebook that works once to a service that works always: APIs, batching, monitoring, drift, CI, and the honest economics of serving models.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["pytorch", "git-github"],
    softPrerequisites: [],
    objectives: [
      "Package a trained model so it runs outside the notebook that made it",
      "Expose predictions behind an HTTP API with correct, shared preprocessing",
      "Tune serving for latency or throughput deliberately, with measurements",
      "Instrument a deployed model with logging, drift detection, and safe release patterns",
      "Set up CI checks that catch model regressions before they ship",
      "Reason about cost, scaling, privacy, and safety like the person on the hook",
    ],
    outcomes: [
      "A learner can ship a trained model behind a FastAPI-style endpoint with tests",
      "A learner can measure and report latency percentiles and throughput for a served model",
      "A learner can detect drift from logged predictions and propose a retraining decision",
      "A learner can list the checks a model must pass before deployment and defend each",
    ],
    keywords: ["model deployment", "model serving", "FastAPI", "batching", "latency", "monitoring", "drift", "MLOps"],
    modules: [
      mod(
        "From Notebook to Service",
        "Why working-in-a-notebook is not working-in-production — and how models actually travel.",
        ["Package a trained model so it runs outside the notebook that made it", "Version model artifacts with the same discipline as code"],
        ["write-code", "concept-check", "case-analysis"],
        [
          ch(
            "The Deployment Gap",
            "Why a notebook is not a product",
            [
              L("A Notebook Is Not a Product", 30, ["deployment gap", "hidden state", "production requirements"], "The five assumptions notebooks quietly make — and how each one breaks in production.", "concept", 2),
              L("Pinning Code, Data, and Weights for Reproducibility", 35, ["environment pinning", "data versioning", "model registry"], "Lock down everything a prediction depends on: environment, preprocessing, weights.", "concept", 2),
            ]
          ),
          ch(
            "Serialization and Versioning",
            "How models travel between machines and months",
            [
              L("state_dict, ONNX, and TorchScript: How Models Travel", 35, ["state_dict", "ONNX", "TorchScript"], "Three ways to package a model — and what each one preserves or gives up.", "code", 3),
              L("Versioning Models Like Code", 30, ["model versioning", "model registry", "immutable artifacts"], "Immutable artifacts plus a registry: how teams answer which model is live right now.", "concept", 2),
            ]
          ),
        ]
      ),
      mod(
        "Serving Predictions",
        "The prediction endpoint done properly, and tuned for the metric you actually promised.",
        ["Expose a model behind an HTTP API with correct, shared preprocessing", "Tune a serving stack for latency or throughput deliberately"],
        ["write-code", "debug", "interpret-results"],
        [
          ch(
            "The Model API",
            "The prediction endpoint, done properly",
            [
              L("Wrapping a Model in a FastAPI-Style Endpoint", 40, ["FastAPI", "request schema", "prediction endpoint"], "Build a predict endpoint: schema in, tensor out, and no preprocessing left behind in a notebook.", "code", 4),
              L("Preprocessing Is Part of the Model", 30, ["train-serve skew", "preprocessing pipeline", "shared code"], "The top cause of silent prediction drift: preprocessing that differs between training and serving.", "concept", 2),
            ]
          ),
          ch(
            "Performance",
            "Latency versus throughput — the two dials of serving",
            [
              L("Latency vs Throughput: Two Different Goals", 35, ["latency", "throughput", "p99"], "One request in ten milliseconds or ten thousand requests per second — why you often cannot have both.", "concept", 3),
              L("Dynamic Batching and GPU Serving", 35, ["dynamic batching", "queue depth", "batch timeout"], "Collect requests into batches on a timer — the trick behind efficient GPU serving.", "code", 3),
            ]
          ),
        ]
      ),
      mod(
        "Operations",
        "A deployed model is a system you watch, test, and carefully replace.",
        ["Instrument a deployed model with logging, monitoring, and drift detection", "Set up the CI checks that catch model regressions before deploy"],
        ["write-code", "case-analysis", "debug"],
        [
          ch(
            "Monitoring",
            "A deployed model is a system you watch, not a file you forget",
            [
              L("Logging Predictions Without Leaking PII", 30, ["prediction logging", "PII", "data minimization"], "Log the inputs you need for debugging — and nothing the privacy policy forbids.", "concept", 2),
              L("Data Drift and Concept Drift", 35, ["data drift", "concept drift", "monitoring metrics"], "The world moves: inputs change, relationships change — here is how to notice each in time.", "concept", 3),
              L("Shadow Deployments and Canary Releases", 30, ["shadow deployment", "canary", "rollback"], "Ship new models the way engineers ship code: quietly, partially, reversibly.", "concept", 2),
            ]
          ),
          ch(
            "CI for Models",
            "Tests that run on every commit — for models",
            [
              L("The Model Test Suite: Contract, Performance, Sanity", 40, ["inference contract tests", "performance gates", "behavioral tests"], "Three tiers of checks: shapes and schemas, metric floors, behavioral spot checks.", "code", 4),
              L("Retraining Triggers and the Retrain Decision", 30, ["retraining trigger", "automation limits", "human gates"], "When to retrain: thresholds, schedules, and the judgment automation cannot replace."),
            ]
          ),
        ]
      ),
      mod(
        "The Honest Production Layer",
        "The money, hardware, and responsibility questions nobody demos.",
        ["Estimate the unit economics of a prediction endpoint", "Apply privacy and safety basics to a deployed model"],
        ["case-analysis", "interpret-results", "concept-check"],
        [
          ch(
            "Cost and Scale",
            "The money and hardware questions nobody demos",
            [
              L("The Unit Economics of a Prediction", 35, ["cost per prediction", "utilization", "fixed vs variable cost"], "Divide the bill by the requests: what a prediction actually costs at three different scales.", "worked-example", 3),
              L("CPU, GPU, or Managed API: Choosing the Serving Tier", 30, ["serving tier", "build vs buy", "autoscaling"], "The honest decision tree — including when a hosted API beats your own cluster.", "concept", 3),
            ]
          ),
          ch(
            "Safety and Wrap-Up",
            "The responsibilities that ship with the model",
            [
              L("Privacy, Consent, and Data Minimization", 30, ["consent", "retention", "purpose limitation"], "What you may log, what you must delete, and what you should never have collected.", "concept", 2),
              L("The Deployment Checklist", 25, ["pre-flight checklist", "rollback plan", "review"], "The one-page pre-flight list that catches most production surprises — commit it to memory.", "review", 3),
            ]
          ),
        ]
      ),
    ],
    finalExam: exam("Model Deployment Final", 50, 20),
    projects: [
      proj(
        "Ship a Model Behind an API",
        "Take a model you trained earlier in the school (the MNIST classifier or the CIFAR CNN) and ship it: a FastAPI service with health and predict endpoints, preprocessing shared with the training code, an automated test suite, and a measured latency and throughput report.",
        12,
        "independent",
        [
          "API service with /health and /predict endpoints",
          "Test suite covering the inference contract and behavioral spot checks",
          "Benchmark report with latency percentiles and throughput, methodology stated",
        ],
        [
          "Preprocessing is imported from one shared module, never copied",
          "Tests run headless and would fit a CI pipeline unchanged",
          "Benchmarks are measured, not asserted, with their methodology written down",
        ],
        ["python", "fastapi", "pytorch"]
      ),
      proj(
        "The Drift Monitor",
        "Build a monitoring mini-stack for a served model: log predictions and aggregate features, compute drift statistics between two time windows, alert on a threshold you justify, and demonstrate the whole loop on an injected drift scenario.",
        8,
        "guided",
        [
          "Logging middleware writing to SQLite with no PII by construction",
          "Drift report comparing two windows with the statistics used",
          "Documented alert threshold and its false-positive tradeoff",
        ],
        [
          "The injected drift is actually detected by your statistics",
          "Thresholds are justified quantitatively, not picked from thin air",
          "The logged schema provably contains no identifiers",
        ],
        ["python", "numpy", "sqlite"]
      ),
    ],
    placementEligible: true,
  },
];
