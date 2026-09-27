---
title: "Building the RTX 5060 CUDA, PyTorch, and Local LLM Research Layer"
description: "Validating RTX 5060 CUDA and PyTorch paths across Windows and WSL2, alongside three local LLM runtimes and their persistence after reboot."
lang: en
translationKey: rtx5060-cuda-pytorch-local-llm-baseline
pubDatetime: 2026-09-21T00:00:00+09:00
tags:
  - research-journey
  - windows
  - workstation
  - gpu
  - cuda
  - local-llm
featured: false
draft: false
---

In “Building the Windows Research Development Baseline and Validating the WSL2 Gate”, I verified two development paths—Windows native and WSL2—through real projects and a reboot. This phase retained that baseline while testing whether the RTX 5060 could support CUDA and PyTorch research and local LLM execution.

I separated the roles of system CUDA, framework-bundled CUDA runtimes, model runtimes, and model storage, then tested each with real work. I also recorded the compatibility issues and corrections encountered with the latest officially supported versions as evidence for future rebuilding.

I required GPU computation, model inference, the local API, and storage paths to work, with the necessary state retained after a reboot, before assigning `PASS`.

## 1. Building on the Windows and WSL Baseline

The starting GPU was an NVIDIA GeForce RTX 5060 Laptop GPU with approximately 8 GB of VRAM. The initial driver was `591.74`, and `nvidia-smi` reported CUDA support `13.1`.

No CUDA Toolkit was installed. The `nvcc` command was absent, `CUDA_PATH` did not exist, and there was no CUDA Toolkit directory. The CUDA value in `nvidia-smi` describes the level supported by the current driver; it does not prove that a Toolkit of that version is installed on the system. I made that distinction explicit in the starting state.

I retained the Windows projects and WSL2 distribution from the previous phase and added GPU research capabilities to both.

## 2. Choosing the Latest Officially Supported Stack

I expect this research workstation to remain in use for at least a year. I therefore prioritised the newest officially supported stack available at setup time rather than selecting conservative older versions solely to minimise immediate friction. This followed the same lifecycle reasoning used to choose Ubuntu 26.04.1 LTS in the previous phase.

The newer combination did expose gaps between components. The system CUDA Toolkit was `13.4`, while the PyTorch wheel bundled a CUDA `13.2` runtime. The first llama.cpp CUDA build lacked HTTPS support, and the current Transformers API differed from an assumption in my initial smoke-test code.

For a long-lived research environment, I considered it useful to find working combinations within the supported range and record the issues and the evidence behind each correction.

## 3. Establishing the MSVC and CMake Toolchain

I first established a Windows x64 C++ toolchain for CUDA C++ and local source builds.

| Component                 | Verified version or state                                        |
| ------------------------- | ---------------------------------------------------------------- |
| Visual Studio Build Tools | `2026 18.10.1`                                                   |
| MSVC                      | `19.51.36257`, x64                                               |
| `cl.exe`                  | Executed successfully in the Visual Studio Developer environment |
| CMake                     | `4.4.3`, later used for the llama.cpp source build               |

I verified that `cl.exe` ran in the Visual Studio Developer environment, then installed CMake `4.4.3`. Together, they supported the CUDA smoke test and llama.cpp build.

## 4. Updating the NVIDIA Driver

I updated the NVIDIA driver from `591.74` to `616.92`. The final observed state was NVIDIA kernel-mode driver (KMD) `616.92` and CUDA user-mode driver (UMD) `13.4`. The RTX 5060 remained correctly identified after the update.

After a Windows reboot, driver `616.92`, CUDA UMD `13.4`, and correct RTX 5060 detection were confirmed again. I used this state for the subsequent Windows and WSL GPU tests.

## 5. Installing CUDA Toolkit 13.4

I installed CUDA Toolkit `13.4` on the Windows system. The completed state was:

| Check           | Result                                                     |
| --------------- | ---------------------------------------------------------- |
| `nvcc`          | `V13.4.92`                                                 |
| `CUDA_PATH`     | `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.4` |
| Toolkit version | `13.4`                                                     |

After confirming installation of the Toolkit's compiler, headers, and libraries, I tested the CUDA Toolkit Gate by compiling device code and executing it on the RTX 5060.

## 6. A Real CUDA C++ Smoke Test

I compiled the CUDA C++ smoke test for `sm_120`, matching the RTX 5060's reported Compute Capability `12.0`. The test performed vector addition over `1,048,576` `float` elements.

The test exercised host-to-device copies, a kernel launch, synchronisation, a device-to-host copy, and result validation.

```text
CUDA smoke test PASS
```

The RTX 5060 reported Compute Capability `12.0`, and the final values passed validation. I used this real compile-and-run result as the Windows CUDA Toolkit Gate.

## 7. Validating PyTorch CUDA on Windows

The Windows PyTorch project was created at:

```text
D:\Lab\Research\pytorch-smoke-test
```

The environment used Python `3.12`, uv `0.12.17`, and PyTorch `2.14.0+cu132`. PyTorch bundled CUDA runtime `13.2`; `torch.cuda.is_available()` returned `True`, and the RTX 5060 was detected with capability `(12, 0)`.

The system CUDA Toolkit `13.4` and the PyTorch wheel's CUDA runtime `13.2` belong to different layers. A prebuilt PyTorch wheel uses its bundled runtime, so the two versions do not need to match exactly for normal prebuilt PyTorch execution. I validated the system Toolkit through the preceding CUDA C++ build and the framework runtime through the PyTorch workload.

A matrix multiplication completed on `cuda:0`, confirming that PyTorch performed tensor computation on the RTX 5060.

## 8. The Windows GPU Smoke Benchmark

I ran a `4096 × 4096` matrix multiplication in the same Windows project and retained initial values for later comparison.

| Precision | Observed time | Derived throughput   | Peak CUDA memory |
| --------- | ------------- | -------------------- | ---------------- |
| FP32      | `14.86 ms`    | about `9.25 TFLOPS`  | `224 MiB`        |
| FP16      | `4.36 ms`     | about `31.54 TFLOPS` | `224 MiB`        |

The throughput figures are approximate values derived from the theoretical matrix-multiplication workload of about 2N³ floating-point operations and the measured execution time. These are point-in-time local smoke-test baselines, not official GPU performance specifications or comprehensive benchmark results. Their purpose is to provide a comparison point for detecting changes under the same test conditions.

## 9. Opening the GPU Path through WSL2

The WSL environment was Ubuntu `26.04.1 LTS` with kernel `6.18.33.2-microsoft-standard-WSL2`. The RTX 5060 was visible inside WSL, where NVIDIA-SMI reported `615.71.08`. The Windows KMD was `616.92`, and the CUDA UMD was `13.4`.

I also confirmed the presence of `/usr/lib/wsl/lib/libcuda.so*` and `/dev/dxg`. I did not install a separate Linux NVIDIA display driver inside WSL. GPU access uses the path supplied to WSL by the Windows NVIDIA driver.

I configured the Linux research runtime above the GPU paravirtualisation path provided by WSL.

## 10. PyTorch CUDA inside WSL

I installed uv `0.12.17` separately inside WSL. The WSL-native project lived in the Linux filesystem rather than under `/mnt/d`:

```text
~/research/pytorch-smoke-test
```

This project used Python `3.12` and PyTorch `2.14.0+cu132`. Its PyTorch CUDA runtime was the same `13.2` used on Windows. `torch.cuda.is_available()` returned `True`, and the RTX 5060 appeared with capability `(12, 0)`.

The same CUDA matrix multiplication test used on Windows completed successfully inside WSL. The Linux-native project path validated in the previous Note now extended to an actual GPU tensor workload.

## 11. Observing Windows and WSL Results

The same smoke workload in WSL produced FP32 `14.88 ms`, about `9.23 TFLOPS`, and FP16 `4.34 ms`, about `31.64 TFLOPS`. Peak CUDA memory was `224 MiB`.

| Environment | FP32                            | FP16                            | Peak memory |
| ----------- | ------------------------------- | ------------------------------- | ----------- |
| Windows     | `14.86 ms`, about `9.25 TFLOPS` | `4.36 ms`, about `31.54 TFLOPS` | `224 MiB`   |
| WSL2        | `14.88 ms`, about `9.23 TFLOPS` | `4.34 ms`, about `31.64 TFLOPS` | `224 MiB`   |

The Windows-native and WSL2 measurements were nearly identical for this particular matrix-multiplication smoke workload. However, this result does not establish that WSL2 always has zero GPU overhead. Differences may emerge with workloads that involve different CPU–GPU data-transfer patterns, memory-access behaviour, I/O, or computational characteristics. The value of this comparison is that the same PyTorch CUDA workload ran reliably through both paths and provided an initial baseline for future environment changes.

## 12. Separating Model Storage onto D:

Models and caches can grow quickly and should not share the OS replacement lifecycle. Following the existing storage architecture, I consolidated their final locations under D:.

| Asset              | Final location              |
| ------------------ | --------------------------- |
| Ollama models      | `D:\Lab\Models\Ollama`      |
| llama.cpp cache    | `D:\Lab\Models\llama.cpp`   |
| Hugging Face cache | `D:\Lab\Models\HuggingFace` |

The persisted user environment included `OLLAMA_MODELS`, `LLAMA_CACHE`, and `HF_HUB_CACHE`. I also set **Model location** in **Ollama Desktop** to `D:\Lab\Models\Ollama`.

The current Ollama Desktop application has its own Model location setting, so I did not describe the earlier location confusion as an upstream bug. The verified fact is that the GUI setting and environment variable were aligned to the same D: path and remained there after a reboot. This test did not establish which mechanism has precedence.

## 13. Ollama and Qwen3.5 GPU Inference

I installed **Ollama** `0.34.2` and deployed the `qwen3.5:4b` model. The model was approximately `3.4 GB` with a context of `4096`.

Model loading and interactive inference succeeded. `ollama ps` reported `100% GPU`; observed VRAM use was approximately `3.8 GB`.

Those values describe the observed model and runtime state. They do not imply that a different context length, model, request concurrency, or runtime configuration will use the same amount of memory.

## 14. The Ollama Local API and Reboot Persistence

I called the local API at `http://127.0.0.1:11434/api/chat`, and the test returned exactly:

```text
Ollama API PASS
```

The warm API call produced the following observations.

| Measure        | Observed value                                    |
| -------------- | ------------------------------------------------- |
| Prompt         | `21` tokens, `141645000 ns`, about `148 tokens/s` |
| Generation     | `6` tokens, `70365000 ns`, about `85 tokens/s`    |
| Load duration  | `1596500 ns`                                      |
| Total duration | `323625900 ns`                                    |

After a Windows reboot, the Ollama server automatically listened on `127.0.0.1:11434`, `ollama ls` still listed `qwen3.5:4b`, and the D: model location remained in place. I included the local API, model storage, and reboot persistence in the Ollama runtime's `PASS` criteria.

## 15. Building llama.cpp with CUDA

I built llama.cpp locally from source rather than relying only on a prebuilt binary. The observed version was `0.4.1-dev`, build `1`, at commit `b29c606`. The build used MSVC `19.51.36257.0` for x64 and CMake `4.4.3`.

The CUDA configuration used `GGML_CUDA=ON` and `CMAKE_CUDA_ARCHITECTURES=120`. The resulting runtime detected the RTX 5060 as `CUDA0` and reported approximately `8123 MiB`.

The first build correctly detected the GPU but lacked the HTTPS support needed for Hugging Face `-hf` model retrieval.

## 16. Adding HTTPS through BoringSSL

When I attempted `-hf` retrieval with the first CUDA build, the error stated that HTTPS required one of:

- `LLAMA_BUILD_BORINGSSL=ON`
- `LLAMA_BUILD_LIBRESSL=ON`
- `LLAMA_OPENSSL=ON`

To include model retrieval in the build, I changed the configuration to:

```text
LLAMA_BUILD_BORINGSSL=ON
```

After rebuilding, the HTTPS download of `ggml-org/gemma-3-1b-it-GGUF:Q4_K_M` succeeded. Real CUDA inference ran with `-ngl all`, and `nvidia-smi` showed `llama-cli.exe` using the GPU. Observed VRAM use was approximately `962 MiB`; the prompt baseline was `255.6 tokens/s`, and the generation baseline was `204.8 tokens/s`.

Adding an HTTPS backend with the build option identified by the error resolved the download failure.

## 17. Transformers Direct CUDA Inference and API Friction

The third local LLM path used Transformers `5.17.0`, PyTorch `2.14.0+cu132`, and the `Qwen/Qwen3-0.6B` model for direct FP16 CUDA inference. The Hugging Face cache remained on D:.

The first smoke test failed because it assumed that `apply_chat_template()` returned a tensor directly. In the installed Transformers `5.17.0` environment, the actual return structure did not match that assumption. I updated the smoke-test code by:

- setting `return_dict=True`;
- calling `model.generate(**inputs)`;
- reading the input length from `inputs["input_ids"]`; and
- using `dtype=` instead of the deprecated `torch_dtype=`.

Direct CUDA inference then succeeded. It generated `128` tokens in `18.283 s`, giving a generation baseline of `7.0 tokens/s`, with peak CUDA memory of `1186 MiB`. Public Hugging Face model access was unauthenticated and produced a rate-limit warning, but not a functional failure.

I do not compare this `7.0 tokens/s` directly with the Ollama or llama.cpp figures. The models, quantisation, precision, prompts, and inference stacks differ. The result validates a third independent GPU execution path through Transformers and PyTorch, together with code adjusted for the current API.

## 18. Reboot Persistence and Manifests

After a full Windows reboot, I checked that the following state remained functional.

| Scope                 | State verified again                                               |
| --------------------- | ------------------------------------------------------------------ |
| Driver and CUDA       | NVIDIA driver `616.92`, CUDA UMD `13.4`, `nvcc 13.4 / V13.4.92`    |
| Build tool            | CMake `4.4.3`                                                      |
| Model runtime         | Ollama `0.34.2`, local server, and `qwen3.5:4b` visibility         |
| Environment variables | `CUDA_PATH`, `OLLAMA_MODELS`, `HF_HUB_CACHE`, and `LLAMA_CACHE`    |
| GPU framework         | Windows PyTorch CUDA detection and llama.cpp CUDA device detection |
| Storage               | D: model storage paths                                             |

I also captured the validated state in three manifests under `D:\Lab\OfflineLab\manifests\`.

| File                       | Recorded scope                                      |
| -------------------------- | --------------------------------------------------- |
| `gpu-windows-baseline.txt` | Windows driver, Toolkit, PyTorch, and GPU baseline  |
| `gpu-wsl-baseline.txt`     | WSL GPU path and PyTorch baseline                   |
| `local-llm-baseline.txt`   | Model storage and three local LLM runtime baselines |

These files are evidence for later comparison and rebuilding decisions. They are neither full backups of the models and environment nor automatic restore mechanisms.

## 19. GPU and Local LLM Baseline PASS

The final assessment for this phase is:

| Gate                             | Result | Evidence required                                                   |
| -------------------------------- | ------ | ------------------------------------------------------------------- |
| Windows CUDA Toolkit Gate        | `PASS` | `sm_120` compile, memory copies, kernel execution, and validation   |
| Windows PyTorch CUDA Gate        | `PASS` | RTX 5060 detection and matrix multiplication on `cuda:0`            |
| WSL GPU Access Gate              | `PASS` | Windows driver path, `/dev/dxg`, `libcuda.so`, and GPU visibility   |
| WSL PyTorch CUDA Gate            | `PASS` | CUDA matrix multiplication in the WSL-native project                |
| Ollama Local LLM Runtime         | `PASS` | GPU inference, local API, D: models, and reboot persistence         |
| llama.cpp CUDA Runtime           | `PASS` | CUDA source build, HTTPS retrieval, and `-ngl all` inference        |
| Transformers Direct CUDA Runtime | `PASS` | FP16 model loading and direct generation through PyTorch            |
| Reboot / Persistence             | `PASS` | Driver, CUDA tools, variables, runtimes, and storage paths verified |

Windows native and WSL2 now both provide GPU research paths validated by real CUDA and PyTorch workloads. I separated the roles of system CUDA `13.4` and the PyTorch `13.2` runtime, and retained the Windows and WSL measurements only as initial comparison points for this smoke workload.

I validated three local LLM paths: Ollama, llama.cpp, and Transformers/PyTorch. For the HTTPS build option and Transformers API issues, I retained both the causes and the corrections.

The next research layer can build on this baseline with reusable workflows for embeddings, RAG, offline-ready assets, and repeatable AI experiments. I have not fixed their precise order, but the smoke tests and manifests from this phase now provide evidence against which later changes can be compared.
