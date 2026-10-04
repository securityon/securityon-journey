---
title: "Verifying the Apple Silicon AI Environment"
description: "Configuring PyTorch and MLX in a separate MacBook Python project and checking GPU computation, numerical precision and a small training task."
lang: en
translationKey: macbook-apple-silicon-ai
pubDatetime: 2026-10-05T00:00:00+09:00
tags:
  - research-journey
  - macos
  - workstation
  - development
  - ai
featured: false
draft: false
---

“Building a Python and Jupyter Research Environment” established project-specific Python and checked computation. This time I used the MacBook GPU for calculations and a small training task. GPUs can handle repeated numerical operations across many values. PyTorch and MLX provide tools for expressing those operations and training AI models. I started with small problems to check whether both tools run on this MacBook and whether their results are dependable.

## 1. A Separate Project and Two Execution Models

I created `~/Developer/research-apple-silicon-ai` separately so that testing new tools would preserve the previous project's package setup. Its `.venv` contains Python and packages for this experiment, while `uv.lock` records the package versions selected.

```sh
uv init --bare --vcs none --python 3.13.16 \
  "$HOME/Developer/research-apple-silicon-ai"
cd "$HOME/Developer/research-apple-silicon-ai"
uv add torch mlx numpy
```

The installed tools and their roles are below.

| Tool            | Installed version | Role in this experiment                                                        |
| --------------- | ----------------- | ------------------------------------------------------------------------------ |
| Python          | 3.13.16           | Runs the experiment code                                                       |
| PyTorch         | 2.14.1            | GPU computation and small-model training                                       |
| MLX / mlx-metal | 0.32.3            | Apple Silicon computation framework and its accompanying GPU execution package |
| NumPy           | 2.5.3             | CPU computation used to compare GPU results                                    |

In `pyproject.toml`, I set the project's allowed Python range to `>=3.13.16,<3.14`: **at least 3.13.16, but below 3.14**. This keeps the experiment within the checked 3.13 series and prevents moving into the untested 3.14 series. It is a project choice, rather than a claim that PyTorch and MLX support only these versions. `.python-version` also records the actual version, 3.13.16.

Source stays in the local project, with generated output in `results`. I added that directory to `.gitignore` so that future Git source control would not include generated results automatically.

PyTorch calls its numerical arrays tensors. Selecting the `mps` device for those tensors requests its Apple GPU execution path. MLX uses Apple Silicon's shared CPU/GPU memory and allows operations to select either device. A stream here specifies a device and the order in which operations run. I explicitly selected the GPU in both tools, following the [PyTorch MPS documentation](https://docs.pytorch.org/docs/2.14/notes/mps.html) and [MLX unified-memory documentation](https://ml-explore.github.io/mlx/build/html/usage/unified_memory.html).

## 2. Installation and GPU Access

Successful installation did not immediately provide GPU access. PyTorch's `is_built()` checks whether the installed package includes MPS support; `is_available()` checks whether the current execution environment can use it. In the restricted command environment, only the first returned true. MLX could not load because no Metal device, used to access the Apple GPU, was available. I treated these as observations about that execution context and prepared the same project for execution in a normal macOS login session.

In a normal macOS Terminal session, PyTorch reported MPS as available and recorded the tensor device as `mps:0`. MLX also performed GPU matrix multiplication, but its first precision check produced an unexpected result.

MLX identified the device as Apple M5 Pro and the selected stream as `Device(gpu, 0)`. For PyTorch, I unset `PYTORCH_ENABLE_MPS_FALLBACK` to check the selected MPS path without automatic CPU fallback.

## 3. Known Answers and Numerical Precision

The first calculation uses matrices: tables of numbers arranged in rows and columns. It multiplies `[[1, 2], [3, 4]]` by `[[5, 6], [7, 8]]`. The first row is `1×5 + 2×7 = 19` and `1×6 + 2×8 = 22`; the second row is 43 and 50. The expected result is therefore `[[19, 22], [43, 50]]`.

After checking the small integer product, I multiplied two matrices with 128 rows and 128 columns, including fractional values between -1 and 1. A fixed random seed, `20261005`, makes the input generation repeatable.

CPU and GPU fractional calculations do not always agree in every last digit. Numbers have a finite representation, and the order of operations can also affect rounding. I therefore defined how much difference to allow before running the checks.

The numbers in float16, float32 and float64 specify the bits used to represent each value. More bits generally allow more precise representation. I used a NumPy float64 CPU calculation on the same inputs as the reference for GPU float32 and float16 results. That reference is not an exact, error-free mathematical answer either.

The allowed difference combines two parts. Absolute tolerance (`atol`) permits a fixed difference regardless of the result's size. Relative tolerance (`rtol`) adds an allowance proportional to the reference value. An absolute component is useful near zero, where a ratio alone can be misleading. Following [NumPy's comparison rule](https://numpy.org/doc/stable/reference/generated/numpy.allclose.html), each element must satisfy `absolute error ≤ atol + rtol × |reference|`.

| Format  | Absolute tolerance | Relative tolerance                                 |
| ------- | ------------------ | -------------------------------------------------- |
| float32 | 0.0001 (`1e-4`)    | 0.0001, or 0.01% of the reference magnitude        |
| float16 | 0.02 (`2e-2`)      | 0.005 (`5e-3`), or 0.5% of the reference magnitude |

For example, a float32 reference value of 1 permits a difference of `0.0001 + 0.0001 × 1 = 0.0002`. This illustrates the rule; it is not a separate measured result.

These values were defined in the verification code before execution as **working criteria for this small calculation**. They allow small rounding differences while checking for larger deviations; float16 has a wider allowance because its representation is less precise. They are not analytically derived error bounds or official recommended values. Research calculations need tolerances suited to their scale and purpose. A pass here means that these inputs met these criteria.

PyTorch produced the expected 2×2 product. Its 128×128 float32 maximum absolute error was approximately 0.000004995 (`4.995e-6`), and float16 was `0.005662`; both passed the specified checks. A separate attempt to create an MPS float64 tensor returned an unsupported-type error. The float64 used for the CPU reference therefore cannot simply be reused as the GPU data type.

In MLX's first float32 run, 15,234 of 16,384 elements exceeded the specified tolerance. The maximum absolute difference among violating elements was approximately `0.009775`. The [MLX numerical-precision documentation](https://ml-explore.github.io/mlx/build/html/usage/precision.html) describes reduced internal precision for default matrix multiplication on some hardware, even when inputs and outputs remain float32. I retained those tolerances, repeated the default run with failed checks recorded in JSON, then compared it with a new process launched with `MLX_ENABLE_TF32=0`.

```sh
uv run --locked --offline python verify_ai.py mlx --observe-precision
MLX_ENABLE_TF32=0 uv run --locked --offline python verify_ai.py mlx
```

This setting requests that float32 matrix multiplication avoid the reduced internal precision path for that execution. In the new process, the maximum absolute error fell to approximately 0.000003262 (`3.262e-6`) and passed the original tolerance. Maximum absolute error is the largest difference found across all result entries. The maximum absolute difference from MLX's CPU stream was approximately 0.000005722 (`5.722e-6`), also within tolerance. I recorded the default failure alongside the full-float32 success. This observation agrees with the documented precision policy; it does not identify a particular internal GPU kernel.

| Execution condition     | float32 maximum absolute error | float32 check | float16 maximum absolute error | float16 check |
| ----------------------- | ------------------------------ | ------------- | ------------------------------ | ------------- |
| PyTorch MPS             | `0.000004995`                  | Passed        | `0.005662`                     | Passed        |
| MLX default             | `0.009775`                     | Failed        | `0.005662`                     | Passed        |
| MLX `MLX_ENABLE_TF32=0` | `0.000003262`                  | Passed        | `0.005662`                     | Passed        |

The float16 tolerance is wider than the float32 tolerance. Passing both checks does not mean both data types provide the same precision.

I also ran the same inputs on MLX's CPU and GPU paths. MLX uses lazy evaluation, deferring computation until it is needed. I called `mx.eval()` to complete the calculation before reading its results.

## 4. A Small Training Task

Beyond computation, I tested a small learning task that adjusts numbers to approach known answers. I generated the answers with `y = 2x + 1` and used `y = ax + b` as the trainable expression. The values to discover are the slope `a = 2`, which multiplies the input, and the intercept `b = 1`, added afterwards.

There are 128 inputs from -1 to 1, with both `a` and `b` initially zero. Mean squared error averages the squared differences between predictions and answers. It serves as the loss: a smaller value means predictions are closer to the answers.

Automatic differentiation calculates how to change `a` and `b` to reduce that loss. I used it for 100 updates. The learning rate of 0.1 sets the size of each adjustment as a fixed test condition; this was not a search for an optimal learning rate. Successful learning should reduce loss and bring `a` towards 2 and `b` towards 1.

PyTorch's `backward()` and MLX's `value_and_grad()` calculate the direction for reducing loss. These loss gradients have a different role from the slope parameter `a` in `ax + b`. Each framework runs separate GPU and CPU training paths, recording initial and final losses, the first gradient and final parameters in JSON.

PyTorch GPU training reduced the initial loss of approximately 2.35433 to approximately 0.0000011 (`1.09986e-6`). The final slope was 1.9981977 and the intercept 0.9999999, matching the CPU training parameters. Both MLX's default and `MLX_ENABLE_TF32=0` runs produced the same final loss and parameters, matching their respective CPU training paths. The default matrix-multiplication precision failure did not imply failure of this small training task.

| Item                                        | PyTorch MPS           | MLX GPU default / full float32 |
| ------------------------------------------- | --------------------- | ------------------------------ |
| Initial loss                                | Approximately 2.35433 | Approximately 2.35433          |
| Loss after 100 updates                      | `1.09986e-6`          | `1.09986e-6`                   |
| Slope / intercept                           | 1.9981977 / 0.9999999 | 1.9981977 / 0.9999999          |
| Final parameters compared with CPU training | Matched               | Matched                        |

This demonstrates automatic differentiation and parameter updates for this small, known linear problem.

## 5. Scope and Next Steps

The verification script records environment paths, versions, device availability, numerical results and framework memory counters. PyTorch's allocated and driver memory and MLX's active, cache and peak memory have different scopes. Their numbers do not provide a direct comparison of total memory consumption. These small inputs also do not test large-model capacity or stability under sustained load.

Active or currently allocated memory holds live calculation data. Cache memory is retained for reuse, and peak memory is the maximum observed within the measurement interval. PyTorch driver allocation also includes other Metal allocations beyond tensor data.

The memory values recorded at the end of verification are below, in bytes. MLX peak memory was observed after resetting its counter in each process.

| Execution condition | Memory record                                           |
| ------------------- | ------------------------------------------------------- |
| PyTorch MPS         | Currently allocated 33,024 / driver allocated 9,125,888 |
| MLX default         | Active 131,088 / cache 265,348 / peak 294,928           |
| MLX full float32    | Active 131,088 / cache 396,424 / peak 393,232           |

The frameworks reported a recommended working-memory value of 19,069,665,280 bytes. This is not memory reserved or consumed by this experiment. I did not increase inputs to find capacity limits or measure throughput. The performance cost of changing precision is also outside the measured results.

I also added the Codex extension to VS Code for research-code editing. This Note records its installation; the research workflow using it will be documented after practical use.

This stage checked GPU access, small computations and training, and the effect of a precision setting. I chose to specify `MLX_ENABLE_TF32=0` when launching MLX float32 baseline verification, keeping it as an experiment condition rather than adding a system-wide environment variable.

The next stage will cover a local LLM runtime and a small document collection, recording model, quantisation and context conditions alongside actual answers and checks of their supporting evidence.
