---
title: "실제 네트워크를 끊고 검증한 Offline 연구환경"
description: "연구 워크스테이션의 network를 실제로 분리하고 WSL과 새 Python 환경을 보존 자산에서 복구하며, 실패한 llama.cpp bundle을 수정해 검증된 offline 경계를 확정합니다."
lang: ko
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

「WSL2를 실제 Linux 연구환경으로 완성하기」에서는 offline asset 준비 중 발견한 구현 간격을 닫았습니다. WSL2는 Linux-native build tool, 격리된 Python project, Jupyter, VS Code Remote WSL, PyTorch CUDA, Transformers CUDA, 공유 model과 reboot persistence를 갖춘 실제 Linux 연구환경이 됐습니다.

그러나 더 강한 질문은 아직 남아 있었습니다. `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, `local_files_only=True`, `uv --offline` 같은 설정은 각 도구의 online lookup을 막을 수 있지만, external network가 물리적으로 없을 때도 workstation이 유용하다는 사실까지 증명하지는 않습니다. Installer, wheelhouse, archive 또는 Git bundle이 존재한다는 사실도 실제 재구축 가능성을 보장하지 않습니다.

마지막 validation 단계에서는 physical network isolation에 restored environment, 실제 GPU workload, fresh package reconstruction, source recovery와 persistence test를 결합했습니다. 그리고 실제 약점 하나를 발견했습니다. Note 6에서 `git bundle verify`를 통과한 llama.cpp bundle이 첫 independent clone에는 실패했습니다. 그 failure와 correction을 그대로 보존하는 일은 성공한 offline run만큼 중요해졌습니다.

## 1. Offline Validation Gate 강화

출발 상태는 이미 충분히 강했습니다. WSL2 Research Environment, Linux-native toolchain, research Python, Jupyter, Remote WSL, PyTorch CUDA, Transformers CUDA, 공유 D: model store와 reboot persistence가 통과했고, OfflineLab에는 installer, wheelhouse, source asset, recovery documentation, checksum과 manifest가 있었습니다. `D:\Lab\Models`는 계속 별도의 shared model store로 유지했습니다.

Note 8에서는 앞선 두 gate를 강화했습니다.

| 이전 evidence                  | Note 8의 더 강한 gate                              |
| ------------------------------ | -------------------------------------------------- |
| Application-level offline mode | 물리적인 external network isolation                |
| 보존 asset 존재와 hash 일치    | Fresh reconstruction 또는 independent restore 성공 |

TensorFlow boundary도 그대로였습니다. Stable TensorFlow `2.21.0`은 설치됐지만 NVIDIA library와 `ptxas` remediation 뒤에도 GPU discovery가 실패했습니다. Stable `2.20.0`은 Compute Capability `12.0`의 RTX 5060을 찾았지만, execution은 `CUDA_ERROR_INVALID_PTX`에 이어 `CUDA_ERROR_INVALID_HANDLE`로 실패했습니다.

TensorFlow `2.22.0-dev20260923` nightly development build(`tf-nightly`)는 계속 preview였습니다. 일반 `2048 x 2048` GPU matrix multiplication을 통과했고, memory growth를 적용한 뒤에는 앞서 나타난 큰 pre-allocation warning 없이 같은 workload를 완료했습니다. `1024 x 1024` XLA/JIT workload도 `Compiled cluster using XLA!`와 함께 통과했습니다. Compute Capability `12.0a`와 cuDNN `9.26.0` 사용도 확인했지만, 이 결과를 stable baseline으로 올리지는 않았습니다.

## 2. 완성된 WSL 환경 Freeze

Physical isolation 전에 완성한 `Ubuntu-26.04` distribution을 다음 위치로 export했습니다.

```text
D:\Lab\OfflineLab\backups\wsl\Ubuntu-26.04-research-baseline-20260924.tar
```

TAR의 크기는 `20.1 GB`, SHA-256은 다음과 같습니다.

```text
45B37CEA6EAED26A837BC693A2670918514C7A250B23FD8469B5A9B93F72006C
```

Snapshot에는 Ubuntu, Linux-native build toolchain, uv와 research Python, Jupyter environment, VS Code Server와 remote extension, PyTorch·Transformers·TensorFlow research project가 포함됐습니다. Model store는 복제하지 않았습니다. Model asset은 Note 6에서 정한 storage boundary에 따라 `D:\Lab\Models`에서 별도로 관리했습니다.

WSL export는 유용한 full-environment recovery asset이지만, 큰 TAR가 성공적으로 만들어졌다는 사실만으로는 기능 evidence가 되지 않습니다. 별도 위치로 import하고 실제로 실행해야 했습니다.

## 3. 별도 Restore-test Distribution Import

TAR를 `Ubuntu-26.04-RestoreTest`라는 별도 temporary distribution으로 import했습니다. Install location은 다음과 같습니다.

```text
D:\Lab\WSL-Restore-Test
```

Original `Ubuntu-26.04` distribution은 건드리지 않았고, `wsl -l -v`에서 두 distribution이 독립적으로 보였습니다. 이 분리는 restore test가 original distro state를 조용히 재사용하는 일을 막았습니다.

Chronology는 중요합니다. `wsl --import` 자체는 physical network isolation 전에 수행했습니다. 먼저 restored distro의 기능을 확인한 뒤, 그 restored environment를 물리적으로 network를 끊은 test에 사용했습니다. Import command를 offline에서 다시 실행했다고 주장하지 않습니다.

## 4. 복구된 User와 Research State 확인

Restored distro에는 user `securityon`, UID와 GID `1000`, shell `/bin/bash`, 그리고 예상한 HOME이 있었습니다.

```text
HOME=/home/securityon
```

초기 PowerShell-to-bash command 하나는 PowerShell이 bash보다 먼저 `$HOME`을 expand해 HOME line이 손상된 것처럼 보였습니다. 이후 direct WSL validation에서 restored HOME이 정상임을 확인했습니다. Restore damage가 아니라 shell quoting boundary에서 생긴 symptom이었습니다.

`/home/securityon/research`에는 다음 project가 복구돼 있었습니다.

```text
pytorch-smoke-test
tensorflow-220-smoke-test
tensorflow-nightly-smoke-test
tensorflow-smoke-test
transformers-smoke-test
wsl-research-base
wsl-smoke-test
```

Restored distro는 `/mnt/d/Lab`에도 접근했습니다. 결과는 `User_Home_Restore=PASS`, `Research_Project_Restore=PASS`, `Shared_D_Access=PASS`였습니다.

## 5. Isolation 전 Restore 기능 검증

Workstation의 network를 끊기 전에 restored distro가 Linux-native build toolchain, uv, research Python, Jupyter base, 일치하는 VS Code Server, WSL remote extension, `/dev/dxg`, RTX 5060 access와 project-specific environment를 유지하는지 확인했습니다.

Restored PyTorch project는 PyTorch `2.14.0+cu132`, bundled CUDA runtime `13.2`, CUDA availability `True`, NVIDIA GeForce RTX 5060 Laptop GPU를 보고했습니다. 실제 `2048 x 2048` matrix multiplication은 `cuda:0`에서 `torch.Size([2048, 2048])`로 완료돼 `RESTORED WSL PyTorch CUDA PASS`를 받았습니다.

Restored Transformers project는 `D:\Lab\Models\HuggingFace`를 `/mnt/d/Lab/Models/HuggingFace`로 사용했습니다. `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, `local_files_only=True` 상태에서 `Qwen/Qwen3-0.6B`의 `311 / 311` weight를 모두 load하고 `cuda:0`에서 inference를 완료했습니다. 결과는 `RESTORED WSL Transformers CUDA PASS`였습니다.

한 번의 `uv run`에서는 local `transformers-smoke-test` project package가 millisecond 수준으로 rebuild·reinstall됐습니다. 이는 external download의 evidence가 아닙니다. 이후의 physically disconnected run이 더 강한 근거를 제공했습니다.

## 6. Physical Network Isolation 입증

Workstation을 external network에서 실제로 분리했습니다. Isolation gate에서는 external access 성공을 failure로, blocked access를 기대한 결과로 판단했습니다.

| Connectivity check     | 관찰 상태 | Gate 판정 |
| ---------------------- | --------- | --------- |
| Windows external HTTPS | `BLOCKED` | `PASS`    |
| WSL external network   | `BLOCKED` | `PASS`    |
| PyPI                   | `BLOCKED` | `PASS`    |
| Hugging Face           | `BLOCKED` | `PASS`    |

이 단계에서 workstation에는 사용할 수 있는 external network path가 없었고 `Physical_Network_Isolation=PASS`를 받았습니다. Environment variable로 흉내 낸 offline 상태가 아닙니다. 이후 test의 offline flag는 실제 physical isolation 위에 application-level constraint를 더했습니다.

## 7. Offline WSL Python, Jupyter와 Remote Development 실행

`Ubuntu-26.04-RestoreTest` 안에서 필요한 곳에는 uv `--offline`을 사용하고 research Python `3.12.14`, JupyterLab `4.6.4`, IPython `9.17.1`, ipykernel `7.3.0`을 검증했습니다. 결과는 `Physical_Offline_WSL_Python_Jupyter=PASS`였습니다.

Distro는 `/dev/dxg`와 NVIDIA GeForce RTX 5060 Laptop GPU도 유지해 `Physical_Offline_WSL_GPU_Access=PASS`를 받았습니다. Device visibility는 중간 gate일 뿐이며, 다음 section의 framework workload가 execution evidence를 제공합니다.

External network가 없는 동안 VS Code Remote WSL도 동작했습니다. 이미 설치·보존된 matching server, Python과 Jupyter remote extension layer, project interpreter와 Jupyter kernel을 사용할 수 있었습니다. 결과는 `Physical_Offline_VS_Code_WSL=PASS`, `Physical_Offline_Jupyter=PASS`였습니다.

VS Code Marketplace가 offline에서 동작했다고 주장하지 않습니다. 검증 범위는 이미 설치하고 보존한 remote component를 사용한 workflow입니다.

## 8. Physically Offline PyTorch CUDA 실행

`/home/securityon/research/pytorch-smoke-test`에서 `uv run --offline`으로 restored project를 실행했습니다.

| 확인 항목      | 결과                                  |
| -------------- | ------------------------------------- |
| PyTorch        | `2.14.0+cu132`                        |
| CUDA runtime   | `13.2`                                |
| CUDA available | `True`                                |
| GPU            | NVIDIA GeForce RTX 5060 Laptop GPU    |
| Workload       | `2048 x 2048` matrix multiplication   |
| Output         | `cuda:0`의 `torch.Size([2048, 2048])` |

최종 결과는 `PHYSICAL OFFLINE WSL PyTorch CUDA PASS`였습니다. Restored environment, 차단된 external package access, 명시적인 uv offline mode와 실제 GPU execution을 함께 검증했습니다.

## 9. 공유 Model Store에서 Transformers 실행

Restored Transformers test에는 네 가지 독립적인 constraint를 결합했습니다.

```text
physical network isolation
uv run --offline
HF_HUB_OFFLINE=1 and TRANSFORMERS_OFFLINE=1
local_files_only=True
```

`Qwen/Qwen3-0.6B`는 shared Windows model store의 WSL view인 `/mnt/d/Lab/Models/HuggingFace`에서 load됐습니다. `cuda:0`에서 inference가 완료돼 `PHYSICAL OFFLINE WSL Transformers CUDA PASS`를 받았습니다.

Physical isolation은 external fallback이 불가능함을 증명했습니다. uv와 Hugging Face 설정은 도구가 offline path로 명시적으로 제한됐음을, local-files-only loading은 model source를, CUDA inference는 실제 기능 execution을 증명했습니다. 이 control들은 서로 대체하는 것이 아니라 보완합니다.

## 10. TensorFlow Nightly Preview Offline 재검증

Restored TensorFlow nightly project도 물리적으로 network를 끊은 상태에서 실행했습니다. TensorFlow `2.22.0-dev20260923` nightly build(`tf-nightly`)는 RTX 5060을 발견했고, normal GPU matrix multiplication, memory-growth path와 XLA/JIT path를 모두 통과했습니다.

XLA runtime은 다시 project-managed cuDNN을 사용했습니다. WSL system-wide cuDNN package는 없었고, project environment에는 `nvidia-cudnn-cu12 9.26.0.51`이 있었으며 execution은 `Loaded cuDNN version 92600`을 기록했습니다.

Offline test 결과는 `TensorFlow_Nightly_Offline_Preview=PASS`였습니다. 더 넓은 framework 분류는 계속 `TensorFlow_Nightly_GPU_Path=PREVIEW_PASS`이고, `Stable_TensorFlow_GPU_Path=PENDING`입니다. Nightly development build의 성공은 유용한 compatibility evidence이지만 stable, beta 또는 production baseline은 아닙니다.

## 11. External Network 없이 Windows Local AI 사용

같은 physical isolation 동안 Windows-side local AI도 동작했습니다. Ollama는 `qwen3.5:4b` local inference와 다음 localhost API를 모두 통과했습니다.

```text
http://localhost:11434
```

Localhost communication은 external network access가 아닙니다. 결과는 `Physical_Offline_Ollama=PASS`였습니다.

llama.cpp runtime은 기존 local GGUF file로 GPU offload와 local inference를 완료해 `Physical_Offline_llama.cpp=PASS`를 받았습니다. 이 test에는 `-hf` retrieval path를 사용했다고 기록하지 않습니다. Local model file을 직접 선택하는 것이 offline validation boundary의 일부였습니다.

## 12. Wheelhouse에서 PyTorch 재구축

동작 중인 environment를 재사용하지 않고 다음 위치에 완전히 새로운 Windows project를 만들었습니다.

```text
D:\Lab\Research\pytorch-physical-offline-test
```

기존 project `.venv`는 사용하지 않았습니다. Workstation이 physically offline인 동안 `--no-index`와 `--find-links`를 사용해 다음 wheelhouse에서 설치했습니다.

```text
D:\Lab\OfflineLab\wheelhouse\pytorch-cu132-py312
```

Fresh environment는 PyTorch `2.14.0+cu132`, 사용 가능한 CUDA와 NVIDIA GeForce RTX 5060 Laptop GPU를 보고했고 실제 CUDA matrix multiplication도 통과했습니다. 결과는 `PHYSICAL OFFLINE PYTORCH WHEELHOUSE PASS`, final baseline에서는 `Physical_Offline_PyTorch_Wheelhouse_Reconstruction=PASS`였습니다.

이 test로 wheelhouse는 저장한 file collection에서 검증된 reconstruction asset으로 바뀌었습니다.

## 13. Transformers 재구축과 Local Inference

두 번째 새 Windows project는 다음 위치에 만들었습니다.

```text
D:\Lab\Research\transformers-physical-offline-test
```

Network가 계속 차단된 상태에서 `--no-index`와 `--find-links`를 사용해 `D:\Lab\OfflineLab\wheelhouse\transformers-py312`에서 설치했습니다. Reconstructed environment에는 PyTorch `2.14.0+cu132`, Transformers `5.17.0`, Accelerate `1.15.0`이 포함됐습니다.

이어 `Qwen/Qwen3-0.6B`가 `D:\Lab\Models\HuggingFace`에서 `311 / 311` weight를 모두 load했고 `cuda:0`에서 inference를 완료했습니다. 결과는 `PHYSICAL OFFLINE TRANSFORMERS WHEELHOUSE PASS`, baseline에서는 `Physical_Offline_Transformers_Wheelhouse_Reconstruction=PASS`였습니다.

하나의 gate에서 fresh package reconstruction, 별도로 관리하는 local model과 실제 CUDA inference를 연결했습니다.

## 14. Original llama.cpp Bundle Restore 실패 발견

Note 6에서는 llama.cpp commit `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`를 `llama.cpp-b29c606.bundle`로 보존했습니다. 당시 `git bundle verify`는 bundle이 complete history를 기록하며 okay라고 보고했습니다. 그것이 당시 사용한 source-preservation standard였습니다.

Note 8에서는 완전히 독립된 repository로 실제 clone을 시도했습니다. 첫 recovery는 다음 error와 함께 실패했습니다.

```text
Could not read d9e03f1074dbd2979126d91dce1b5d304ec8394e
Failed to traverse parents of commit b29c606e28a01b1bc8c1351026a0fa6e616bf6c4
remote did not send all necessary objects
```

Evidence는 두 gate를 분리했습니다.

```text
Earlier_Bundle_Format_Verification=PASS
Earlier_Bundle_Independent_Restore=FAIL
```

이 failure는 Note 6을 고쳐 쓸 이유가 아닙니다. Note 6은 당시 수행한 check를 정확히 기록합니다. End-to-end recovery attempt가 그 check만으로는 이 workflow에 충분하지 않았다는 사실을 발견했습니다.

## 15. Original Repository 조사

특정 Git mechanism을 원인으로 지목하기 전에 `D:\Lab\Research\llama.cpp`를 조사했습니다. `git rev-parse --is-shallow-repository`는 `false`를 반환해 shallow repository가 아니었습니다. `remote.origin.promisor`, `remote.origin.partialclonefilter` configuration, replace ref와 `.git/info/grafts` file도 없었습니다.

누락됐다고 보고된 parent `d9e03f1074dbd2979126d91dce1b5d304ec8394e`는 original repository 안에 존재하는 valid commit이었고, 검증 commit `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`의 ancestor였습니다. Normal traversal과 `--no-replace-objects` traversal은 모두 `96,959` objects를 세었습니다.

Repository integrity도 통과했습니다.

| 확인 항목              | 결과         |
| ---------------------- | ------------ |
| `git fsck --full`      | `PASS`       |
| Objects checked        | `99,090`     |
| Packed repository size | `378.25 MiB` |

Bounded conclusion은 original source repository는 healthy했고 preserved bundle이 independent restore에 불충분했다는 것입니다. Evidence는 더 구체적인 internal Git root cause를 확정하지 않으므로 그 이상은 추측하지 않습니다.

## 16. Replacement Bundle 생성과 Independent Restore

Validated source tag `b10964`는 `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`를 가리킵니다. Troubleshooting을 계속하기 위해 network를 다시 연결한 뒤, failed artifact를 삭제하지 않고 다음 이름으로 격리했습니다.

```text
D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606-failed-restore.bundle
```

이어 exact validated tag에서 새 full bundle을 만들어 current recovery path에 두었습니다.

```text
D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606.bundle
```

Note 6에 기록한 earlier bundle SHA-256은 retained failed-recovery artifact의 값이며 replacement를 식별해서는 안 됩니다. 따라서 그 hash를 current bundle에 재사용하지 않습니다.

Replacement에서 수행한 independent clone은 약 `356.08 MiB`를 transfer하고 `93,839` objects를 복구했습니다. `b10964`를 checkout했으므로 detached HEAD가 됐지만, exact tag 복구에서는 예상한 상태이며 failure가 아닙니다. Restored HEAD는 `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`와 일치했고 `git fsck --full`도 `93,839` objects를 대상으로 통과했습니다.

결과는 `llama.cpp_Source_Recovery=PASS`였습니다. Remote Git repository가 필요 없는 local-file independent clone이었습니다. 다만 corrected bundle의 final clone을 external network가 physically disconnected된 상태에서 다시 수행했다고 주장하지 않습니다.

## 17. Source-recovery Gate 강화

이 failure는 source-preservation criterion을 바꿨습니다. 이 workflow에서는 `git bundle verify`만으로 independent repository recovery를 입증할 수 없었습니다.

더 강한 gate는 다음과 같습니다.

1. source asset을 보존한다.
2. 완전히 별도 location과 repository로 clone한다.
3. 예상한 exact commit을 확인한다.
4. restored repository에서 `git fsck --full`을 실행한다.

Failed bundle을 남겨 두면 이 기준을 강화한 이유도 evidence로 보존됩니다. Correction은 earlier failure를 지우지 않고 recovery history를 재현 가능하게 만듭니다.

## 18. Current Integrity Evidence 갱신

Note 6의 historical `D:\Lab\OfflineLab\manifests\offline-assets-sha256.txt`는 overwrite하지 않았습니다. 대신 intentionally preserved OfflineLab root의 current manifest를 만들었습니다.

```text
D:\Lab\OfflineLab\manifests\offline-assets-sha256-20260925.txt
Size: 348,657 bytes
```

Disposable cache는 계속 제외했습니다. Model도 OfflineLab 밖에 두고 별도 manifest를 생성했습니다.

```text
D:\Lab\OfflineLab\manifests\model-assets-sha256-20260925.txt
Size: 5,623 bytes
Model root: D:\Lab\Models
```

Historical manifest는 기록 당시 evidence의 snapshot으로 유지합니다. 새 manifest는 earlier record를 retroactively change하지 않고 더 강해진 later state를 설명합니다.

## 19. Offline 상태에서 Persistence 검증

앞선 physical isolation 단계에서 llama.cpp 문제를 해결하기 위해 network를 다시 연결하기 전에 WSL environment를 shutdown하고 restart했습니다. Restart 뒤 RTX 5060 access와 PyTorch CUDA workload가 다시 통과했습니다.

결과는 `Physical_Offline_Persistence=PASS`였습니다. 이는 또 한 번의 Windows reboot test보다 좁은 범위이며, 관찰하지 않은 timing이나 추가 restart evidence를 붙이지 않습니다. Physically offline WSL과 GPU path가 WSL shutdown과 restart 뒤에도 유지됨을 증명합니다.

## 20. End-to-End Baseline 기록

Final validation baseline은 다음 위치에 기록했습니다.

```text
D:\Lab\OfflineLab\manifests\offline-end-to-end-validation-baseline.txt
```

관찰한 크기는 `6,875` bytes였습니다. Note 8 완료 시 `D:\Lab\OfflineLab\manifests`에는 `24` files가 있었고, Note 7 완료 시점에는 `21` files였습니다. Earlier Note 6과 Note 7 count는 고쳐 쓸 값이 아니라 historical snapshot으로 남깁니다.

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

`End_to_End_Offline_Research_Environment=PASS`와 `Stable_TensorFlow_GPU_Path=PENDING`은 동시에 성립합니다. Stable TensorFlow는 secondary compatibility path이며 여기서 검증한 primary workflow의 gate가 아닙니다.

## 21. Windows Workstation 구축 Series 마무리

Windows research workstation은 primary research workflow를 대상으로 end-to-end offline validation을 통과했습니다. 검증 범위에는 physical network isolation, restored WSL, Python과 uv, Jupyter, VS Code Remote WSL, PyTorch CUDA, Transformers CUDA, shared local model, Ollama, llama.cpp local GGUF inference, explicit wheelhouse에서의 fresh reconstruction, independent source recovery, current checksum evidence와 offline persistence가 포함됩니다.

가장 가치 있는 결과는 중단 없는 PASS 목록이 아니었습니다. 첫 llama.cpp bundle은 format verification을 통과했지만 실제 independent restore에 실패했습니다. Original repository는 healthy했고 preservation artifact가 약한 지점이었으며, exact validated tag에서 rebuild해 recoverable local bundle을 만들었습니다. End-to-end validation은 준비 단계에서 세운 assumption을 의도적으로 깨뜨려 보고, 실패한 gate를 강화하는 역할을 했습니다.

마지막 구분은 다음과 같습니다.

```text
End-to-End Offline Research Environment = PASS
Stable TensorFlow GPU Path = PENDING
TensorFlow Nightly GPU Path = PREVIEW PASS
```

이는 workstation이 앞으로 Internet access를 전혀 필요로 하지 않는다는 뜻도, 모든 AI 또는 development framework를 offline에서 검증했다는 뜻도 아닙니다. 시험한 조건 아래에서 primary research environment가 external network 없이 동작하고, 중요한 workflow를 명시적으로 보존한 local asset으로 재구축할 수 있다는 좁고 검증된 결론입니다.

이번 Note는 Windows research workstation construction series의 마지막 validation 기록입니다. 남은 follow-up은 TensorFlow `2.22` stable 공식 release 뒤의 재검증이며, MacBook research environment는 별도의 후속 project에 속합니다.
