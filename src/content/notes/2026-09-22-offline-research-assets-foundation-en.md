---
title: "Building an Offline Research Assets Foundation for Restricted-Network Research"
description: "Preserving versioned installers, wheelhouses, source, configuration records, and checksums, then testing offline-style reconstruction while documenting the remaining WSL and TensorFlow gaps."
lang: en
translationKey: offline-research-assets-foundation
pubDatetime: 2026-09-22T00:00:00+09:00
tags:
  - research-journey
  - windows
  - workstation
  - offline
  - reproducibility
featured: false
draft: false
---

In “Building the RTX 5060 CUDA, PyTorch, and Local LLM Research Layer”, I established working GPU paths across Windows and WSL2 and validated three local LLM runtimes. The next concern was not another online installation. The workstation may eventually have to operate where Internet access is restricted, unreliable, or entirely unavailable, so I needed the assets required to reconstruct the validated environment before entering that setting.

This phase does not claim that the complete workstation has passed a physically disconnected test. I preserved exact installers, explicit Python wheelhouses, source and configuration records, then exercised selected reconstruction paths with package indexes and model lookup disabled. I refer to these as offline-mode or offline-style validations. The final end-to-end test with network access actually disconnected remains a later gate.

The implementation also changed the series. Preparing the offline assets exposed that WSL2 had passed the GPU compute path but had not yet become the independent Linux research environment intended by the original architecture. I did not rewrite that history or force the missing work into this phase. This Note records the discovery, makes WSL completion Note 7, and moves end-to-end offline validation to Note 8.

## 1. Starting from an OfflineLab Skeleton

`D:\Lab\OfflineLab` already existed with these top-level directories:

```text
backups
cache
docs
installers
manifests
repos
vscode-extensions
wheelhouse
```

The structure expressed the intended asset roles, and `manifests` already held the preceding workstation baselines. Its contents did not yet constitute an offline reconstruction set. `cache` contained only the uv cache, initially approximately `3.105 GB` across `32,301` files, while `installers`, `wheelhouse`, `vscode-extensions`, `repos`, `docs`, and `backups` were essentially empty.

This starting state confirmed an important distinction: a reusable tool cache is not the same as a verified offline asset. A cache is implementation-managed, may be incomplete, and can be evicted or reorganised. I therefore retained `cache` as disposable working state and excluded it from the verified offline-asset total.

## 2. Keeping Models and Reconstruction Assets Separate

The D: volume had `602.8 GB` total capacity and `577.9 GB` free before the major collection work. `D:\Lab\Models` occupied approximately `5.323 GB` at the start and remained deliberately separate.

| Root                | Role                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| `D:\Lab\Models`     | Actual Ollama, Hugging Face, and llama.cpp model assets                            |
| `D:\Lab\OfflineLab` | Installers, wheelhouses, source preservation, documentation, backups, and evidence |

The purpose of OfflineLab is to reconstruct and explain the environment, not to become a second copy of every large model store. Avoiding that duplication preserves a clear lifecycle boundary and prevents a misleading asset total. Models still matter to offline operation, but they are inventoried in their own location.

## 3. Preserving the As-built Installer Set

I preserved the versions that had produced the validated workstation rather than automatically downloading whichever installer was newest on collection day.

| Component              | Validated state                                                   | Preserved offline asset                |
| ---------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| Git for Windows        | Git `2.55.0.windows.3`; winget package `2.55.0.3`                 | `Git_2.55.0.3_User_X64_inno_en-US.exe` |
| **Visual Studio Code** | `1.138.0`, x64; commit `7debcd0e2acdea1c52de81bf9ee1620444407dda` | x64 User Installer                     |
| uv                     | `0.12.17`; `x86_64-pc-windows-msvc`                               | `uv-x86_64-pc-windows-msvc.zip`        |
| CMake                  | `4.4.3`                                                           | Windows x64 MSI                        |
| NVIDIA Studio Driver   | `616.92`; RTX 5060 Laptop GPU; DCH / WHQL                         | Driver installer                       |
| CUDA                   | Toolkit `13.4`; `nvcc V13.4.92`                                   | `cuda_13.4.2_windows_x86_64.exe`       |
| Ollama                 | `0.34.2`                                                          | Windows x64 installer                  |

The uv archive contains `uv.exe`, `uvw.exe`, and `uvx.exe`. The CUDA naming needs particular care: `13.4.2` identifies the preserved installer release, while `13.4` is the installed Toolkit family and `V13.4.92` is the observed compiler version. They are related labels at different levels, not contradictory reports of one value.

Exact-version preservation matters because offline recovery should first reproduce the known working state. A newer installer can be evaluated separately, but silently substituting it would turn recovery into a new compatibility experiment.

## 4. Building a Real Visual Studio Offline Layout

For **Visual Studio Build Tools** `2026 18.10.1`, preserving only the small online bootstrapper would not have been sufficient. I created an actual offline layout for:

```text
Microsoft.VisualStudio.Workload.VCTools
Recommended + Optional
Language: en-US
```

The result contained `1,400` files and occupied `7.029 GB`. Layout verification returned exit code `0` and included:

```text
Verification completed. No problem was found.
Setup completed successfully.
```

This is not every Visual Studio workload. It is the VCTools workload with its Recommended and Optional components. I intentionally kept that broad C++ scope because future CUDA, llama.cpp, or other native research builds may require components that are difficult to obtain after isolation. The additional size buys flexibility within a defined workload rather than an unbounded archive of Visual Studio.

## 5. Correcting the VSIX Platform Assumption

The validated Windows VS Code baseline contained ten extensions:

| Extension                             | Version    |
| ------------------------------------- | ---------- |
| `ms-python.debugpy`                   | `2026.6.0` |
| `ms-python.python`                    | `2026.4.0` |
| `ms-python.vscode-pylance`            | `2026.3.1` |
| `ms-python.vscode-python-envs`        | `1.36.0`   |
| `ms-toolsai.jupyter`                  | `2025.9.1` |
| `ms-toolsai.jupyter-keymap`           | `1.1.2`    |
| `ms-toolsai.jupyter-renderers`        | `1.3.0`    |
| `ms-toolsai.vscode-jupyter-cell-tags` | `0.1.9`    |
| `ms-toolsai.vscode-jupyter-slideshow` | `0.1.6`    |
| `ms-vscode-remote.remote-wsl`         | `0.104.3`  |

All ten exact-version VSIX packages were preserved. Four were `win32-x64` packages and six were universal packages.

The first collection attempt assumed that every extension would publish a `win32-x64`-specific VSIX. Several requests instead reported `has no support for targetPlatform win32-x64`. That message did not mean the extensions were unsupported on Windows; those releases were distributed as universal VSIX packages. I corrected the collection logic to try `win32-x64` first and fall back to universal. Recording that correction is more useful than presenting the final ten files as if the packaging model had been obvious in advance.

## 6. Preserving the Matching WSL VS Code Server

VS Code Remote development also depends on a server binary inside WSL. Windows VS Code `1.138.0` used commit:

```text
7debcd0e2acdea1c52de81bf9ee1620444407dda
```

WSL already contained the matching server under:

```text
~/.vscode-server/bin/7debcd0e2acdea1c52de81bf9ee1620444407dda
```

I explicitly preserved the matching Linux x64 VS Code Server archive. Its SHA-256 was:

```text
F766476592CD9F875E9E7E66E483DBA7E9661B794D8DBCA566249126D3525324
```

The commit match check passed. This asset is easy to miss because an already connected WSL session makes the server feel like part of VS Code itself. In an isolated rebuild, however, the precise server archive is a separate dependency tied to the desktop client's commit.

## 7. Replacing Cache Confidence with Explicit Wheelhouses

I did not accept the existing uv cache as evidence that Python environments could be rebuilt offline. Instead, I created explicit, purpose-specific wheelhouses for Python `3.12`.

This changed the recovery question from “does the cache happen to contain enough objects?” to “does this directory contain the distributions required by this declared environment?” The latter can be inventoried, hashed, copied, and tested with `--no-index`. Cache reuse remains useful for normal work, but it is not part of the verified foundation.

## 8. Preserving PyTorch cu132 Provenance

The `pytorch-cu132-py312` wheelhouse retained both packages and project provenance:

- `pyproject.toml`;
- `uv.lock`;
- exported requirements; and
- download-oriented requirements used for collection.

The project declared the dedicated source explicitly:

```toml
[tool.uv.sources]
torch = { index = "pytorch" }
torchvision = { index = "pytorch" }

[[tool.uv.index]]
name = "pytorch"
url = "https://download.pytorch.org/whl/cu132"
```

`uv export` produced a universal dependency representation that also contained platform-conditional Linux dependencies. The exported requirements alone also did not communicate the dedicated PyTorch cu132 source as clearly as the project metadata. I therefore did not equate a universal lock or export with a machine-specific offline wheelhouse.

The collection explicitly targeted Windows and Python 3.12 while retaining `pyproject.toml` and `uv.lock` as provenance. The resulting `17` files occupied approximately `1.891 GB`. They included `torch-2.14.0+cu132-cp312-cp312-win_amd64.whl`, approximately `1.9 GB` by itself, `torchvision-0.29.0+cu132-cp312-cp312-win_amd64.whl`, and the required Windows dependencies.

## 9. Reconstructing PyTorch without Package Indexes

I created a new environment at:

```text
D:\Lab\Research\pytorch-offline-test
```

Installation used `--no-index` and `--find-links` against the local wheelhouse. This was a reconstruction test, not merely an inventory check. The installed environment reported:

| Check                       | Observed result                        |
| --------------------------- | -------------------------------------- |
| PyTorch                     | `2.14.0+cu132`                         |
| Bundled CUDA runtime        | `13.2`                                 |
| `torch.cuda.is_available()` | `True`                                 |
| GPU                         | NVIDIA GeForce RTX 5060 Laptop GPU     |
| Workload                    | `torch.Size([2048, 2048])` on `cuda:0` |

The actual local CUDA matrix multiplication completed successfully. The PyTorch offline wheelhouse therefore received `PASS`: it could create a fresh environment without package indexes and execute a GPU workload, rather than simply holding files with plausible names.

## 10. Reconstructing the Transformers Environment

I created a separate self-contained wheelhouse named `transformers-py312`. Its validated core versions were PyTorch `2.14.0+cu132`, Transformers `5.17.0`, and Accelerate `1.15.0`.

A new environment at `D:\Lab\Research\transformers-offline-test` was installed with `--no-index` from that local wheelhouse. Package imports passed, CUDA was available, and the NVIDIA GeForce RTX 5060 Laptop GPU was detected.

Keeping this wheelhouse self-contained avoids making the Transformers recovery path depend implicitly on the contents or directory layout of the separate PyTorch test. The duplicated Python distributions are deliberate where they make a reconstruction unit complete; large model stores remain outside this mechanism.

## 11. Running Local Model Inference in Offline Mode

The existing Hugging Face store at `D:\Lab\Models\HuggingFace` contained `Qwen/Qwen3-0.6B`. I ran the Transformers validation with:

```text
HF_HUB_OFFLINE=1
TRANSFORMERS_OFFLINE=1
local_files_only=True
```

The weights loaded entirely from the local cache, the model ran on `cuda:0`, and actual inference completed. The final result was:

```text
Transformers offline CUDA inference PASS
```

This is an offline-mode validation: the libraries were instructed not to perform network lookup, and the model loaded from local assets. It is not evidence that every component has survived a full test with the network physically disconnected. That stronger end-to-end claim remains reserved for Note 8.

## 12. Preserving llama.cpp as Rebuildable Source

The validated llama.cpp source was at full commit:

```text
b29c606e28a01b1bc8c1351026a0fa6e616bf6c4
```

The working tree was clean. I created a complete Git bundle at:

```text
D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606.bundle
```

Bundle verification passed and reported complete history in a SHA-1 repository. The bundle SHA-256 was:

```text
9CED5B9B80FBFC9994E7FC78E344D446BE40BCE3BFF08BDB43E63D3C21F228D5
```

I also preserved `build-recipe.txt` with the important configuration:

```text
GGML_CUDA=ON
CMAKE_CUDA_ARCHITECTURES=120
LLAMA_BUILD_BORINGSSL=ON
```

The BoringSSL option records a real implementation lesson. The first CUDA-enabled build detected the GPU but could not retrieve Hugging Face models because it had no HTTPS backend. Rebuilding with `LLAMA_BUILD_BORINGSSL=ON` produced a path where HTTPS model retrieval and CUDA inference both passed. Source alone would not have preserved that operational knowledge.

## 13. Retaining Smoke Tests and Recovery Records

The validated smoke-test source and project metadata were copied to `D:\Lab\OfflineLab\repos\smoke-tests`. This included the CUDA source and validated executable, PyTorch and Transformers smoke-test source and metadata, `pyproject.toml`, `uv.lock`, and relevant scripts.

I excluded `.venv` directories, build directories, caches, and model files where they would only duplicate reconstructable or separately managed state. A SHA-256 manifest was generated for the preserved smoke-test files.

I also recorded the research environment paths needed for recovery:

```text
CUDA_PATH_MACHINE=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.4
OLLAMA_MODELS_USER=D:\Lab\Models\Ollama
HF_HUB_CACHE_USER=D:\Lab\Models\HuggingFace
LLAMA_CACHE_USER=D:\Lab\Models\llama.cpp
```

Selective Git, VS Code, and environment configuration backups were added alongside recovery notes. These records do not contain arbitrary environment variables or credentials. A recovery set should explain the configuration required to rebuild the research environment without turning secret-bearing user state into an archive.

## 14. Investigating TensorFlow 2.21.0 in WSL

TensorFlow was considered as a secondary, WSL-only framework. Installing `tensorflow[and-cuda]==2.21.0` eventually succeeded, but downloading several large NVIDIA CUDA wheels from `files.pythonhosted.org` repeatedly hit connection timeouts. The installed GPU dependency family used CUDA 12.9 Python packages.

TensorFlow `2.21.0` nevertheless failed GPU discovery with:

```text
Cannot dlopen some GPU libraries
```

I applied the official-style symlink remediation for shared NVIDIA `.so` libraries and `ptxas`. The resulting `ptxas` was CUDA `12.9`, version `V12.9.86`. GPU discovery still failed after that remediation.

The important result is not that the package installation eventually completed. For this environment, TensorFlow `2.21.0` did not reach a usable GPU path.

## 15. Comparing TensorFlow 2.20.0

I created a separate TensorFlow `2.20.0` environment for an A/B comparison. This version discovered the NVIDIA GeForce RTX 5060 Laptop GPU and reported Compute Capability `12.0`.

That detection was not a successful execution result. TensorFlow warned that its prebuilt wheel did not contain CUDA kernel binaries compatible with Compute Capability `12.0` and would JIT-compile from PTX. The actual GPU workload then failed with:

```text
CUDA_ERROR_INVALID_PTX
CUDA_ERROR_INVALID_HANDLE
```

The comparison therefore produced two different incomplete states:

| Tested version      | GPU discovery | GPU execution |
| ------------------- | ------------- | ------------- |
| TensorFlow `2.21.0` | `FAIL`        | Not reached   |
| TensorFlow `2.20.0` | `PASS`        | `FAIL`        |

GPU detection and GPU execution are separate gates. A device appearing in framework output is useful diagnostic evidence, but it cannot substitute for a completed workload.

## 16. Deferring the TensorFlow GPU Path

I classified the TensorFlow GPU path as `DEFERRED`, not `PASS`. The observations support describing a compatibility gap between the tested stable TensorFlow wheels and the RTX 5060's Compute Capability `12.0`; they do not establish a more specific upstream root cause.

Nor is this evidence of a general workstation GPU failure. CUDA C++, Windows and WSL PyTorch, llama.cpp, Ollama, and Transformers had already executed real GPU workloads on the same RTX 5060. The bounded conclusion is that the tested TensorFlow combinations did not provide a working GPU execution path and need to be revisited when the compatibility landscape changes.

## 17. Discovering the Incomplete WSL Research Workflow

Offline preparation also caused me to inspect the remote extension manifest inside WSL:

```text
~/.vscode-server/extensions/extensions.json
```

Its content was:

```json
[]
```

WSL had already passed Ubuntu startup, `/dev/dxg` GPU access, the NVIDIA driver path, PyTorch CUDA, a GPU benchmark, and VS Code Server connectivity. Those were valid results, but they had validated WSL primarily as a compute path. No WSL-side remote Python or Jupyter extensions had yet been installed.

The original architecture intended WSL2 to be more than a GPU smoke-test route. It was meant to provide a usable, independent Linux research environment under restricted or offline conditions. Offline asset preparation exposed that implementation had not yet reached that design intent.

I treat this as a useful pre-validation discovery, not a hidden failure. Completing WSL inside this already broad asset-preservation phase would blur the evidence and scope. The correction is to make “WSL2 Research Environment Completion” Note 7, then validate the complete environment end to end in Note 8.

## 18. Reviewing the Asset Inventory Before Final Baseline Recording

This category inventory was captured immediately before `offline-assets-baseline.txt` was written. The `18` files reported for `manifests` therefore represent the count before that final baseline file was added.

| Category            |                                 Files |        Size |
| ------------------- | ------------------------------------: | ----------: |
| `backups`           |                                   `3` |           — |
| `cache`             |                              `70,525` |  `8.944 GB` |
| `docs`              |                                   `1` |           — |
| `installers`        |                               `1,414` | `13.605 GB` |
| `manifests`         | `18` before the final baseline update |           — |
| `repos`             |                                  `18` |  `0.036 GB` |
| `vscode-extensions` |                                  `10` |  `0.063 GB` |
| `wheelhouse`        |                                  `60` |  `3.805 GB` |

The intentional OfflineLab assets excluding `cache` totalled `17.509 GB`. The separate `D:\Lab\Models` store contained `33` files and occupied `5.323 GB`.

I did not add the `8.944 GB` cache to the intentional offline-asset total. Its growth from the starting state is operationally interesting, but counting it as curated recovery material would erase the distinction that motivated this phase.

## 19. Hashing the Intentional Asset Roots

I generated a complete SHA-256 manifest over the intentionally preserved roots:

- `installers`;
- `wheelhouse`;
- `vscode-extensions`;
- `repos`;
- `docs`; and
- `backups`.

The result was `D:\Lab\OfflineLab\manifests\offline-assets-sha256.txt`, with a size of `348,367` bytes and `1,506` entries. Disposable `cache` was deliberately excluded.

Checksums do not prove that every installer will execute or that every dependency relationship is complete. They provide integrity evidence for the exact collected files. The reconstruction tests supply the complementary functional evidence.

## 20. Recording the Foundation Baseline

The final baseline was written to:

```text
D:\Lab\OfflineLab\manifests\offline-assets-baseline.txt
```

| Gate                                | Result               |
| ----------------------------------- | -------------------- |
| Installer Asset Preservation        | `PASS`               |
| Build Tools Offline Layout          | `PASS`               |
| VS Code Offline Assets              | `PASS`               |
| Python Wheelhouse Foundation        | `PASS`               |
| PyTorch Offline Reconstruction      | `PASS`               |
| Transformers Offline Reconstruction | `PASS`               |
| Local Model Offline Inference       | `PASS`               |
| Source Preservation                 | `PASS`               |
| Configuration Backup                | `PASS`               |
| Checksum Manifest Creation          | `PASS`               |
| TensorFlow GPU Path                 | `DEFERRED`           |
| WSL Research Workflow               | `DEFERRED_TO_NOTE_7` |
| Offline Research Assets Foundation  | `PASS`               |

The central lesson is that offline readiness is a system of evidence: exact installers, explicit wheelhouses, separately managed models, rebuildable source, configuration records, checksums, and actual reconstruction tests. No single cache, lockfile, device-detection result, or successful online installation can stand in for that system.

## 21. Foundation PASS, with Two Explicit Gaps

The foundational offline reconstruction assets are now explicit, versioned, hashed, and partially reconstruction-tested. The Windows Python, PyTorch, Transformers, and local-model paths passed offline-style tests, and the source and toolchain assets required for further reconstruction are preserved.

The workstation is not yet fully offline-ready. The complete WSL research workflow remains unfinished, TensorFlow GPU compatibility remains unresolved, and an end-to-end validation with the network physically disconnected has not been performed. Those limits are part of the result, not footnotes to it.

The correct status for this phase is therefore:

```text
Offline Research Assets Foundation = PASS
```

Note 7 will complete the WSL2 research environment that the architecture originally intended. Note 8 will then perform the end-to-end offline research environment validation. Splitting the work at the gap discovered during implementation preserves a more accurate engineering record than retroactively making the original sequence appear complete.
