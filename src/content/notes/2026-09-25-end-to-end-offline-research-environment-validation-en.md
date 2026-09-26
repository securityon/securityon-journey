---
title: "Validating the Research Environment Under Physical Network Isolation"
description: "Physically disconnecting the workstation, restoring WSL and fresh Python environments from preserved assets, correcting a failed llama.cpp bundle, and defining the verified offline boundary."
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

“Completing WSL2 as a Practical Linux Research Environment” closed the implementation gap discovered during offline-asset preparation. WSL2 had become a usable Linux research environment with native build tools, isolated Python projects, Jupyter, VS Code Remote WSL, PyTorch CUDA, Transformers CUDA, shared models, and reboot persistence.

That still left a stronger question unanswered. Application settings such as `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, `local_files_only=True`, and `uv --offline` can prevent their respective tools from looking online, but they do not prove that the workstation remains useful when external networking is physically unavailable. Nor does the existence of an installer, wheelhouse, archive, or Git bundle prove that it can reconstruct anything.

This final validation phase therefore combined physical network isolation with restored environments, real GPU workloads, fresh package reconstruction, source recovery, and persistence testing. It also found a genuine weakness: the llama.cpp bundle that had passed `git bundle verify` in Note 6 failed its first independent clone. Preserving that failure and the correction became as important as the successful offline runs.

## 1. Raising the Offline Validation Gate

The starting point was already strong. The WSL2 Research Environment, Linux-native toolchain, research Python, Jupyter, Remote WSL, PyTorch CUDA, Transformers CUDA, shared D: model store, and reboot persistence had passed. OfflineLab held installers, wheelhouses, source assets, recovery documentation, checksums, and manifests, while `D:\Lab\Models` remained a separate shared model store.

Note 8 raised two earlier gates:

| Earlier evidence                        | Stronger Note 8 gate                                     |
| --------------------------------------- | -------------------------------------------------------- |
| Application-level offline mode          | Physical external network isolation                      |
| Preserved asset exists and hashes match | Fresh reconstruction or independent restoration succeeds |

The TensorFlow boundary also remained unchanged. Stable TensorFlow `2.21.0` installed but still failed GPU discovery after the NVIDIA library and `ptxas` remediation. Stable `2.20.0` found the RTX 5060 at Compute Capability `12.0`, but execution failed with `CUDA_ERROR_INVALID_PTX` followed by `CUDA_ERROR_INVALID_HANDLE`.

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

A WSL export is a useful full-environment recovery asset, but its size and successful creation are not functional evidence. The archive still had to be imported separately and exercised.

## 3. Importing a Separate Restore-test Distribution

I imported the TAR into a separate temporary distribution named `Ubuntu-26.04-RestoreTest`, installed under:

```text
D:\Lab\WSL-Restore-Test
```

The original `Ubuntu-26.04` distribution was left untouched, and `wsl -l -v` showed both distributions independently. This separation prevented a restore test from quietly reusing the original distro's state.

The chronology matters: the `wsl --import` operation itself occurred before physical network isolation. I first checked that the restored distro was functional, then used that restored environment for the physically disconnected tests. I do not claim that the import command was repeated while offline.

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

The machine had no usable external network path during this stage, producing `Physical_Network_Isolation=PASS`. This state was not simulated by environment variables. The offline flags used in later tests added application-level constraints on top of actual physical isolation.

## 7. Exercising WSL Python, Jupyter, and Remote Development Offline

Inside `Ubuntu-26.04-RestoreTest`, I invoked uv with `--offline` where appropriate and validated research Python `3.12.14`, JupyterLab `4.6.4`, IPython `9.17.1`, and ipykernel `7.3.0`. The result was `Physical_Offline_WSL_Python_Jupyter=PASS`.

The distro retained `/dev/dxg` and the NVIDIA GeForce RTX 5060 Laptop GPU, producing `Physical_Offline_WSL_GPU_Access=PASS`. Device visibility was only an intermediate gate; the framework workloads in the next sections supplied execution evidence.

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

The final result was `PHYSICAL OFFLINE WSL PyTorch CUDA PASS`. This combined a restored environment, unavailable external package access, explicit uv offline mode, and actual GPU execution.

## 9. Running Transformers from the Shared Model Store

The restored Transformers test combined four independent constraints:

```text
physical network isolation
uv run --offline
HF_HUB_OFFLINE=1 and TRANSFORMERS_OFFLINE=1
local_files_only=True
```

`Qwen/Qwen3-0.6B` loaded from `/mnt/d/Lab/Models/HuggingFace`, the WSL view of the shared Windows model store. Inference completed on `cuda:0`, producing `PHYSICAL OFFLINE WSL Transformers CUDA PASS`.

Physical isolation proved that an external fallback was unavailable. The uv and Hugging Face settings proved that the tools were explicitly constrained to their offline paths. Local-files-only loading proved the model source, and CUDA inference proved functional execution. These controls are complementary rather than interchangeable.

## 10. Retesting the TensorFlow Nightly Preview Offline

The restored TensorFlow nightly project also ran while physically disconnected. The TensorFlow `2.22.0-dev20260923` nightly build (`tf-nightly`) discovered the RTX 5060, completed normal GPU matrix multiplication, passed the memory-growth path, and completed the XLA/JIT path.

The XLA runtime again used project-managed cuDNN. No system-wide WSL cuDNN package was present, while the project environment contained `nvidia-cudnn-cu12 9.26.0.51` and execution logged `Loaded cuDNN version 92600`.

The offline test produced `TensorFlow_Nightly_Offline_Preview=PASS`. The broader framework classification remains `TensorFlow_Nightly_GPU_Path=PREVIEW_PASS`, while `Stable_TensorFlow_GPU_Path=PENDING`. A successful nightly development build is useful compatibility evidence, but it is not a stable, beta, or production baseline.

## 11. Using Windows Local AI without External Networking

Windows-side local AI remained useful during the same physical isolation. Ollama ran local inference with `qwen3.5:4b`, and its localhost API passed at:

```text
http://localhost:11434
```

Localhost communication does not constitute external network access. The result was `Physical_Offline_Ollama=PASS`.

The llama.cpp runtime used an existing local GGUF file and completed GPU-offloaded local inference, producing `Physical_Offline_llama.cpp=PASS`. I did not use or claim the `-hf` retrieval path for this test; choosing the local model file was part of the offline validation boundary.

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

This test converted the wheelhouse from a collection of saved files into a verified reconstruction asset.

## 13. Reconstructing Transformers and Local Inference

I created a second new Windows project at:

```text
D:\Lab\Research\transformers-physical-offline-test
```

With the network still disconnected, installation used `--no-index` and `--find-links` against `D:\Lab\OfflineLab\wheelhouse\transformers-py312`. The reconstructed environment included PyTorch `2.14.0+cu132`, Transformers `5.17.0`, and Accelerate `1.15.0`.

`Qwen/Qwen3-0.6B` then loaded all `311 / 311` weights from `D:\Lab\Models\HuggingFace` and completed inference on `cuda:0`. The result was `PHYSICAL OFFLINE TRANSFORMERS WHEELHOUSE PASS`, recorded as `Physical_Offline_Transformers_Wheelhouse_Reconstruction=PASS`.

This single gate joined fresh package reconstruction, a separately managed local model, and real CUDA inference.

## 14. Discovering That the Original llama.cpp Bundle Could Not Restore

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

This failure was not a reason to rewrite Note 6. That Note accurately records the check performed at the time. The end-to-end recovery attempt revealed that the check had been insufficient for this workflow.

## 15. Investigating the Original Repository

I investigated `D:\Lab\Research\llama.cpp` before blaming a specific Git mechanism. The repository was not shallow: `git rev-parse --is-shallow-repository` returned `false`. It had no `remote.origin.promisor` or `remote.origin.partialclonefilter` configuration, no replace refs, and no `.git/info/grafts` file.

The missing parent `d9e03f1074dbd2979126d91dce1b5d304ec8394e` existed in the original repository, was a valid commit, and was an ancestor of the validated `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4` commit. Normal and `--no-replace-objects` traversal both counted `96,959` objects.

Repository integrity also passed:

| Check                  | Result       |
| ---------------------- | ------------ |
| `git fsck --full`      | `PASS`       |
| Objects checked        | `99,090`     |
| Packed repository size | `378.25 MiB` |

The bounded conclusion is that the original source repository was healthy while the preserved bundle was insufficient for independent restoration. The evidence does not establish a more precise internal Git root cause, so I do not speculate beyond it.

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

The result was `llama.cpp_Source_Recovery=PASS`. This was a local-file independent clone that did not require a remote Git repository. I do not claim that the corrected bundle's final clone was repeated while external networking remained physically disconnected.

## 17. Strengthening the Source-recovery Gate

The failure changed the source-preservation criterion. In this workflow, `git bundle verify` alone was not sufficient evidence that an independent repository could be recovered.

The stronger gate is now:

1. preserve the source asset;
2. clone it into a completely separate location and repository;
3. verify the exact expected commit; and
4. run `git fsck --full` on the restored repository.

Retaining the failed bundle preserves the evidence that motivated this stronger standard. The correction does not erase the earlier failure; it makes the recovery history reproducible.

## 18. Refreshing Current Integrity Evidence

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

Historical manifests remain snapshots of the evidence available at their recording time. New manifests describe the stronger later state without retroactively changing the earlier record.

## 19. Verifying Persistence while Still Offline

During the earlier physical-isolation run, before reconnecting the network for the llama.cpp troubleshooting, I shut down and restarted the WSL environment. After restart, RTX 5060 access passed and the PyTorch CUDA workload passed again.

The result was `Physical_Offline_Persistence=PASS`. This was narrower than another Windows reboot test and I do not attach unobserved timings or additional restart evidence to it. It demonstrates that the physically offline WSL and GPU path survived a WSL shutdown and restart.

## 20. Recording the End-to-End Baseline

The final validation baseline was written to:

```text
D:\Lab\OfflineLab\manifests\offline-end-to-end-validation-baseline.txt
```

Its observed size was `6,875` bytes. At Note 8 completion, `D:\Lab\OfflineLab\manifests` contained `24` files, compared with `21` at Note 7 completion. Earlier Note 6 and Note 7 counts remain historical snapshots rather than values to rewrite.

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

`End_to_End_Offline_Research_Environment=PASS` and `Stable_TensorFlow_GPU_Path=PENDING` are compatible conclusions. Stable TensorFlow is a secondary compatibility path, not a gate for the primary workflows validated here.

## 21. Closing the Windows Workstation Construction Series

The Windows research workstation has now passed an end-to-end offline validation for its primary research workflows. The tested scope includes physical network isolation, restored WSL, Python and uv, Jupyter, VS Code Remote WSL, PyTorch CUDA, Transformers CUDA, shared local models, Ollama, llama.cpp local GGUF inference, fresh reconstruction from explicit wheelhouses, independent source recovery, current checksum evidence, and offline persistence.

The most valuable result was not an uninterrupted list of passes. The first llama.cpp bundle passed format verification but failed actual independent restoration. The original repository was healthy, the preservation artifact was the weak point, and rebuilding from the exact validated tag produced a recoverable local bundle. End-to-end validation did what it was meant to do: it tried to break assumptions established during preparation and strengthened the gate when one failed.

The correct closing distinction is:

```text
End-to-End Offline Research Environment = PASS
Stable TensorFlow GPU Path = PENDING
TensorFlow Nightly GPU Path = PREVIEW PASS
```

This does not mean the workstation will never need Internet access again, nor that every possible AI or development framework has been validated offline. It means that, under the tested conditions, the primary research environment can operate without external networking and important workflows can be reconstructed from explicitly preserved local assets.

This is the final validation Note of the Windows research workstation construction series. The remaining follow-up is to retest TensorFlow `2.22` after its official stable release; the MacBook research environment belongs to a separate subsequent project.
