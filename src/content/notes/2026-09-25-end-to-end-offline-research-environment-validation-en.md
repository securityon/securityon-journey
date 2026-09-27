---
title: "Validating the Research Environment Under Physical Network Isolation"
description: "Testing the research environment before entering a restricted network: restored WSL, fresh Python environments, and a failed llama.cpp bundle that changed the source-recovery checks."
lang: en
translationKey: end-to-end-offline-research-environment-validation
pubDatetime: 2026-09-25T00:00:00+09:00
tags:
  - research-journey
  - windows
  - workstation
  - wsl2
  - offline
  - reproducibility
featured: false
draft: false
---

“Completing WSL2 as a Practical Linux Research Environment” filled the omissions found during offline-asset preparation. I had configured Linux build tools, isolated Python projects, Jupyter, and VS Code Remote WSL, then verified PyTorch and Transformers GPU workloads, shared-model access, and operation after a reboot.

The next step was to disconnect external networking. Settings such as `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, `local_files_only=True`, and `uv --offline` prevent their respective tools from looking online. I now wanted to use the environment without a connection and test whether the preserved assets could reconstruct or restore it.

This is the eighth Note in the Windows workstation construction series. While preparing for a restricted network in an environment with unrestricted Internet access, I tested disconnected operation alongside restoration and reconstruction. The tests exposed a problem: the llama.cpp bundle that had passed `git bundle verify` in Note 6 failed its first independent clone.

## 1. Scope of This Validation

The WSL research environment and its operation after a reboot had passed the preceding tests. OfflineLab held installers, wheelhouses, source, recovery documentation, checksums, and manifests. Models remained separately managed under `D:\Lab\Models`.

This phase added two checks:

| Earlier evidence                     | Stronger Note 8 gate                                     |
| ------------------------------------ | -------------------------------------------------------- |
| Application-level offline mode       | Physical external network isolation                      |
| Assets preserved and hashes recorded | Fresh reconstruction or independent restoration succeeds |

The earlier stable TensorFlow results still applied. Version `2.21.0` installed but failed GPU discovery after the NVIDIA library and `ptxas` remediation. Version `2.20.0` found the RTX 5060 at Compute Capability `12.0`, but execution failed with `CUDA_ERROR_INVALID_PTX` followed by `CUDA_ERROR_INVALID_HANDLE`.

The TensorFlow `2.22.0-dev20260923` nightly development build (`tf-nightly`) remained a preview: it had passed a normal `2048 x 2048` GPU matrix multiplication, repeated that workload with memory growth and without the earlier large pre-allocation warnings, and completed a `1024 x 1024` XLA/JIT workload with `Compiled cluster using XLA!`. It reported Compute Capability `12.0a` and loaded cuDNN `9.26.0`. These results did not promote it to a stable baseline.

## 2. Freezing the Completed WSL Environment

Before physical isolation, I exported the completed `Ubuntu-26.04` distribution to:

```text
D:\Lab\OfflineLab\backups\wsl\Ubuntu-26.04-research-baseline-20260924.tar
```

The TAR occupied `20.1 GB` and had SHA-256:

```text
45B37CEA6EAED26A837BC693A2670918514C7A250B23FD8469B5A9B93F72006C
```

The snapshot preserved Ubuntu, the Linux-native build toolchain, uv and research Python, the Jupyter environment, VS Code Server and remote extensions, and the PyTorch, Transformers, and TensorFlow research projects. It did not duplicate the model store. Model assets remained separately managed under `D:\Lab\Models`, preserving the storage boundary established in Note 6.

To test recovery from the TAR, I imported it into a separate distribution and ran the restored environment.

## 3. Importing a Separate Restore-test Distribution

I imported the TAR into a separate temporary distribution named `Ubuntu-26.04-RestoreTest`, installed under:

```text
D:\Lab\WSL-Restore-Test
```

The original `Ubuntu-26.04` distribution was left untouched, and `wsl -l -v` showed both distributions independently. This separation prevented a restore test from quietly reusing the original distro's state.

The `wsl --import` operation took place before network isolation. I checked the restored distro first, then disconnected the network for the operational tests. I did not repeat the import while offline.

## 4. Checking the Restored User and Research State

The restored distro contained user `securityon`, UID and GID `1000`, shell `/bin/bash`, and the expected home:

```text
HOME=/home/securityon
```

An early PowerShell-to-bash command displayed a malformed-looking HOME line because PowerShell expanded `$HOME` before bash processed it. Direct WSL validation confirmed that the restored HOME was intact; the symptom was another shell-quoting boundary, not restore damage.

`/home/securityon/research` contained the expected projects:

```text
pytorch-smoke-test
tensorflow-220-smoke-test
tensorflow-nightly-smoke-test
tensorflow-smoke-test
transformers-smoke-test
wsl-research-base
wsl-smoke-test
```

The restored distro also retained access to `/mnt/d/Lab`. The resulting gates were `User_Home_Restore=PASS`, `Research_Project_Restore=PASS`, and `Shared_D_Access=PASS`.

## 5. Functionally Validating the Restore before Isolation

Before disconnecting the workstation, I verified that the restored distro retained the Linux-native build toolchain, uv, research Python, the Jupyter base, the matching VS Code Server, the WSL remote extensions, `/dev/dxg`, RTX 5060 access, and the project-specific environments.

The restored PyTorch project reported PyTorch `2.14.0+cu132`, bundled CUDA runtime `13.2`, CUDA availability `True`, and the NVIDIA GeForce RTX 5060 Laptop GPU. Its actual `2048 x 2048` matrix multiplication completed as `torch.Size([2048, 2048])` on `cuda:0`, producing `RESTORED WSL PyTorch CUDA PASS`.

The restored Transformers project used `D:\Lab\Models\HuggingFace` through `/mnt/d/Lab/Models/HuggingFace`. With `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, and `local_files_only=True`, `Qwen/Qwen3-0.6B` loaded all `311 / 311` weights and completed inference on `cuda:0`. The result was `RESTORED WSL Transformers CUDA PASS`.

During one `uv run`, the local `transformers-smoke-test` project package was rebuilt and reinstalled in milliseconds. That observation is not evidence of an external download. The later physically disconnected run supplied the stronger evidence.

## 6. Proving Physical Network Isolation

I then physically disconnected the workstation from external networking. The isolation gate deliberately treated successful external access as a failure and blocked access as the expected result.

| Connectivity check     | Observed state | Gate interpretation |
| ---------------------- | -------------- | ------------------- |
| Windows external HTTPS | `BLOCKED`      | `PASS`              |
| WSL external network   | `BLOCKED`      | `PASS`              |
| PyPI                   | `BLOCKED`      | `PASS`              |
| Hugging Face           | `BLOCKED`      | `PASS`              |

There was no usable external connection, producing `Physical_Network_Isolation=PASS`. The later tests also applied each tool's offline settings during this disconnected state.

## 7. Exercising WSL Python, Jupyter, and Remote Development Offline

Inside `Ubuntu-26.04-RestoreTest`, I invoked uv with `--offline` where appropriate and validated research Python `3.12.14`, JupyterLab `4.6.4`, IPython `9.17.1`, and ipykernel `7.3.0`. The result was `Physical_Offline_WSL_Python_Jupyter=PASS`.

The distro retained `/dev/dxg` and the NVIDIA GeForce RTX 5060 Laptop GPU. After recording `Physical_Offline_WSL_GPU_Access=PASS`, I tested actual workloads.

VS Code Remote WSL also worked while external networking remained unavailable. The matching server, Python and Jupyter remote extension layers, project interpreters, and Jupyter kernel were already present and usable. This produced `Physical_Offline_VS_Code_WSL=PASS` and `Physical_Offline_Jupyter=PASS`.

I did not test or claim offline access to the VS Code Marketplace. The validated scope was operation with the remote components that had already been installed and preserved.

## 8. Running PyTorch CUDA while Physically Offline

From `/home/securityon/research/pytorch-smoke-test`, I executed the restored project with `uv run --offline`. It reported:

| Check          | Result                                 |
| -------------- | -------------------------------------- |
| PyTorch        | `2.14.0+cu132`                         |
| CUDA runtime   | `13.2`                                 |
| CUDA available | `True`                                 |
| GPU            | NVIDIA GeForce RTX 5060 Laptop GPU     |
| Workload       | `2048 x 2048` matrix multiplication    |
| Output         | `torch.Size([2048, 2048])` on `cuda:0` |

The restored environment completed GPU computation without external package access and printed `PHYSICAL OFFLINE WSL PyTorch CUDA PASS`.

## 9. Running Transformers from the Shared Model Store

The restored Transformers test combined four independent constraints:

```text
physical network isolation
uv run --offline
HF_HUB_OFFLINE=1 and TRANSFORMERS_OFFLINE=1
local_files_only=True
```

`Qwen/Qwen3-0.6B` loaded from `/mnt/d/Lab/Models/HuggingFace`, the WSL view of the shared Windows model store. Inference completed on `cuda:0`, producing `PHYSICAL OFFLINE WSL Transformers CUDA PASS`.

## 10. Retesting the TensorFlow Nightly Preview Offline

The restored TensorFlow nightly project also ran while physically disconnected. The TensorFlow `2.22.0-dev20260923` nightly build (`tf-nightly`) discovered the RTX 5060, completed normal GPU matrix multiplication, passed the memory-growth path, and completed the XLA/JIT path.

The XLA runtime again used project-managed cuDNN. No system-wide WSL cuDNN package was present, while the project environment contained `nvidia-cudnn-cu12 9.26.0.51` and execution logged `Loaded cuDNN version 92600`.

The offline test produced `TensorFlow_Nightly_Offline_Preview=PASS`. I retained `TensorFlow_Nightly_GPU_Path=PREVIEW_PASS` for the development build and recorded `Stable_TensorFlow_GPU_Path=PENDING` for the stable path.

In Notes 6 and 7, `DEFERRED` recorded the decision to set aside the stable path after those tests failed to provide usable GPU execution. Here, `PENDING` means that, following the nightly success, I am awaiting the TensorFlow `2.22` stable release and a retest. The stable path has not newly passed, and the nightly build has not been adopted as a stable, beta, or production baseline.

## 11. Using Windows Local AI without External Networking

Windows-side local AI remained useful during the same physical isolation. Ollama ran local inference with `qwen3.5:4b`, and its localhost API passed at:

```text
http://localhost:11434
```

Localhost communication does not constitute external network access. The result was `Physical_Offline_Ollama=PASS`.

The llama.cpp runtime completed GPU-offloaded inference with an existing local GGUF file, producing `Physical_Offline_llama.cpp=PASS`. I specified the local file directly and did not use `-hf` retrieval in this test.

## 12. Reconstructing PyTorch from the Wheelhouse

To test the wheelhouse rather than reuse a working environment, I created a completely new Windows project at:

```text
D:\Lab\Research\pytorch-physical-offline-test
```

The existing project `.venv` was not reused. While the workstation remained physically offline, installation used `--no-index` and `--find-links` against:

```text
D:\Lab\OfflineLab\wheelhouse\pytorch-cu132-py312
```

The fresh environment reported PyTorch `2.14.0+cu132`, CUDA availability, and the NVIDIA GeForce RTX 5060 Laptop GPU. An actual CUDA matrix multiplication passed. The result was `PHYSICAL OFFLINE PYTORCH WHEELHOUSE PASS`, or `Physical_Offline_PyTorch_Wheelhouse_Reconstruction=PASS` in the final baseline.

## 13. Reconstructing Transformers and Local Inference

I created a second new Windows project at:

```text
D:\Lab\Research\transformers-physical-offline-test
```

With the network still disconnected, installation used `--no-index` and `--find-links` against `D:\Lab\OfflineLab\wheelhouse\transformers-py312`. The reconstructed environment included PyTorch `2.14.0+cu132`, Transformers `5.17.0`, and Accelerate `1.15.0`.

`Qwen/Qwen3-0.6B` then loaded all `311 / 311` weights from `D:\Lab\Models\HuggingFace` and completed inference on `cuda:0`. The result was `PHYSICAL OFFLINE TRANSFORMERS WHEELHOUSE PASS`, recorded as `Physical_Offline_Transformers_Wheelhouse_Reconstruction=PASS`.

## 14. The Original llama.cpp Bundle Fails to Restore

Note 6 had preserved llama.cpp commit `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4` in `llama.cpp-b29c606.bundle`. At the time, `git bundle verify` reported that the bundle recorded complete history and was okay. That was the source-preservation standard used then.

Note 8 attempted an actual clone into an independent repository. The first recovery failed with errors including:

```text
Could not read d9e03f1074dbd2979126d91dce1b5d304ec8394e
Failed to traverse parents of commit b29c606e28a01b1bc8c1351026a0fa6e616bf6c4
remote did not send all necessary objects
```

The evidence therefore separated two gates:

```text
Earlier_Bundle_Format_Verification=PASS
Earlier_Bundle_Independent_Restore=FAIL
```

Note 6 retains the result of the check performed at the time. The independent restoration attempt showed that this check alone was insufficient to establish recoverability.

## 15. Investigating the Original Repository

I investigated `D:\Lab\Research\llama.cpp` before blaming a specific Git mechanism. The repository was not shallow: `git rev-parse --is-shallow-repository` returned `false`. It had no `remote.origin.promisor` or `remote.origin.partialclonefilter` configuration, no replace refs, and no `.git/info/grafts` file.

The missing parent `d9e03f1074dbd2979126d91dce1b5d304ec8394e` existed in the original repository, was a valid commit, and was an ancestor of the validated `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4` commit. Normal and `--no-replace-objects` traversal both counted `96,959` objects.

Repository integrity also passed:

| Check                  | Result       |
| ---------------------- | ------------ |
| `git fsck --full`      | `PASS`       |
| Objects checked        | `99,090`     |
| Packed repository size | `378.25 MiB` |

The original repository passed its integrity checks, but the preserved bundle could not restore an independent repository. I did not establish a more specific internal Git cause.

## 16. Building and Independently Restoring a Replacement Bundle

The validated source tag `b10964` points to `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`. After reconnecting to continue troubleshooting, I isolated the failed artifact rather than deleting it:

```text
D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606-failed-restore.bundle
```

I then created a new full bundle from the exact validated tag at the current recovery path:

```text
D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606.bundle
```

The SHA-256 recorded for the earlier bundle in Note 6 belongs to the retained failed-recovery artifact and must not identify this replacement. I therefore do not reuse it for the current bundle.

An independent clone from the replacement transferred approximately `356.08 MiB` and restored `93,839` objects. I checked out `b10964`; the resulting detached HEAD was expected for an exact tag and was not a recovery failure. The restored HEAD matched `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`, and `git fsck --full` passed over `93,839` objects.

The result was `llama.cpp_Source_Recovery=PASS`. The clone used a local bundle without a remote Git repository, but the final clone of the replacement took place after reconnection. I did not disconnect the network again to repeat it.

## 17. Strengthening the Source-recovery Gate

After this failure, I decided to supplement `git bundle verify` with the following recovery checks:

1. preserve the source asset;
2. clone it into a completely separate location and repository;
3. verify the exact expected commit; and
4. run `git fsck --full` on the restored repository.

I also retained the failed bundle so that the reason for changing the checks could be traced.

## 18. Recording Current Asset Hashes

I did not overwrite the historical `D:\Lab\OfflineLab\manifests\offline-assets-sha256.txt` from Note 6. Instead, I created a current manifest for the intentionally preserved OfflineLab roots:

```text
D:\Lab\OfflineLab\manifests\offline-assets-sha256-20260925.txt
Size: 348,657 bytes
```

Disposable cache remained excluded. Models also remained outside OfflineLab, with a separate manifest:

```text
D:\Lab\OfflineLab\manifests\model-assets-sha256-20260925.txt
Size: 5,623 bytes
Model root: D:\Lab\Models
```

I retained the earlier manifest as a record of its original state and recorded the current assets in new dated files.

## 19. Verifying Persistence while Still Offline

During the earlier physical-isolation run, before reconnecting the network for the llama.cpp troubleshooting, I shut down and restarted the WSL environment. After restart, RTX 5060 access passed and the PyTorch CUDA workload passed again.

The result was `Physical_Offline_Persistence=PASS`. This test covered an offline WSL shutdown and restart, not a full Windows reboot.

## 20. Recording the End-to-End Baseline

The final validation baseline was written to:

```text
D:\Lab\OfflineLab\manifests\offline-end-to-end-validation-baseline.txt
```

The file occupied `6,875` bytes. At the end of this phase, `D:\Lab\OfflineLab\manifests` contained `24` files, compared with `21` at Note 7 completion.

| Baseline key                                              | Result    |
| --------------------------------------------------------- | --------- |
| `Physical_Network_Isolation`                              | `PASS`    |
| `WSL_Snapshot_Restore`                                    | `PASS`    |
| `Restored_WSL_Research_Environment`                       | `PASS`    |
| `Physical_Offline_PyTorch`                                | `PASS`    |
| `Physical_Offline_Transformers`                           | `PASS`    |
| `TensorFlow_Nightly_Offline_Preview`                      | `PASS`    |
| `Stable_TensorFlow_GPU_Path`                              | `PENDING` |
| `Physical_Offline_VS_Code_WSL`                            | `PASS`    |
| `Physical_Offline_Jupyter`                                | `PASS`    |
| `Physical_Offline_Ollama`                                 | `PASS`    |
| `Physical_Offline_llama.cpp`                              | `PASS`    |
| `Physical_Offline_PyTorch_Wheelhouse_Reconstruction`      | `PASS`    |
| `Physical_Offline_Transformers_Wheelhouse_Reconstruction` | `PASS`    |
| `llama.cpp_Source_Recovery`                               | `PASS`    |
| `Offline_Asset_Integrity`                                 | `PASS`    |
| `Physical_Offline_Persistence`                            | `PASS`    |
| `End_to_End_Offline_Research_Environment`                 | `PASS`    |
| `Manifest_Files_Current`                                  | `24`      |

Stable TensorFlow remains a separate follow-up. The completion scope below refers to the primary research workflows tested in this phase.

## 21. Pre-deployment Preparation and Offline Tests

This phase tested the prepared research environment with external networking disconnected and reconstructed selected environments from preserved assets. Research tools and GPU workloads ran in restored WSL, Windows local AI remained usable, and wheelhouses supplied fresh Python environments. The WSL import itself took place before isolation; the final clone of the replacement llama.cpp bundle took place after reconnection.

The llama.cpp failure showed why I needed to use preserved files in an independent environment. Source-recovery checks now include a separate clone, verification of the expected commit, and an integrity check of the restored repository.

The recorded closing states are:

```text
End-to-End Offline Research Environment = PASS
Stable TensorFlow GPU Path = PENDING
TensorFlow Nightly GPU Path = PREVIEW PASS
```

The completed scope is pre-deployment preparation and the offline workflows tested here. Adaptation and validation under the target company's mandatory security software and network policies, including proxy, CA, and SSL/TLS inspection, have not yet been performed. Embedding and RAG workflows, creation of `D:\Recovery\GoldenResearch.wim`, and recovery testing through WinRE also remain unfinished. I plan to retest TensorFlow `2.22` after its stable release.

The original architecture's objectives are therefore not all complete. This Note records how far research functionality and recovery paths have been verified before entering the restricted network. The MacBook research environment remains a separate subsequent project.
