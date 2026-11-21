/**
 * SCHOOL G — DEEP LEARNING & AI · PLACEMENT BANKS
 *
 * Exactly ten questions per subject (80 total): 3 recall, 4 applied,
 * 3 judgment, spanning all modules. A working deep-learning
 * practitioner should score 9–10; a newcomer 0–3. Distractors encode
 * the classic misconceptions ("more layers is always better",
 * "attention is literally human attention"). Exactly one correct
 * option per question; no "all of the above".
 */
import type { PlacementBank } from "../../types";

export const schoolGPlacement: PlacementBank = {
  "neural-networks": [
    {
      id: "neural-networks-p1",
      prompt: "Why is a nonlinear activation function essential between layers of a neural network?",
      options: [
        "Without it, a stack of linear layers mathematically collapses into a single linear transformation",
        "It keeps every neuron's output between 0 and 1, which training requires",
        "It makes matrix multiplications run faster on modern hardware",
        "It prevents network weights from ever becoming negative",
      ],
      answer: 0,
      explanation:
        "Composing linear maps yields another linear map, so depth adds no expressive power until a nonlinearity breaks the composition.",
    },
    {
      id: "neural-networks-p2",
      prompt: "Which activation function became the default choice for hidden layers in modern deep networks?",
      options: ["Sigmoid", "Tanh", "ReLU", "The step function"],
      answer: 2,
      explanation:
        "ReLU (max(0, x)) is cheap and does not saturate for positive inputs; sigmoid and tanh largely retreated to special-purpose roles like output squashing.",
    },
    {
      id: "neural-networks-p3",
      prompt: "What does the softmax function do at a network's output layer?",
      options: [
        "Squashes each score independently into the range 0 to 1",
        "Converts a vector of scores into a probability distribution that sums to 1",
        "Picks the single largest score and discards the rest",
        "Normalizes the weights of the final layer to sum to 1",
      ],
      answer: 1,
      explanation:
        "Softmax exponentiates all scores and divides by their sum, so outputs are positive and sum to one — a proper distribution over classes.",
    },
    {
      id: "neural-networks-p4",
      prompt: "A hidden layer has 8 neurons and receives a 5-dimensional input. Including biases, how many parameters does the layer have?",
      options: ["40", "48", "13", "45"],
      answer: 1,
      explanation:
        "Weights: 5 × 8 = 40; biases: one per neuron = 8; total 48. Forgetting the biases gives the classic wrong answer 40.",
    },
    {
      id: "neural-networks-p5",
      prompt: "You are building the output layer for a 3-class classifier with mutually exclusive labels. Which combination is standard?",
      options: [
        "Linear output with mean squared error",
        "Sigmoid per class with mean squared error",
        "ReLU output with cross-entropy loss",
        "Softmax output with cross-entropy loss",
      ],
      answer: 3,
      explanation:
        "Softmax turns scores into a distribution over the classes and cross-entropy rewards confident, correct predictions — the standard pairing for multiclass classification.",
    },
    {
      id: "neural-networks-p6",
      prompt: "A single neuron has weights [0.5, -1.0], bias 1.0, and ReLU activation. Given the input [2, 3], what is its output?",
      options: ["0", "-1", "1", "2"],
      answer: 0,
      explanation:
        "The weighted sum is 0.5×2 − 1×3 + 1 = −1, and ReLU clips negatives to zero, so the output is 0.",
    },
    {
      id: "neural-networks-p7",
      prompt: "A classifier assigns probability 0.9 to the correct class. What is its cross-entropy loss for that example (natural log)?",
      options: ["About 0.105", "About 2.303", "About 0.010", "About 0.900"],
      answer: 0,
      explanation:
        "Cross-entropy for the true class is −ln(p) = −ln(0.9) ≈ 0.105. The 2.303 distractor is −ln(0.1), the loss for confidently backing the wrong class.",
    },
    {
      id: "neural-networks-p8",
      prompt: "You have 800 rows of tabular data with 15 features and a numeric target. What is the most sensible first move?",
      options: [
        "A deep 10-layer MLP — depth automatically discovers the right features",
        "Gradient-boosted trees or regularized linear models — likely stronger on small tabular data",
        "A very wide single-layer network with dropout 0.9",
        "Skip the baseline; neural networks dominate all tabular benchmarks anyway",
      ],
      answer: 1,
      explanation:
        "On small tabular datasets, boosted trees and linear models are typically as good or better, cheaper to train, and faster to tune; deep nets need data volume, spatial structure, or both to justify themselves.",
    },
    {
      id: "neural-networks-p9",
      prompt:
        "During training, loss keeps falling on the training set while validation loss bottomed out several epochs ago and is now rising. What is happening, and what is the standard response?",
      options: [
        "Underfitting — increase model capacity immediately",
        "Label leakage — drop the validation set entirely",
        "Overfitting — the model is memorizing; early stopping or more regularization is the standard response",
        "The learning rate is too low — multiply it by ten",
      ],
      answer: 2,
      explanation:
        "The widening train/validation gap is the classic overfitting signature: capacity is being spent memorizing noise. Early stopping, regularization, or more data are the honest responses.",
    },
    {
      id: "neural-networks-p10",
      prompt: "Which statement about adding layers and parameters to a network is true?",
      options: [
        "More layers always improve test accuracy because capacity is king",
        "Depth only helps when the dataset fits in CPU memory",
        "Parameter count has no measurable relationship to training behavior",
        "Extra capacity can hurt generalization; gains depend on data size, structure, and regularization",
      ],
      answer: 3,
      explanation:
        "The belief that more layers is always better is the classic misconception: past the data's complexity, extra capacity mostly buys overfitting unless checked by regularization, augmentation, or more data.",
    },
  ],
  "backpropagation": [
    {
      id: "backpropagation-p1",
      prompt: "Backpropagation is, at its core, a systematic application of which mathematical result?",
      options: ["The chain rule of differentiation", "Matrix inversion", "The central limit theorem", "Lagrange duality"],
      answer: 0,
      explanation:
        "Backprop applies the chain rule to the computation graph, multiplying local derivatives along every path from the loss back to each parameter.",
    },
    {
      id: "backpropagation-p2",
      prompt: "In reverse-mode automatic differentiation, gradients are computed...",
      options: [
        "From inputs to outputs, one parameter at a time",
        "By numerically perturbing every weight and rerunning the network",
        "From the loss backward to all parameters in a single sweep",
        "Only for the layers closest to the output",
      ],
      answer: 2,
      explanation:
        "Reverse mode starts at the loss and propagates gradients backward, computing every parameter's gradient in one pass — the property that makes training million-parameter models feasible.",
    },
    {
      id: "backpropagation-p3",
      prompt: "During backprop, a node's output feeds two different downstream computations. What happens to its gradient?",
      options: [
        "Only the larger of the two incoming gradients is kept",
        "The two gradients are multiplied together",
        "The gradient is split in half between the consumers",
        "The gradients from both consumers are summed",
      ],
      answer: 3,
      explanation:
        "The multivariable chain rule sums gradient contributions over every path: when x feeds both u and v, dL/dx = dL/du·du/dx + dL/dv·dv/dx.",
    },
    {
      id: "backpropagation-p4",
      prompt: "The loss depends on z, and z depends on weight w. If dL/dz = 4 and dz/dw = 0.5, what is dL/dw?",
      options: ["8", "4.5", "0.5", "2"],
      answer: 3,
      explanation:
        "The chain rule multiplies along the path: dL/dw = dL/dz × dz/dw = 4 × 0.5 = 2.",
    },
    {
      id: "backpropagation-p5",
      prompt: "A sigmoid gate outputs 0.8. What is the local gradient of the sigmoid at that point?",
      options: ["0.8", "0.16", "0.64", "0.04"],
      answer: 1,
      explanation:
        "The sigmoid derivative is σ(1 − σ): with σ = 0.8, that is 0.8 × 0.2 = 0.16 — and note the maximum possible value is 0.25.",
    },
    {
      id: "backpropagation-p6",
      prompt: "For the matrix product Y = XW, the gradient of the loss with respect to X is...",
      options: [
        "dL/dY times W",
        "dL/dY times W transposed",
        "W times dL/dY",
        "The element-wise product of dL/dY and W",
      ],
      answer: 1,
      explanation:
        "With Y = XW, dL/dX = (dL/dY)·Wᵀ and dL/dW = Xᵀ·(dL/dY). Checking shapes confirms which transpose goes where.",
    },
    {
      id: "backpropagation-p7",
      prompt: "Gradient checking validates a backward pass by comparing its gradients against...",
      options: [
        "Numerical gradients estimated by finite differences",
        "Gradients from a larger, pretrained network",
        "The gradients computed on the previous epoch",
        "The analytic Hessian of the loss",
      ],
      answer: 0,
      explanation:
        "Finite differences — (L(w+ε) − L(w−ε)) / 2ε — approximate each derivative numerically; agreement within tolerance says the backward pass is correct.",
    },
    {
      id: "backpropagation-p8",
      prompt:
        "A 20-layer network of sigmoid activations trains extremely slowly, with near-zero gradients at the early layers. What is the most likely cause?",
      options: [
        "Sigmoid derivatives are at most 0.25, so their product along deep paths shrinks toward zero — vanishing gradients",
        "Sigmoids make activations negative, canceling the loss",
        "The network is too small to hold a signal",
        "The loss surface has become convex, removing gradients",
      ],
      answer: 0,
      explanation:
        "Multiplying many factors of at most 0.25 (0.25 to the 10th power is already about one in a million) starves early layers of gradient — the classic vanishing-gradient pathology.",
    },
    {
      id: "backpropagation-p9",
      prompt: "Training loss suddenly becomes NaN a few steps into a run. Which response is most defensible first?",
      options: [
        "Increase the learning rate to push through the instability",
        "Add five more layers to dilute the bad gradients",
        "Inspect gradient magnitudes and reduce the learning rate or clip gradients",
        "Ignore it — NaN is a normal phase of deep learning",
      ],
      answer: 2,
      explanation:
        "Sudden NaN usually means exploding updates: checking gradient norms and lowering the learning rate or clipping gradients addresses the cause, not the symptom.",
    },
    {
      id: "backpropagation-p10",
      prompt:
        "Your hand-derived backward pass disagrees with the framework's autograd. What is the fastest way to localize the bug?",
      options: [
        "Re-read the original paper and rewrite everything from scratch",
        "Average the two gradients and continue training",
        "Switch optimizers and see if the loss changes",
        "Run gradient checks op by op from the loss backward to find the first node that disagrees",
      ],
      answer: 3,
      explanation:
        "Bisect the computation: finite-difference check each intermediate node from the loss backward; the first mismatch marks the broken local derivative.",
    },
  ],
  "deep-learning-optimization": [
    {
      id: "deep-learning-optimization-p1",
      prompt: "The Adam optimizer combines which two ideas?",
      options: [
        "Momentum (a moving average of gradients) and per-parameter adaptive step sizes from RMSProp",
        "Dropout and weight decay",
        "Batch normalization and early stopping",
        "Learning-rate warmup and cosine decay",
      ],
      answer: 0,
      explanation:
        "Adam keeps an exponentially weighted mean of gradients (momentum) and of squared gradients (RMSProp-style scaling), with bias correction for the early steps.",
    },
    {
      id: "deep-learning-optimization-p2",
      prompt: "What does weight decay do during training?",
      options: [
        "Randomly zeroes gradients to reduce overfitting",
        "Decays the learning rate on a fixed schedule",
        "Adds a penalty that pulls weights toward zero, shrinking them slightly every step",
        "Deletes the smallest weights at the end of each epoch",
      ],
      answer: 2,
      explanation:
        "Weight decay adds a term proportional to the weights themselves to the update — the deep-learning version of L2 regularization.",
    },
    {
      id: "deep-learning-optimization-p3",
      prompt: "How does (inverted) dropout behave at evaluation time?",
      options: [
        "It drops neurons with the same probability as during training",
        "It doubles the dropout probability to make predictions conservative",
        "It replaces activations with their running averages",
        "It is disabled entirely — all neurons contribute, because scaling happened during training",
      ],
      answer: 3,
      explanation:
        "With inverted dropout, the rescaling is folded into training so evaluation simply uses the full network — one reason evaluation code must call model.eval().",
    },
    {
      id: "deep-learning-optimization-p4",
      prompt: "Loss explodes to enormous values within the first 20 updates. Which knob do you examine first?",
      options: [
        "The batch size — it must be too small",
        "The learning rate — it is almost certainly too high",
        "The number of epochs — it is set too low",
        "The dropout rate — it must be too high",
      ],
      answer: 1,
      explanation:
        "Early divergence is the textbook symptom of too-large steps; lowering the learning rate is the first, cheapest diagnostic move.",
    },
    {
      id: "deep-learning-optimization-p5",
      prompt:
        "Train loss is 0.2 and still falling; validation loss is 1.4 and has been rising for ten epochs. The diagnosis is...",
      options: [
        "Underfitting — the model needs more capacity",
        "Label leakage — the validation set is corrupt",
        "The learning rate is too low to make progress",
        "Overfitting — add regularization, stop early, or get more data",
      ],
      answer: 3,
      explanation:
        "Low training loss with rising validation loss is the overfitting signature: capacity is being spent memorizing the training set.",
    },
    {
      id: "deep-learning-optimization-p6",
      prompt: "What does momentum primarily change about SGD on a long narrow valley (a ravine)?",
      options: [
        "It damps the oscillations across the ravine while accelerating progress along it",
        "It guarantees convergence to the global minimum",
        "It removes the need for a learning rate",
        "It makes each update independent of history",
      ],
      answer: 0,
      explanation:
        "The velocity term accumulates the consistent direction (along the valley) while the opposing components cancel — the classic momentum picture.",
    },
    {
      id: "deep-learning-optimization-p7",
      prompt: "You forget model.eval() before running validation with a batch-norm network. What happens?",
      options: [
        "Nothing — eval() only renames internal modes",
        "Predictions become batch-dependent, because normalization uses the current batch's statistics",
        "The model automatically stops tracking gradients",
        "The learning rate is silently doubled",
      ],
      answer: 1,
      explanation:
        "In train mode, batch norm normalizes with the current batch's statistics, so each prediction depends on the other examples in its batch — usually wrong at inference.",
    },
    {
      id: "deep-learning-optimization-p8",
      prompt: "Which statement about batch size is true?",
      options: [
        "Bigger batches are strictly better — more samples per step always means better models",
        "The optimal batch size is 32 for every problem",
        "Batch size only affects GPU memory, nothing else",
        "Batch size is a tradeoff: very large batches reduce gradient noise, can hurt generalization, and change step-time economics",
      ],
      answer: 3,
      explanation:
        "Batch size shapes gradient noise, generalization, throughput, and memory at once — a knob to reason about, not to max out reflexively.",
    },
    {
      id: "deep-learning-optimization-p9",
      prompt: "When is learning-rate warmup most clearly warranted?",
      options: [
        "Early in training when the model and its statistics are still unstable — notably with transformers and large batches",
        "Only in the final epochs before stopping",
        "Whenever the dataset is small, regardless of training dynamics",
        "Never — warmup is a myth",
      ],
      answer: 0,
      explanation:
        "Warmup starts training with small steps while optimizer statistics and normalization settle — the standard recipe for transformer training from the start.",
    },
    {
      id: "deep-learning-optimization-p10",
      prompt:
        "Validation loss has been flat for several epochs while training loss still creeps down; the gap is moderate. What is the best next action?",
      options: [
        "Add ten more layers to break the plateau",
        "Immediately switch to a larger dataset",
        "Step the learning rate down (or finish the decay schedule) and give the run a little longer",
        "Double the dropout rate and restart from scratch",
      ],
      answer: 2,
      explanation:
        "A flat validation curve with slowly-falling training loss often means the run is coasting at too high a learning rate; a decay step usually lets it settle lower.",
    },
  ],
  "pytorch": [
    {
      id: "pytorch-p1",
      prompt: "What does calling loss.backward() actually do?",
      options: [
        "Updates the model's weights in place",
        "Computes gradients of the loss with respect to tensors that require them, storing the results in their .grad",
        "Returns the gradient as a Python float",
        "Resets all gradients to zero",
      ],
      answer: 1,
      explanation:
        "backward() populates .grad on leaf tensors with requires_grad=True; updating weights is the optimizer's job (optimizer.step()).",
    },
    {
      id: "pytorch-p2",
      prompt: "Why does the standard training loop call optimizer.zero_grad() before each backward pass?",
      options: [
        "Gradients accumulate in .grad across backward calls; without zeroing, each step mixes in stale gradients",
        "It initializes the weights to random values",
        "It frees the GPU memory used by the model",
        "It resets the learning-rate schedule",
      ],
      answer: 0,
      explanation:
        "PyTorch accumulates into .grad by design (useful for gradient accumulation); the standard loop zeroes first so each step uses only the current batch's gradient.",
    },
    {
      id: "pytorch-p3",
      prompt: "What does model.eval() change?",
      options: [
        "Switches modules like dropout and batch norm to inference behavior; it does not disable gradient tracking by itself",
        "Disables gradient computation automatically",
        "Moves the model to the GPU",
        "Deletes the optimizer state",
      ],
      answer: 0,
      explanation:
        "eval() flips module behavior (dropout off, batch norm to running statistics); stopping autograd requires torch.no_grad() or inference mode — a classic distinction.",
    },
    {
      id: "pytorch-p4",
      prompt: "Training crashes with 'Expected all tensors to be on the same device'. What is the most likely cause?",
      options: [
        "The learning rate is too high",
        "The model's dtype is float64",
        "The input batch (or the loss targets) is still on CPU while the model is on GPU",
        "The batch size is zero",
      ],
      answer: 2,
      explanation:
        "Device mismatches are the classic .to(device) bug: model, inputs, and targets must all live on the same device.",
    },
    {
      id: "pytorch-p5",
      prompt: "nn.Linear(10, 5) receives an input of shape (32, 10). What is the output shape?",
      options: ["(5, 32)", "(32, 5)", "(10, 5)", "(32, 10, 5)"],
      answer: 1,
      explanation:
        "nn.Linear applies its (5, 10) weight matrix to the last dimension of the input, mapping 10 features to 5 for each of the 32 examples.",
    },
    {
      id: "pytorch-p6",
      prompt: "To plug a custom Dataset into a DataLoader, which methods must it implement?",
      options: ["fit and transform", "forward and backward", "save and load", "__len__ and __getitem__"],
      answer: 3,
      explanation:
        "The Dataset contract is length plus indexed access; the DataLoader handles batching, shuffling, and parallel loading.",
    },
    {
      id: "pytorch-p7",
      prompt: "Besides model weights, what must a checkpoint include to resume training exactly where it stopped?",
      options: [
        "Optimizer state (e.g., momentum buffers), plus epoch and RNG state for exactness",
        "Only the final loss value",
        "The DataLoader object only",
        "Nothing — optimizer state is recomputed from the weights",
      ],
      answer: 0,
      explanation:
        "Momentum and second-moment buffers live in the optimizer; without saving optimizer.state_dict(), a resumed run behaves differently from a continuous one.",
    },
    {
      id: "pytorch-p8",
      prompt: "Which combination is correct for a validation loop?",
      options: [
        "model.train() together with torch.no_grad()",
        "model.eval() together with torch.no_grad()",
        "model.eval() with gradients enabled — it is faster",
        "torch.no_grad() alone is enough for models that contain batch norm",
      ],
      answer: 1,
      explanation:
        "eval() fixes module behavior (dropout, batch norm) and no_grad() stops graph construction; you need both, and each alone is a classic bug.",
    },
    {
      id: "pytorch-p9",
      prompt: "You run a forward pass inside torch.no_grad() and then call backward() on the result. What happens?",
      options: [
        "It silently returns zero gradients",
        "It raises an error — no computation graph was recorded, so there is nothing to backpropagate through",
        "It works, just slower",
        "It updates the weights twice",
      ],
      answer: 1,
      explanation:
        "no_grad() builds no graph; backward() then fails because the loss is not connected to any recorded operations.",
    },
    {
      id: "pytorch-p10",
      prompt: "GPU utilization sits around 15% during training, and each step is slow. Where is the most likely bottleneck?",
      options: [
        "The model has too few parameters to saturate the GPU",
        "The learning rate is too low",
        "There is too much dropout",
        "The CPU-side data pipeline starving the GPU — slow loading or heavy per-item preprocessing",
      ],
      answer: 3,
      explanation:
        "An idle GPU almost always points at the data path: more workers, simpler transforms, or prefetching — not at the model or hyperparameters.",
    },
  ],
  "computer-vision": [
    {
      id: "computer-vision-p1",
      prompt: "Why do convolutions suit images better than fully connected layers?",
      options: [
        "They are mathematically simpler, so they converge faster",
        "They eliminate the need for pooling and normalization",
        "Local receptive fields and shared weights exploit spatial structure while using far fewer parameters",
        "They work equally well on any data type, including text",
      ],
      answer: 2,
      explanation:
        "Images have local, translation-repeating structure; convolutions hard-code that prior as weight sharing and local connectivity — an inductive bias that pays for itself.",
    },
    {
      id: "computer-vision-p2",
      prompt: "A 2x2 max-pooling layer with stride 2 is applied to a 224x224 feature map. What is the result?",
      options: ["112x112", "222x222", "448x448", "44x44"],
      answer: 0,
      explanation:
        "Stride-2 pooling halves each spatial dimension: 224 / 2 = 112 — and it has no learnable parameters.",
    },
    {
      id: "computer-vision-p3",
      prompt: "What was ResNet's key architectural innovation?",
      options: [
        "Skip (residual) connections that let layers learn residuals and gradients bypass blocks",
        "Replacing convolutions with fully connected layers",
        "Much bigger kernels for more context",
        "Removing normalization to speed up training",
      ],
      answer: 0,
      explanation:
        "Residual connections add a block's input to its output, giving gradients a path that bypasses the block — the trick that made 100+ layer networks trainable.",
    },
    {
      id: "computer-vision-p4",
      prompt: "A convolution has input size 32x32, kernel 5x5, padding 2, stride 1. What is the output spatial size?",
      options: ["28", "30", "32", "34"],
      answer: 2,
      explanation:
        "Out = (H + 2P − K)/S + 1 = (32 + 4 − 5)/1 + 1 = 32. Padding 2 with a 5x5 kernel preserves size — the 'same' configuration.",
    },
    {
      id: "computer-vision-p5",
      prompt: "A Conv2d layer has in_channels=3, out_channels=16, kernel_size=3. Including biases, how many parameters does it have?",
      options: ["432", "448", "464", "144"],
      answer: 1,
      explanation:
        "Each of the 16 filters has 3×3×3 = 27 weights (432 total) plus 16 biases: 448. Forgetting the input channels (144) or the biases (432) are the classic slips.",
    },
    {
      id: "computer-vision-p6",
      prompt: "In the first phase of the standard transfer-learning recipe, you freeze the backbone and train...",
      options: [
        "The whole network with a high learning rate",
        "Only the batch-norm statistics",
        "The new classification head you added on top",
        "Only the first convolutional layer",
      ],
      answer: 2,
      explanation:
        "Phase one trains the randomly initialized head to interpret the frozen features; phase two optionally thaws the backbone with a small learning rate.",
    },
    {
      id: "computer-vision-p7",
      prompt: "For a handwritten digit classifier, which augmentation is most likely to corrupt labels?",
      options: [
        "Slightly shifting the image by a few pixels",
        "Adding mild Gaussian noise",
        "Cropping 90% of the image while keeping the digit centered",
        "Rotating images by 180 degrees — a 6 can become something that reads as a 9",
      ],
      answer: 3,
      explanation:
        "Augmentation must preserve the label; large rotations of digits can change which digit it is, so the safe menu for MNIST-like data is small in scope.",
    },
    {
      id: "computer-vision-p8",
      prompt: "You have 500 labeled images per class across 10 classes. Which approach is most defensible first?",
      options: [
        "Transfer learning from a pretrained backbone, with augmentation, then fine-tuning",
        "Training a large CNN from scratch — it will learn everything it needs",
        "Flattening the images and using a deep MLP",
        "Waiting until you have a million images to start",
      ],
      answer: 0,
      explanation:
        "5,000 images is far too few to train a competitive CNN from scratch, but plenty to adapt pretrained features — the default workflow for small datasets.",
    },
    {
      id: "computer-vision-p9",
      prompt: "Why do residual connections help very deep networks train?",
      options: [
        "They double the effective parameter count",
        "They give gradients a path that bypasses blocks, mitigating vanishing gradients over depth",
        "They make the loss landscape convex",
        "They remove the need for normalization layers",
      ],
      answer: 1,
      explanation:
        "The identity path lets error signals reach early layers undiminished — a direct application of the gradient-flow lessons from backpropagation.",
    },
    {
      id: "computer-vision-p10",
      prompt: "Which description of CNN feature maps is accurate?",
      options: [
        "Layer one detects complete objects; deeper layers detect edges",
        "Feature maps are random noise until the final layer",
        "All layers detect the same features at different resolutions",
        "Early layers tend to detect simple patterns like edges and blobs; deeper layers compose them into parts and objects",
      ],
      answer: 3,
      explanation:
        "The feature hierarchy — edges to textures to parts to objects — is the empirical pattern that made depth the organizing principle of vision models.",
    },
  ],
  "nlp": [
    {
      id: "nlp-p1",
      prompt: "What is the main advantage of subword tokenization (like BPE) over word-level tokenization?",
      options: [
        "It makes every sentence exactly one token",
        "It removes the need for embeddings",
        "It handles rare and unseen words by decomposing them into frequent pieces, balancing vocabulary size and coverage",
        "It guarantees tokens are always whole words",
      ],
      answer: 2,
      explanation:
        "A subword vocabulary covers any string — down to characters if needed — so an unseen word becomes known pieces instead of an unknown token.",
    },
    {
      id: "nlp-p2",
      prompt: "An embedding layer is best described as...",
      options: [
        "A compression algorithm for storing text",
        "A lookup table from token IDs to dense, trainable vectors",
        "A count of how often each word appears",
        "A fixed dictionary of meanings from a textbook",
      ],
      answer: 1,
      explanation:
        "nn.Embedding holds a vocab-size-by-dimension matrix; indexing it with token IDs retrieves rows that training updates like any other parameter.",
    },
    {
      id: "nlp-p3",
      prompt: "What is the core limitation of bag-of-words features for capturing meaning?",
      options: [
        "They discard word order and structure, so 'dog bites man' and 'man bites dog' look identical",
        "Their vectors are always too small to be useful",
        "They cannot represent rare words",
        "They require GPU hardware",
      ],
      answer: 0,
      explanation:
        "Bag-of-words keeps only which words appeared, not how they were arranged — and order plus composition are exactly what meaning often depends on.",
    },
    {
      id: "nlp-p4",
      prompt: "You pad short sentences with [PAD] tokens so they can be batched. What must accompany the padding?",
      options: [
        "Nothing — models naturally ignore padding tokens",
        "A mask marking which positions are real tokens, so pooling and attention can ignore the filler",
        "The padding must be removed between layers",
        "Padding with the most frequent word instead",
      ],
      answer: 1,
      explanation:
        "Padding is invisible to the model unless you say so: masks let pooling and attention skip the filler positions instead of diluting real signal.",
    },
    {
      id: "nlp-p5",
      prompt:
        "In a well-trained embedding space, cosine similarity is high between 'king' and 'queen' but low between 'king' and 'carburetor'. Why?",
      options: [
        "Words appearing in similar contexts end up with similar vectors — the distributional hypothesis at work",
        "The words have similar spelling lengths",
        "The words are close alphabetically",
        "It is an accident — embedding vectors are random",
      ],
      answer: 0,
      explanation:
        "Training pulls words that share contexts toward each other, so meaning-related words end up close in cosine terms while unrelated ones drift apart.",
    },
    {
      id: "nlp-p6",
      prompt: "A word never seen during BPE training appears at inference time. What happens?",
      options: [
        "The model raises an exception and stops",
        "It is replaced with a random vocabulary token",
        "The whole sentence is discarded",
        "It is decomposed into known subword units — possibly down to single characters",
      ],
      answer: 3,
      explanation:
        "Subword tokenizers fall back to smaller pieces, so unseen words still map to a sequence of known tokens rather than an unknown symbol.",
    },
    {
      id: "nlp-p7",
      prompt: "What do LSTM gates accomplish?",
      options: [
        "They enlarge the vocabulary",
        "They learn when to keep, write, and forget information, protecting a memory lane across many timesteps",
        "They parallelize training across the sequence dimension",
        "They replace the need for embeddings",
      ],
      answer: 1,
      explanation:
        "Gates are learned sigmoid switches that modulate what enters and leaves the cell state — the fix to the plain RNN's vanishing-gradient memory problem.",
    },
    {
      id: "nlp-p8",
      prompt: "A review dataset is 90% positive. Which metric do you trust least for a classifier?",
      options: [
        "The confusion matrix",
        "F1 score of the positive class",
        "Precision and recall per class",
        "Raw accuracy — an always-positive classifier already scores 90%",
      ],
      answer: 3,
      explanation:
        "Under heavy imbalance, accuracy is dominated by the majority class; per-class precision, recall, F1, and the confusion matrix tell the real story.",
    },
    {
      id: "nlp-p9",
      prompt: "What was the sequence bottleneck that motivated attention in encoder-decoder models?",
      options: [
        "RNNs trained too fast for GPUs to keep up",
        "Compressing the entire source sentence into one fixed-size vector loses information, especially for long inputs",
        "Loss values were too small to optimize",
        "Batch sizes were limited by disk space",
      ],
      answer: 1,
      explanation:
        "One vector for a whole sentence is a hard information ceiling; attention let each output position read from all input positions directly.",
    },
    {
      id: "nlp-p10",
      prompt: "A colleague says: 'attention works because the model literally pays attention like a human.' What is the honest response?",
      options: [
        "Yes — models have subjective focus and intention",
        "Yes — attention was reverse-engineered from eye-tracking data",
        "It is a learned weighted average computed from query, key, and value projections — the name is an analogy, not cognition",
        "It is unknowable — attention weights have no interpretation at all",
      ],
      answer: 2,
      explanation:
        "Attention weights are softmax-normalized dot products between learned projections; they can be inspected, but they are arithmetic, not a mind.",
    },
  ],
  "transformers": [
    {
      id: "transformers-p1",
      prompt: "In self-attention, the attention weights are computed by...",
      options: [
        "Passing the values through a sigmoid",
        "Convolving the input sequence with a learned kernel",
        "Averaging the positional encodings",
        "Applying softmax to the scaled dot products between queries and keys",
      ],
      answer: 3,
      explanation:
        "Weights = softmax(QKᵀ / √d_k); the output is those weights applied to V. The scores come from queries meeting keys, not from the values.",
    },
    {
      id: "transformers-p2",
      prompt: "Why does attention scale the dot products by 1/sqrt(d_k)?",
      options: [
        "It reduces the memory needed for the attention matrix",
        "Large-dimensional dot products grow in magnitude, pushing softmax into saturated regions with tiny gradients",
        "It normalizes the positional encodings",
        "It is a historical bug that became convention",
      ],
      answer: 1,
      explanation:
        "With dimension d, dot-product magnitudes scale with d; dividing by √d keeps the softmax in a responsive range with usable gradients.",
    },
    {
      id: "transformers-p3",
      prompt: "Why do transformers need positional encodings at all?",
      options: [
        "To compress the vocabulary",
        "To initialize the weights",
        "Self-attention is permutation-equivariant — without injected position information, order is invisible to the model",
        "To speed up the matrix multiplies",
      ],
      answer: 2,
      explanation:
        "Shuffle the tokens and plain self-attention produces the same shuffled outputs; position must be added explicitly for order to matter.",
    },
    {
      id: "transformers-p4",
      prompt: "A model uses 8 attention heads with d_model = 512. Each head operates on what dimension?",
      options: ["512", "8", "4096", "64"],
      answer: 3,
      explanation:
        "Multi-head attention splits d_model across heads: 512 / 8 = 64 dimensions per head, concatenated back to 512 after attention.",
    },
    {
      id: "transformers-p5",
      prompt: "The causal mask in a decoder exists to...",
      options: [
        "Prevent each position from attending to future positions",
        "Remove padding tokens from attention",
        "Encode word order",
        "Reduce the sequence length during training",
      ],
      answer: 0,
      explanation:
        "Causal masking sets future scores to negative infinity before softmax, preserving the autoregressive property that each token depends only on the past.",
    },
    {
      id: "transformers-p6",
      prompt: "BERT's pretraining objective is...",
      options: [
        "Next-token prediction, strictly left to right",
        "Reinforcement learning from human feedback",
        "Image inpainting",
        "Masked language modeling — predicting masked tokens with bidirectional context",
      ],
      answer: 3,
      explanation:
        "BERT masks some tokens and predicts them using both left and right context; next-token prediction is the GPT family's objective.",
    },
    {
      id: "transformers-p7",
      prompt: "How do GPT-family models generate text?",
      options: [
        "All tokens at once, filling in blanks like a masked model",
        "Autoregressively — one token at a time, each conditioned on all previous tokens",
        "By retrieving and stitching together nearest training documents",
        "By sampling from a fixed grammar of templates",
      ],
      answer: 1,
      explanation:
        "GPT is decoder-only and causal: it predicts the next token given the prefix, appends it, and repeats — which is why generation cost grows with length.",
    },
    {
      id: "transformers-p8",
      prompt: "Why did transformers largely displace RNNs for large-scale NLP?",
      options: [
        "They use less memory than RNNs for very long sequences",
        "RNNs were removed from the major frameworks",
        "They need no training data",
        "Attention parallelizes across the sequence during training, so big models and datasets became practical",
      ],
      answer: 3,
      explanation:
        "Recurrence forces sequential computation; attention processes all positions in parallel — the hardware alignment that unlocked scaling. (For very long contexts, attention's quadratic cost is actually a burden, not a benefit.)",
    },
    {
      id: "transformers-p9",
      prompt: "Doubling the context window of a vanilla transformer does what to attention compute?",
      options: [
        "Roughly quadruples it — attention scales with sequence length squared",
        "Doubles it",
        "Halves it thanks to better parallelism",
        "Nothing — attention is constant-time in sequence length",
      ],
      answer: 0,
      explanation:
        "The attention matrix is length by length, so compute and memory grow quadratically: doubling context costs roughly four times the attention work.",
    },
    {
      id: "transformers-p10",
      prompt: "You must classify 10,000 support tickets on a tiny budget, CPU only. What is the most defensible choice?",
      options: [
        "Pretrain your own large decoder from scratch on the tickets",
        "Use the largest available generative model with no adaptation, because bigger is always better",
        "Fine-tune a small pretrained encoder (DistilBERT-class) briefly and serve it",
        "One-hot encode the words and feed them to a deep CNN",
      ],
      answer: 2,
      explanation:
        "A small pretrained encoder fine-tuned briefly is cheap on CPU and strong at text classification; pretraining from scratch and always-largest are both budget fantasies.",
    },
  ],
  "model-deployment": [
    {
      id: "model-deployment-p1",
      prompt: "What is the most common cause of train/serve skew?",
      options: [
        "Preprocessing that differs between the training pipeline and the serving pipeline",
        "GPU clock speeds drifting over time",
        "Serving too few requests per second",
        "Using the same model version in both places",
      ],
      answer: 0,
      explanation:
        "When normalization, tokenization, or feature logic is re-implemented (or reordered) for serving, the model receives subtly different inputs than it was trained on.",
    },
    {
      id: "model-deployment-p2",
      prompt: "In a shadow deployment, the new model...",
      options: [
        "Immediately replaces the old model for all users",
        "Trains itself on production traffic",
        "Receives live traffic and its predictions are logged but not shown to users",
        "Is shown to users only during off-peak hours",
      ],
      answer: 2,
      explanation:
        "Shadowing compares the candidate against the incumbent on real traffic with zero user risk — a standard step before a canary or full rollout.",
    },
    {
      id: "model-deployment-p3",
      prompt: "Dynamic batching in a serving stack primarily improves...",
      options: [
        "Throughput — by grouping concurrent requests into one batch, usually trading a small bounded latency cost",
        "Tail latency in every case",
        "Model accuracy",
        "Disk usage",
      ],
      answer: 0,
      explanation:
        "GPUs are efficient on batches; dynamic batching collects requests within a short window to fill them, raising throughput at a bounded wait cost.",
    },
    {
      id: "model-deployment-p4",
      prompt: "Your service must answer within 50 ms at the 99th percentile. Which number do you optimize first?",
      options: [
        "Average latency, since it is easier to measure",
        "The p99 latency itself — the tail is the contract, even at throughput cost",
        "Total requests served per day",
        "The model's parameter count",
      ],
      answer: 1,
      explanation:
        "SLAs are written on tails: a fast average with a slow p99 still violates the contract. Optimize the percentile the contract names.",
    },
    {
      id: "model-deployment-p5",
      prompt: "What is the safest standard way to ship a PyTorch model between machines and library versions?",
      options: [
        "Pickle the entire nn.Module object",
        "Export the weights as a CSV of numbers",
        "Screenshot the architecture and retype it",
        "Save the state_dict plus the code that defines the model class, then load weights into a rebuilt model",
      ],
      answer: 3,
      explanation:
        "A state_dict (weights only) travels better than pickled objects, which bind to exact class paths and code versions — a portability trap.",
    },
    {
      id: "model-deployment-p6",
      prompt:
        "For three weeks, logged input feature distributions have shifted while the prediction distribution barely moved. What is this, and what does it suggest?",
      options: [
        "Concept drift — the label relationship changed overnight",
        "A logging bug — ignore it until the dashboards improve",
        "The model is learning online in production",
        "Data drift — inputs are moving away from training data; watch quality metrics and consider retraining",
      ],
      answer: 3,
      explanation:
        "Input distributions moving is data drift; stable predictions do not guarantee stable quality — check metrics on fresh labeled data and plan the retraining decision.",
    },
    {
      id: "model-deployment-p7",
      prompt: "Which set of checks belongs in a model CI pipeline?",
      options: [
        "Inference contract tests (shapes, schemas), metric floors on a held-out set, and behavioral spot checks",
        "Only linting of the API code",
        "Only unit tests for the web framework",
        "None — models cannot be tested automatically",
      ],
      answer: 0,
      explanation:
        "Model CI checks the interface (so serving does not crash), the quality floor (so regressions are caught), and known behaviors (so surprises surface before users see them).",
    },
    {
      id: "model-deployment-p8",
      prompt: "A team decides to retrain every model automatically every night. What is the fair assessment?",
      options: [
        "Perfectly safe — automation always beats monitoring",
        "Over-automated: retraining has real cost and risk; triggers should be based on drift and metrics, with evaluation gates",
        "Wrong only because retraining should be hourly",
        "Fine, provided the nightly job uses the same random seed",
      ],
      answer: 1,
      explanation:
        "Blind retraining burns compute, can silently regress quality, and ignores drift signals; the defensible pattern is monitored triggers plus gated evaluation.",
    },
    {
      id: "model-deployment-p9",
      prompt: "What is the responsible practice for logging user inputs to a deployed model?",
      options: [
        "Log everything forever — storage is cheap",
        "Log nothing at all, not even aggregate statistics",
        "Log the minimum needed for debugging and monitoring, redact or pseudonymize PII, and set retention limits",
        "Log only when a user complains",
      ],
      answer: 2,
      explanation:
        "Data minimization: collect what debugging and monitoring genuinely need, protect identifiers, and delete on a schedule — privacy by design.",
    },
    {
      id: "model-deployment-p10",
      prompt:
        "A small team launches a product with a 50M-parameter model, about 10 requests per second, and a strict budget. What is the most defensible first serving choice?",
      options: [
        "Provision a multi-GPU cluster immediately for scale that has not arrived",
        "The simplest tier that meets the SLO — a single modest instance or managed inference — then measure and scale from evidence",
        "Run inference on the database server to save money",
        "Delay launch until the system can serve a million requests per second",
      ],
      answer: 1,
      explanation:
        "Build for the traffic you have with headroom, not the traffic you imagine; measurement — not fear or hype — should drive the next tier.",
    },
  ],
};
