---
title: "Completing WSL2 as a Practical Linux Research Environment"
description: "Closing the gap between a working WSL GPU path and a usable Linux research environment with native build tools, isolated Python, Jupyter, Remote WSL, CUDA workflows, shared models, and reboot validation."
lang: en
translationKey: wsl2-research-environment-completion
pubDatetime: 2026-09-24T00:00:00+09:00
tags:
  - research-journey
  - windows
  - wsl2
  - workstation
  - reproducibility
featured: false
draft: false
---

“Building an Offline Research Assets Foundation for Restricted-Network Research” ended with `WSL_Research_Workflow=DEFERRED_TO_NOTE_7`. WSL2 had already started Ubuntu, exposed `/dev/dxg`, reached the NVIDIA GPU, run PyTorch CUDA and a GPU benchmark, and connected to the matching VS Code Server. Those were valid results, but they proved a WSL GPU compute path rather than the independent Linux research environment intended by the original architecture.

The evidence that exposed the difference was small. During offline-asset preparation, `~/.vscode-server/extensions/extensions.json` returned `[]`. The server existed, but the remote Python and Jupyter layer did not. I left that omission visible in Note 6 instead of extending an already broad phase or rewriting the earlier implementation as complete.

This phase closes that gap. Its completion criterion is not package presence. It is a usable workflow spanning Linux-native development, isolated Python projects, Jupyter, VS Code Remote WSL, project-selected interpreters, GPU frameworks, shared model assets, and reboot persistence. Physical network isolation remains the separate end-to-end gate for Note 8.

## 1. Defining the Environment Beyond GPU Access

The starting platform was Ubuntu `26.04.1 LTS` (`resolute`) on kernel `6.18.33.2-microsoft-standard-WSL2`, architecture `x86_64`, under user `securityon`. The Linux research root was `/home/securityon/research`; Windows research assets under `D:\Lab` were available as `/mnt/d/Lab`. Git was `2.53.0`.

The GPU path exposed an NVIDIA GeForce RTX 5060 Laptop GPU with `8151 MiB` VRAM through `/dev/dxg`. Windows reported KMD `616.92`, while `nvidia-smi` in WSL reported `615.71.08` and CUDA UMD `13.4`. These different strings are views within the WSL GPU architecture, not evidence of an independent Linux display driver. WSL continues to rely on the Windows NVIDIA driver path.

VS Code `1.138.0` and its WSL Server matched at commit:

```text
7debcd0e2acdea1c52de81bf9ee1620444407dda
```

This supplied a sound platform boundary, but a complete research environment also required its own build tools, runtime separation, editor-side capabilities, project environments, and workflow-level validation.

## 2. Correcting a Misleading uv Inventory

My first inventory was launched indirectly from Windows PowerShell into `wsl.exe bash`. In that non-login, non-interactive shell, `uv` appeared to be missing. That conflicted with earlier WSL projects that had already used uv successfully.

An interactive WSL session showed the actual research-shell state:

```text
PATH includes: /home/securityon/.local/bin
uv: /home/securityon/.local/bin/uv
uv version: 0.12.17
```

The first observation described that invocation's `PATH`, not the installation state of the software. The PowerShell-to-bash inventory also encountered some quoting and CRLF friction, reinforcing that a diagnostic path can change what is observed.

The correction is important beyond uv: “command not found” in one shell context does not by itself establish “not installed”. Shell mode, profile loading, environment inheritance, and quoting boundaries must be checked before turning a diagnostic symptom into an inventory fact.

## 3. Adding a Linux-native Build Toolchain

The corrected inventory found Git, Python, uv, GPU access, and VS Code Server, but no `gcc`, `g++`, `make`, `cmake`, `ninja`, `pkg-config`, or JupyterLab. Windows already had MSVC, CMake, the CUDA Toolkit, and Visual Studio Build Tools, but those tools do not make WSL an independent Linux development environment.

I installed and validated the native WSL stack:

| Tool         | Validated version |
| ------------ | ----------------- |
| GCC          | `15.2.0`          |
| G++          | `15.2.0`          |
| GNU Make     | `4.4.1`           |
| CMake        | `4.2.3`           |
| Ninja        | `1.13.2`          |
| `pkg-config` | `2.5.1`           |

The result was `Linux_Native_Build_Toolchain=PASS`. This was not duplication for its own sake. Native Linux projects should build against Linux compilers, headers, package metadata, and filesystem semantics rather than silently depending on the Windows toolchain across the WSL boundary.

## 4. Separating System Python from Research Python

Ubuntu's system Python was `3.14.4` at `/usr/bin/python3.14`. I left it under distribution management. Research workloads instead use uv `0.12.17` (`x86_64-unknown-linux-gnu`) to manage Python `3.12.14`, from the path family:

```text
/home/securityon/.local/share/uv/python/cpython-3.12-linux-x86_64-gnu/
```

The runtime design is therefore explicit:

```text
Ubuntu system Python 3.14.4
  -> operating-system and distribution-managed work

uv-managed research Python 3.12.14
  -> research project runtime

project-specific .venv
  -> dependency isolation
```

This is an architectural choice rather than a workaround for the newer system Python. Replacing or downgrading Ubuntu's Python would couple research compatibility to distribution internals. A separately managed research runtime allows projects to stay on their validated Python line while the operating system retains ownership of its own interpreter.

## 5. Creating the WSL Jupyter Research Base

I created `/home/securityon/research/wsl-research-base` as a dedicated base for common interactive research tooling. It uses uv-managed Python `3.12.14` in:

```text
/home/securityon/research/wsl-research-base/.venv
```

The validated interactive stack was:

| Component  | Version   |
| ---------- | --------- |
| Python     | `3.12.14` |
| JupyterLab | `4.6.4`   |
| IPython    | `9.17.1`  |
| ipykernel  | `7.3.0`   |

I opened the project through VS Code Remote WSL and selected `/home/securityon/research/wsl-research-base/.venv/bin/python` as the interpreter and kernel. A notebook reported Python `3.12.14`, that exact executable, and:

```text
Linux-6.18.33.2-microsoft-standard-WSL2-x86_64-with-glibc2.43
```

The result was `Jupyter WSL kernel PASS`. Installing Jupyter packages was not the gate; selecting the intended project interpreter and executing a kernel inside the remote environment was.

## 6. Populating the WSL Remote Extension Layer

Before this phase, the WSL extension manifest had been empty. I populated the remote extension host and then inspected its actual final state:

| WSL remote extension                  | Version    |
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

The final count was `9`. Installing the Jupyter extension also brought related helper extensions into the remote host, so I do not describe all nine as individually installed by hand. The Remote - WSL extension itself remains on the Windows/local side and is not part of this remote count.

This produced `VS_Code_Remote_Extension_Layer=PASS`. VS Code Server connectivity and remote extension availability are separate states; the former had passed earlier while the latter had still been empty.

## 7. Discovering the Workspace Trust Gate

After the Python extension existed in WSL, `Python: Select Interpreter` was initially unavailable. The extension UI showed `Enable (Workspace)`, and the VS Code window was in `Restricted Mode`. The missing command was therefore not evidence of another failed installation.

After I trusted the research workspace, the Python extension became usable and the project interpreter could be selected. This exposed three independent states:

1. extension files are installed;
2. the extension is enabled for the workspace; and
3. Workspace Trust permits its runtime features.

Installed does not mean enabled, and enabled does not mean trusted. This distinction matters in recovery evidence: an extension inventory can be entirely correct while the expected commands remain restricted by editor security state. The resolved path produced `Workspace_Trust=PASS`.

## 8. Revalidating the Existing PyTorch Project through VS Code

The existing `/home/securityon/research/pytorch-smoke-test` project already provided a WSL compute test. I reopened it through VS Code Remote WSL, now using the completed and trusted editor workflow, and selected:

```text
/home/securityon/research/pytorch-smoke-test/.venv/bin/python
```

The project reported Python `3.12.14`, PyTorch `2.14.0+cu132`, bundled CUDA runtime `13.2`, `torch.cuda.is_available()` as `True`, and the NVIDIA GeForce RTX 5060 Laptop GPU. A real `2048 x 2048` matrix multiplication completed with shape `torch.Size([2048, 2048])` on `cuda:0`.

The result was `VS Code WSL PyTorch CUDA PASS`. The validated chain was now broader than the earlier compute test:

```text
VS Code Remote WSL
  -> trusted workspace
  -> Python extension
  -> project-specific uv .venv
  -> PyTorch
  -> RTX 5060
  -> actual CUDA workload
```

This closed `PyTorch_CUDA_Research_Workflow=PASS` at the workflow level rather than inferring it from device detection alone.

## 9. Creating a WSL Transformers Project

The workstation already had a Windows `transformers-smoke-test`, but there was no corresponding WSL project. I created `/home/securityon/research/transformers-smoke-test` with Python `3.12` and the following declared dependencies:

```text
accelerate==1.15.0
safetensors>=0.8.0
torch==2.14.0+cu132
torchvision==0.29.0+cu132
transformers==5.17.0
```

The PyTorch source remained explicit in project metadata:

```toml
[tool.uv.sources]
torch = { index = "pytorch" }
torchvision = { index = "pytorch" }

[[tool.uv.index]]
name = "pytorch"
url = "https://download.pytorch.org/whl/cu132"
```

This provenance cannot be collapsed into a generic PyPI dependency description. The dedicated cu132 index is part of what identifies the validated build. Imports of `torch`, `transformers`, `accelerate`, and `safetensors` passed; the environment reported PyTorch `2.14.0+cu132`, Transformers `5.17.0`, Accelerate `1.15.0`, available CUDA, and the RTX 5060.

## 10. Reusing the Shared Windows Model Store

The existing Hugging Face store remained at `D:\Lab\Models\HuggingFace`, visible in WSL as `/mnt/d/Lab/Models/HuggingFace`. I intentionally did not duplicate `Qwen/Qwen3-0.6B` into the Linux filesystem. Validation used:

```text
HF_HUB_CACHE=/mnt/d/Lab/Models/HuggingFace
HF_HUB_OFFLINE=1
TRANSFORMERS_OFFLINE=1
local_files_only=True
```

The tokenizer and model loaded from the local D: cache, all `311 / 311` weights loaded, and inference completed on `cuda:0`. The resulting path was:

```text
D:\Lab\Models\HuggingFace
  -> /mnt/d/Lab/Models/HuggingFace
  -> WSL Python 3.12
  -> Transformers 5.17.0
  -> PyTorch 2.14.0+cu132
  -> RTX 5060 cuda:0
```

The final result was `WSL Transformers offline CUDA inference PASS` and `Shared_Windows_WSL_Model_Store=PASS`. Sharing the model root avoids maintaining separate multi-gigabyte Windows and WSL copies.

This was an offline-mode validation: library-level network lookup was disabled and local assets were required. It was not a physically disconnected test, which remains part of Note 8.

## 11. Recording the Triton Warning without Overstating It

During WSL Transformers inference, Triton emitted a `_POSIX_C_SOURCE redefined` warning while compiling NVIDIA-related helper code. After the warning, the model still loaded, the GPU remained available, inference completed, `cuda:0` was used, and the final PASS was printed.

I therefore recorded:

```text
Triton_Compile_Warning=OBSERVED
Functional_Impact=None observed
```

The evidence supports a header or macro redefinition warning and a successful workload. It does not support a deeper root-cause claim, nor does a warning alone justify changing a functional PASS into a failure.

## 12. Validating the Project-specific Interpreter Path

Earlier, the actual `.ipynb` and kernel path in `wsl-research-base` had established the general Jupyter Research Workflow. The project-specific Transformers evidence came instead from the selected project `.venv` in a Python interactive environment, not from a separately demonstrated notebook kernel session.

```text
wsl-research-base
  -> validated .ipynb and kernel workflow

project-specific uv environment in transformers-smoke-test
  -> selected interpreter and actual project dependencies
```

Through the selected project `.venv` and Python interactive environment, the Transformers project reported PyTorch `2.14.0+cu132`, Transformers `5.17.0`, CUDA `True`, and the NVIDIA GeForce RTX 5060 Laptop GPU.

This established `Project_Specific_Venv=PASS` and `Project_Python_CUDA=PASS`. The general Jupyter Research Workflow remains `PASS` on the basis of the actual `.ipynb` and kernel validation in `wsl-research-base` recorded in Section 5.

## 13. Keeping Stable TensorFlow Results Deferred

TensorFlow remained a secondary WSL framework path, not a gate for completing the primary research environment. I retained the stable-version evidence from the earlier investigation:

| Version             | Installation | GPU discovery | GPU execution |
| ------------------- | ------------ | ------------- | ------------- |
| TensorFlow `2.21.0` | `PASS`       | `FAIL`        | Not reached   |
| TensorFlow `2.20.0` | `PASS`       | `PASS`        | `FAIL`        |

For `2.21.0`, NVIDIA library and `ptxas` remediation had been applied, but GPU discovery still failed. For `2.20.0`, the RTX 5060 appeared with Compute Capability `12.0`, but actual execution failed first with `CUDA_ERROR_INVALID_PTX` and then `CUDA_ERROR_INVALID_HANDLE`.

The stable result therefore remains `Stable_TensorFlow_GPU_Path=DEFERRED`. GPU discovery and GPU execution are separate gates, and neither package installation nor a visible device is enough to establish a usable framework path.

## 14. Demonstrating a TensorFlow Nightly Preview Path

I also tested the TensorFlow `2.22.0-dev20260923` nightly development build (`tf-nightly`). It produced a materially different result: the RTX 5060 was discovered, Compute Capability `12.0a` was reported, and a normal `2048 x 2048` GPU matrix multiplication passed.

The first successful run made several large CUDA allocation attempts and emitted out-of-memory warnings, although the workload itself still completed. I then enabled memory growth. The same `2048 x 2048` matrix multiplication passed again without the earlier large pre-allocation warnings.

For a second gate, I ran a `1024 x 1024` matrix multiplication under `@tf.function(jit_compile=True)`. The XLA service initialised for CUDA, reported the RTX 5060 at Compute Capability `12.0a`, loaded cuDNN `9.26.0`, and logged:

```text
Compiled cluster using XLA!
```

The XLA workload completed with `TensorFlow Nightly XLA GPU PASS`. An AutoGraph warning also appeared because the function had been defined through interactive or standard input and its source could not be located; it had no observed functional impact on this run.

The correct classification is `TensorFlow_Nightly_GPU_Path=PREVIEW_PASS`. A nightly development build can demonstrate a plausible future-compatible path, but it is not a stable, beta, or production baseline. I will retest TensorFlow `2.22` after a stable release before adopting it as the stable GPU path.

## 15. Verifying Project-managed cuDNN

During the later final review of this Note, I additionally verified the scope of the cuDNN installation. No cuDNN system package was installed inside WSL: `dpkg -l | grep -i cudnn` returned no result. That did not mean cuDNN was unavailable to TensorFlow. The environment at `/home/securityon/research/tensorflow-nightly-smoke-test` contained `nvidia-cudnn-cu12 9.26.0.51`, and XLA execution logged `Loaded cuDNN version 92600`.

The observed state was:

```text
System_Wide_cuDNN=NOT_INSTALLED
TensorFlow_Project_cuDNN=9.26.0.51
cuDNN_Runtime_Use=VERIFIED
```

This matches the runtime architecture: Ubuntu owns system components, while each framework project owns its Python and GPU-library dependency set. A system package query and a project runtime inventory answer different questions.

## 16. Revalidating after a Windows Reboot

After completing the environment, I rebooted Windows and revalidated WSL startup, the Ubuntu release and kernel, the Linux build toolchain, uv, research Python, the Jupyter base, `/dev/dxg`, RTX 5060 access, the matching VS Code Server, the nine remote extensions, the PyTorch CUDA workflow, and the Transformers local-model workflow.

All of those checks passed after restart, producing `Reboot_Persistence=PASS`. Reboot validation matters because a research workflow that depends on transient shell state, a one-session editor connection, or unrecovered mounts is not complete merely because it worked once before restart.

## 17. Recording the WSL Research Baseline

I recorded the baseline after completing the WSL research environment and reboot-persistence validation in:

```text
D:\Lab\OfflineLab\manifests\wsl-research-baseline.txt
```

Its WSL path is:

```text
/mnt/d/Lab/OfflineLab/manifests/wsl-research-baseline.txt
```

At the time of the baseline, `D:\Lab\OfflineLab\manifests` contained `21` files. This does not replace the earlier Note 6 snapshot, whose count was taken at a different point in the asset history. The increase is intentional evidence of the inventory's evolution rather than a discrepancy to edit out of the earlier record.

This manifest records the WSL research baseline and the stable TensorFlow `DEFERRED` state at that time. The TensorFlow nightly result was later follow-up evidence included in this Note; I did not retroactively rewrite the historical baseline manifest to include it.

## 18. Reviewing the Completion Gates

The Note 7 final state includes the later TensorFlow nightly follow-up while separating the completed primary environment from the remaining stable TensorFlow limitation:

| Gate                                | Result         |
| ----------------------------------- | -------------- |
| Ubuntu WSL2                         | `PASS`         |
| Linux Native Build Toolchain        | `PASS`         |
| Research Python Runtime             | `PASS`         |
| Jupyter Research Workflow           | `PASS`         |
| VS Code Remote WSL                  | `PASS`         |
| VS Code Remote Extension Layer      | `PASS`         |
| Workspace Trust                     | `PASS`         |
| Project-specific `.venv`            | `PASS`         |
| Project Python CUDA                 | `PASS`         |
| PyTorch CUDA Research Workflow      | `PASS`         |
| Transformers CUDA Research Workflow | `PASS`         |
| Shared Model Store                  | `PASS`         |
| Reboot Persistence                  | `PASS`         |
| Stable TensorFlow GPU Path          | `DEFERRED`     |
| TensorFlow Nightly GPU Path         | `PREVIEW_PASS` |
| WSL2 Research Environment           | `PASS`         |

TensorFlow's stable GPU gap does not invalidate the Linux build, Python, Jupyter, PyTorch, Transformers, shared-model, or editor workflows that define the primary WSL research environment. Conversely, the nightly success does not erase the stable gap. Keeping both statements visible preserves the difference between current baseline and forward-looking compatibility evidence.

## 19. From Compute Path to Research Environment

WSL2 has progressed from a validated GPU compute path to a usable Linux research environment. It now has Linux-native build tools, isolated research Python, Jupyter, a populated VS Code remote extension layer, trusted research workspaces, project-specific uv environments, PyTorch CUDA, Transformers CUDA, shared local-model access, and reboot persistence.

The most important corrections were not package-version changes. Shell context changed an inventory result; server presence did not imply remote extensions; extension installation did not imply enablement or Workspace Trust; a detected GPU did not imply successful execution; and the absence of a system-wide cuDNN package did not imply that a project-managed runtime lacked cuDNN. Testing the actual path resolved each ambiguity.

The correct closing status is:

```text
WSL2 Research Environment = PASS
Stable TensorFlow GPU Path = DEFERRED
TensorFlow Nightly GPU Path = PREVIEW PASS
```

The `tf-nightly 2.22.0-dev20260923` result demonstrates RTX 5060 discovery, normal and memory-growth GPU execution, XLA/JIT execution, and project-managed cuDNN `9.26` use. It remains preview evidence, not the stable baseline.

The workstation as a whole has not yet passed a physically disconnected end-to-end validation. Closing the gap discovered during Note 6 before attempting that final gate was the value of this phase. Note 8 will perform the end-to-end offline research environment validation under physical network isolation.
