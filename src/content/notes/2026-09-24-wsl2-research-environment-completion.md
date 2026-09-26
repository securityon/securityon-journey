---
title: "WSL2를 실제 Linux 연구환경으로 완성하기"
description: "동작하는 WSL GPU 경로를 Linux native build tool, 격리된 Python, Jupyter, Remote WSL, CUDA workflow, 공유 model과 reboot 검증을 갖춘 실제 연구환경으로 완성합니다."
lang: ko
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

「제한망 연구용 Offline Asset 기반 구축」은 `WSL_Research_Workflow=DEFERRED_TO_NOTE_7`으로 끝났습니다. WSL2는 이미 Ubuntu startup, `/dev/dxg`, NVIDIA GPU access, PyTorch CUDA, GPU benchmark와 일치하는 VS Code Server 연결을 통과했습니다. 모두 유효한 결과였지만, 초기 architecture가 의도한 독립적인 Linux 연구환경보다는 WSL GPU compute path를 검증한 상태였습니다.

그 차이를 드러낸 evidence는 작았습니다. Offline asset 준비 중 `~/.vscode-server/extensions/extensions.json`을 확인하자 `[]`가 반환됐습니다. Server는 있었지만 remote Python과 Jupyter layer는 없었습니다. 이미 범위가 넓어진 Note 6에 이 작업을 억지로 넣거나 이전 구현을 완전했던 것처럼 고쳐 쓰지 않고, 누락을 그대로 남겼습니다.

이번 단계는 그 간격을 닫습니다. 완료 기준은 package 존재가 아닙니다. Linux-native development, 격리된 Python project, Jupyter, VS Code Remote WSL, project별 interpreter, GPU framework, 공유 model asset과 reboot persistence를 잇는 실제 workflow입니다. 물리적 network isolation은 Note 8의 별도 end-to-end gate로 남겨 둡니다.

## 1. GPU Access 너머의 환경 정의

출발 platform은 kernel `6.18.33.2-microsoft-standard-WSL2`, architecture `x86_64` 위의 Ubuntu `26.04.1 LTS` (`resolute`)였고 user는 `securityon`이었습니다. Linux research root는 `/home/securityon/research`, `D:\Lab` 아래 Windows research asset은 `/mnt/d/Lab`에서 접근했습니다. Git version은 `2.53.0`이었습니다.

GPU path에서는 `/dev/dxg`를 통해 `8151 MiB` VRAM의 NVIDIA GeForce RTX 5060 Laptop GPU가 보였습니다. Windows는 KMD `616.92`를, WSL의 `nvidia-smi`는 `615.71.08`과 CUDA UMD `13.4`를 보고했습니다. 서로 다른 이 문자열은 WSL GPU architecture 안에서 보이는 값이지, 독립적인 Linux display driver가 따로 있다는 evidence가 아닙니다. WSL은 계속 Windows NVIDIA driver path에 의존합니다.

VS Code `1.138.0`과 WSL Server의 commit은 다음 값으로 일치했습니다.

```text
7debcd0e2acdea1c52de81bf9ee1620444407dda
```

Platform boundary는 건전했지만, 완성된 연구환경이 되려면 자체 build tool, runtime 분리, editor-side capability, project environment와 workflow-level validation이 더 필요했습니다.

## 2. 잘못 보인 uv Inventory 수정

첫 inventory는 Windows PowerShell에서 `wsl.exe bash`로 간접 실행했습니다. 이 non-login, non-interactive shell에서는 `uv`가 없는 것으로 보였습니다. 이미 앞선 WSL project에서 uv를 성공적으로 사용한 사실과 맞지 않는 결과였습니다.

Interactive WSL session에서 실제 research shell 상태를 확인했습니다.

```text
PATH includes: /home/securityon/.local/bin
uv: /home/securityon/.local/bin/uv
uv version: 0.12.17
```

첫 관찰은 software installation state가 아니라 해당 invocation의 `PATH`를 설명한 것이었습니다. PowerShell-to-bash inventory에는 quoting과 CRLF friction도 일부 있어, diagnostic path 자체가 관찰 결과를 바꿀 수 있다는 점을 다시 확인했습니다.

이 수정은 uv에만 해당하지 않습니다. 한 shell context의 “command not found”를 곧바로 “설치되지 않음”으로 바꿔 기록해서는 안 됩니다. Diagnostic symptom을 inventory fact로 확정하기 전에 shell mode, profile loading, environment inheritance와 quoting boundary를 확인해야 합니다.

## 3. Linux-native Build Toolchain 추가

수정한 inventory에서는 Git, Python, uv, GPU access와 VS Code Server는 확인됐지만 `gcc`, `g++`, `make`, `cmake`, `ninja`, `pkg-config`, JupyterLab은 없었습니다. Windows에는 이미 MSVC, CMake, CUDA Toolkit과 Visual Studio Build Tools가 있었지만, 그 도구만으로 WSL이 독립적인 Linux 개발환경이 되는 것은 아닙니다.

WSL native stack을 설치하고 검증했습니다.

| Tool         | 검증 version |
| ------------ | ------------ |
| GCC          | `15.2.0`     |
| G++          | `15.2.0`     |
| GNU Make     | `4.4.1`      |
| CMake        | `4.2.3`      |
| Ninja        | `1.13.2`     |
| `pkg-config` | `2.5.1`      |

결과는 `Linux_Native_Build_Toolchain=PASS`였습니다. 이는 도구를 중복하는 일이 목적이 아닙니다. Linux native project는 WSL boundary 너머의 Windows toolchain에 암묵적으로 의존하지 않고 Linux compiler, header, package metadata와 filesystem semantics를 기준으로 build할 수 있어야 합니다.

## 4. System Python과 Research Python 분리

Ubuntu system Python은 `/usr/bin/python3.14`의 `3.14.4`였습니다. 이 runtime은 distribution 관리 아래 그대로 두었습니다. Research workload에는 uv `0.12.17` (`x86_64-unknown-linux-gnu`)가 관리하는 Python `3.12.14`를 사용하며, path family는 다음과 같습니다.

```text
/home/securityon/.local/share/uv/python/cpython-3.12-linux-x86_64-gnu/
```

Runtime design은 다음처럼 명시적으로 나뉩니다.

```text
Ubuntu system Python 3.14.4
  -> operating system과 distribution이 관리하는 작업

uv-managed research Python 3.12.14
  -> research project runtime

project-specific .venv
  -> dependency isolation
```

이는 더 새로운 system Python을 피하기 위한 workaround가 아니라 architecture choice입니다. Ubuntu Python을 교체하거나 downgrade하면 research compatibility와 distribution 내부 dependency가 결합됩니다. 별도로 관리하는 research runtime은 OS가 자체 interpreter의 ownership을 유지하면서 각 project가 검증된 Python line을 사용할 수 있게 합니다.

## 5. WSL Jupyter Research Base 구성

공통 interactive research tooling을 위한 전용 base로 `/home/securityon/research/wsl-research-base`를 만들었습니다. 다음 위치의 uv-managed Python `3.12.14`를 사용합니다.

```text
/home/securityon/research/wsl-research-base/.venv
```

검증한 interactive stack은 다음과 같습니다.

| Component  | Version   |
| ---------- | --------- |
| Python     | `3.12.14` |
| JupyterLab | `4.6.4`   |
| IPython    | `9.17.1`  |
| ipykernel  | `7.3.0`   |

VS Code Remote WSL로 project를 열고 `/home/securityon/research/wsl-research-base/.venv/bin/python`을 interpreter와 kernel로 선택했습니다. Notebook은 Python `3.12.14`, 바로 그 executable과 다음 platform을 보고했습니다.

```text
Linux-6.18.33.2-microsoft-standard-WSL2-x86_64-with-glibc2.43
```

결과는 `Jupyter WSL kernel PASS`였습니다. Jupyter package 설치 자체가 gate가 아니라, 의도한 project interpreter를 선택하고 remote environment 안에서 kernel을 실제로 실행하는 것이 gate였습니다.

## 6. WSL Remote Extension Layer 구성

이번 단계 전에는 WSL extension manifest가 비어 있었습니다. Remote extension host를 구성한 뒤 실제 final state를 확인했습니다.

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

최종 count는 `9`였습니다. Jupyter extension을 설치하는 과정에서 관련 helper extension도 remote host에 함께 들어왔으므로, 아홉 개를 모두 하나씩 수동 설치했다고 기록하지 않습니다. Remote - WSL extension 자체는 Windows/local side에 남으며 이 remote count에 포함하지 않습니다.

결과는 `VS_Code_Remote_Extension_Layer=PASS`였습니다. VS Code Server connectivity와 remote extension availability는 서로 다른 상태입니다. 전자는 이전에 통과했지만 후자는 여전히 비어 있었습니다.

## 7. Workspace Trust Gate 발견

Python extension이 WSL에 설치된 뒤에도 처음에는 `Python: Select Interpreter` command를 사용할 수 없었습니다. Extension UI에는 `Enable (Workspace)`가 보였고 VS Code window는 `Restricted Mode`였습니다. 따라서 command 부재는 또 다른 설치 실패의 evidence가 아니었습니다.

Research workspace를 신뢰한 뒤 Python extension을 사용할 수 있었고 project interpreter도 정상적으로 선택했습니다. 이 과정에서 서로 독립적인 세 상태가 드러났습니다.

1. extension file이 설치돼 있다.
2. workspace에서 extension이 enable돼 있다.
3. Workspace Trust가 runtime feature를 허용한다.

Installed는 enabled와 같지 않고, enabled는 trusted와 같지 않습니다. Recovery evidence에서 이 구분은 중요합니다. Extension inventory가 정확해도 editor security state가 예상 command를 제한할 수 있습니다. 이 경로를 해결한 결과는 `Workspace_Trust=PASS`였습니다.

## 8. VS Code에서 기존 PyTorch Project 재검증

기존 `/home/securityon/research/pytorch-smoke-test` project에는 이미 WSL compute test가 있었습니다. 이제 완성되고 trusted 상태인 editor workflow로 VS Code Remote WSL에서 다시 열고 다음 interpreter를 선택했습니다.

```text
/home/securityon/research/pytorch-smoke-test/.venv/bin/python
```

Project는 Python `3.12.14`, PyTorch `2.14.0+cu132`, bundled CUDA runtime `13.2`, `torch.cuda.is_available()`의 `True`, NVIDIA GeForce RTX 5060 Laptop GPU를 보고했습니다. 실제 `2048 x 2048` matrix multiplication은 `cuda:0`에서 `torch.Size([2048, 2048])` shape로 완료됐습니다.

결과는 `VS Code WSL PyTorch CUDA PASS`였습니다. 검증한 chain은 이전 compute test보다 넓어졌습니다.

```text
VS Code Remote WSL
  -> trusted workspace
  -> Python extension
  -> project-specific uv .venv
  -> PyTorch
  -> RTX 5060
  -> actual CUDA workload
```

Device detection에서 추론한 것이 아니라 workflow level에서 `PyTorch_CUDA_Research_Workflow=PASS`를 닫았습니다.

## 9. WSL Transformers Project 생성

Workstation에는 Windows `transformers-smoke-test`가 있었지만 대응하는 WSL project는 없었습니다. `/home/securityon/research/transformers-smoke-test`를 새로 만들고 Python `3.12`와 다음 dependency를 선언했습니다.

```text
accelerate==1.15.0
safetensors>=0.8.0
torch==2.14.0+cu132
torchvision==0.29.0+cu132
transformers==5.17.0
```

Project metadata에는 PyTorch source를 명시적으로 유지했습니다.

```toml
[tool.uv.sources]
torch = { index = "pytorch" }
torchvision = { index = "pytorch" }

[[tool.uv.index]]
name = "pytorch"
url = "https://download.pytorch.org/whl/cu132"
```

이 provenance를 일반적인 PyPI dependency로 줄여 쓸 수는 없습니다. 전용 cu132 index는 검증한 build를 식별하는 정보의 일부입니다. `torch`, `transformers`, `accelerate`, `safetensors` import가 통과했고, environment는 PyTorch `2.14.0+cu132`, Transformers `5.17.0`, Accelerate `1.15.0`, 사용 가능한 CUDA와 RTX 5060을 보고했습니다.

## 10. 공유 Windows Model Store 재사용

기존 Hugging Face store는 `D:\Lab\Models\HuggingFace`에 유지했고 WSL에서는 `/mnt/d/Lab/Models/HuggingFace`로 접근했습니다. `Qwen/Qwen3-0.6B`를 Linux filesystem에 복제하지 않았습니다. Validation에는 다음 설정을 사용했습니다.

```text
HF_HUB_CACHE=/mnt/d/Lab/Models/HuggingFace
HF_HUB_OFFLINE=1
TRANSFORMERS_OFFLINE=1
local_files_only=True
```

Tokenizer와 model은 local D: cache에서 load됐고 `311 / 311` weight가 모두 load된 뒤 `cuda:0`에서 inference가 완료됐습니다. 완성된 path는 다음과 같습니다.

```text
D:\Lab\Models\HuggingFace
  -> /mnt/d/Lab/Models/HuggingFace
  -> WSL Python 3.12
  -> Transformers 5.17.0
  -> PyTorch 2.14.0+cu132
  -> RTX 5060 cuda:0
```

최종 결과는 `WSL Transformers offline CUDA inference PASS`와 `Shared_Windows_WSL_Model_Store=PASS`였습니다. Model root를 공유하면 multi-GB Windows copy와 WSL copy를 별도로 유지하지 않아도 됩니다.

이는 library-level network lookup을 막고 local asset만 요구한 offline-mode validation입니다. 물리적으로 network를 분리한 test는 아니며, 그 단계는 Note 8에 남아 있습니다.

## 11. Triton Warning을 과장 없이 기록

WSL Transformers inference 중 Triton이 NVIDIA 관련 helper code를 compile하면서 `_POSIX_C_SOURCE redefined` warning을 출력했습니다. Warning 뒤에도 model이 load됐고 GPU는 사용 가능했으며 inference가 끝까지 완료돼 `cuda:0`과 최종 PASS가 출력됐습니다.

따라서 다음처럼 기록했습니다.

```text
Triton_Compile_Warning=OBSERVED
Functional_Impact=None observed
```

Evidence가 뒷받침하는 범위는 header 또는 macro redefinition warning과 성공한 workload입니다. 더 깊은 root cause를 단정할 근거는 없으며, warning 하나만으로 기능적으로 성공한 결과를 failure로 바꿀 수도 없습니다.

## 12. Project-specific Interpreter Path 검증

앞서 `wsl-research-base`의 `.ipynb`와 kernel path를 검증해 general Jupyter Research Workflow를 확인했습니다. Project-specific Transformers evidence는 별도의 notebook kernel session이 아니라, 선택한 project `.venv`의 Python interactive environment에서 얻었습니다.

```text
wsl-research-base
  -> 검증된 .ipynb와 kernel workflow

transformers-smoke-test의 project-specific uv environment
  -> 선택한 interpreter와 실제 project dependency
```

Transformers project environment는 선택한 project `.venv`와 Python interactive environment를 통해 PyTorch `2.14.0+cu132`, Transformers `5.17.0`, CUDA `True`, NVIDIA GeForce RTX 5060 Laptop GPU를 보고했습니다.

이로써 `Project_Specific_Venv=PASS`와 `Project_Python_CUDA=PASS`를 확인했습니다. General Jupyter Research Workflow는 Section 5에서 검증한 `wsl-research-base`의 실제 `.ipynb`와 kernel 결과를 근거로 계속 `PASS`입니다.

## 13. Stable TensorFlow 결과는 DEFERRED 유지

TensorFlow는 secondary WSL framework path이며 primary research environment 완료의 gate는 아닙니다. 앞서 조사한 stable-version evidence를 그대로 유지했습니다.

| Version             | Installation | GPU discovery | GPU execution |
| ------------------- | ------------ | ------------- | ------------- |
| TensorFlow `2.21.0` | `PASS`       | `FAIL`        | 도달하지 못함 |
| TensorFlow `2.20.0` | `PASS`       | `PASS`        | `FAIL`        |

`2.21.0`에는 NVIDIA library와 `ptxas` remediation을 적용했지만 GPU discovery가 계속 실패했습니다. `2.20.0`에서는 Compute Capability `12.0`으로 RTX 5060이 나타났지만 실제 execution은 먼저 `CUDA_ERROR_INVALID_PTX`, 이어서 `CUDA_ERROR_INVALID_HANDLE`로 실패했습니다.

따라서 stable 결과는 계속 `Stable_TensorFlow_GPU_Path=DEFERRED`입니다. GPU discovery와 GPU execution은 별도 gate이며, package 설치나 보이는 device만으로 usable framework path를 확정할 수 없습니다.

## 14. TensorFlow Nightly Preview Path 입증

TensorFlow `2.22.0-dev20260923` nightly development build(`tf-nightly`)도 시험했습니다. 결과는 materially 달랐습니다. RTX 5060을 발견하고 Compute Capability `12.0a`를 보고했으며, 일반 `2048 x 2048` GPU matrix multiplication이 통과했습니다.

첫 성공 run에서는 큰 CUDA allocation을 여러 번 시도하면서 out-of-memory warning이 나타났지만 workload 자체는 완료됐습니다. 이어 memory growth를 enable했습니다. 같은 `2048 x 2048` matrix multiplication이 다시 통과했고 앞서 보였던 큰 pre-allocation warning은 나타나지 않았습니다.

두 번째 gate로 `@tf.function(jit_compile=True)`를 적용한 `1024 x 1024` matrix multiplication을 실행했습니다. XLA service가 CUDA용으로 initialise됐고 RTX 5060의 Compute Capability `12.0a`를 보고했으며 cuDNN `9.26.0`을 load한 뒤 다음 log를 남겼습니다.

```text
Compiled cluster using XLA!
```

XLA workload는 `TensorFlow Nightly XLA GPU PASS`로 완료됐습니다. Function을 interactive 또는 standard input에서 정의해 source를 찾을 수 없다는 AutoGraph warning도 있었지만, 이 run에서 관찰된 functional impact는 없었습니다.

정확한 분류는 `TensorFlow_Nightly_GPU_Path=PREVIEW_PASS`입니다. Nightly development build는 향후 compatible path의 가능성을 보여 줄 수 있지만 stable, beta 또는 production baseline은 아닙니다. Stable TensorFlow `2.22`가 공식 release되면 다시 시험한 뒤 stable GPU path 채택 여부를 결정할 계획입니다.

## 15. Project-managed cuDNN 검증

이후 Note를 최종 검토하는 과정에서 cuDNN의 설치 범위를 추가로 확인했습니다. WSL 내부에는 system-wide cuDNN package가 설치돼 있지 않았고, `dpkg -l | grep -i cudnn`은 결과를 반환하지 않았습니다. 그렇다고 TensorFlow에서 cuDNN을 사용할 수 없다는 뜻은 아니었습니다. `/home/securityon/research/tensorflow-nightly-smoke-test` environment에는 `nvidia-cudnn-cu12 9.26.0.51`이 있었고 XLA execution은 `Loaded cuDNN version 92600`을 기록했습니다.

관찰한 상태는 다음과 같습니다.

```text
System_Wide_cuDNN=NOT_INSTALLED
TensorFlow_Project_cuDNN=9.26.0.51
cuDNN_Runtime_Use=VERIFIED
```

이는 Ubuntu가 system component를 관리하고 각 framework project가 Python과 GPU library dependency set을 소유하는 runtime architecture와 맞습니다. System package query와 project runtime inventory는 서로 다른 질문에 답합니다.

## 16. Windows Reboot 뒤 재검증

환경을 완성한 뒤 Windows를 reboot하고 WSL startup, Ubuntu release와 kernel, Linux build toolchain, uv, research Python, Jupyter base, `/dev/dxg`, RTX 5060 access, 일치하는 VS Code Server, 아홉 개 remote extension, PyTorch CUDA workflow와 Transformers local-model workflow를 다시 검증했습니다.

모든 항목이 restart 뒤에도 통과해 `Reboot_Persistence=PASS`를 받았습니다. 일시적인 shell state, 한 session에서만 살아 있는 editor connection 또는 복구되지 않는 mount에 의존하는 research workflow라면 reboot 전 한 번 동작한 것만으로 complete라고 할 수 없습니다.

## 17. WSL Research Baseline 기록

WSL research environment와 reboot persistence validation을 마친 시점의 baseline은 다음 file에 기록했습니다.

```text
D:\Lab\OfflineLab\manifests\wsl-research-baseline.txt
```

WSL path는 다음과 같습니다.

```text
/mnt/d/Lab/OfflineLab/manifests/wsl-research-baseline.txt
```

Baseline 기록 시점에 `D:\Lab\OfflineLab\manifests`에는 `21` files가 있었습니다. 이 수치는 다른 시점에 기록한 Note 6의 earlier snapshot을 대체하지 않습니다. 증가는 이전 기록에서 지워야 할 discrepancy가 아니라 inventory가 변화한 이력을 보여 주는 의도적인 evidence입니다.

이 manifest는 당시 WSL research baseline과 stable TensorFlow의 `DEFERRED` 상태를 기록합니다. TensorFlow nightly 결과는 그 뒤에 수행해 이 Note에 포함한 follow-up evidence이며, historical baseline manifest를 나중 결과에 맞춰 retroactively rewrite하지 않았습니다.

## 18. Completion Gate 검토

Note 7 final state는 historical baseline 뒤의 TensorFlow nightly follow-up까지 포함하면서, 완성된 primary environment와 남아 있는 stable TensorFlow limitation을 구분합니다.

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

TensorFlow stable GPU gap은 primary WSL research environment를 정의하는 Linux build, Python, Jupyter, PyTorch, Transformers, shared model과 editor workflow의 성공을 무효화하지 않습니다. 반대로 nightly 성공이 stable gap을 없애지도 않습니다. 두 상태를 함께 남겨야 current baseline과 forward-looking compatibility evidence의 차이가 보존됩니다.

## 19. Compute Path에서 Research Environment로

WSL2는 검증된 GPU compute path에서 실제로 사용할 수 있는 Linux 연구환경으로 발전했습니다. 이제 Linux-native build tool, 격리된 research Python, Jupyter, 구성된 VS Code remote extension layer, trusted research workspace, project-specific uv environment, PyTorch CUDA, Transformers CUDA, 공유 local-model access와 reboot persistence를 갖췄습니다.

가장 중요한 수정은 package version 변경이 아니었습니다. Shell context가 inventory 결과를 바꿨고, server 존재는 remote extension을 뜻하지 않았으며, extension 설치는 enablement나 Workspace Trust를 보장하지 않았습니다. 검출된 GPU는 execution 성공을 뜻하지 않았고, system-wide cuDNN package가 없다는 사실도 project-managed runtime에 cuDNN이 없다는 뜻이 아니었습니다. 실제 path를 시험하면서 각각의 ambiguity를 해결했습니다.

마지막 상태는 다음과 같습니다.

```text
WSL2 Research Environment = PASS
Stable TensorFlow GPU Path = DEFERRED
TensorFlow Nightly GPU Path = PREVIEW PASS
```

`tf-nightly 2.22.0-dev20260923` 결과는 RTX 5060 discovery, 일반 GPU execution, memory-growth execution, XLA/JIT execution과 project-managed cuDNN `9.26` 사용을 보여 줍니다. 그러나 이는 preview evidence이지 stable baseline이 아닙니다.

전체 workstation은 아직 물리적으로 network를 분리한 end-to-end validation을 통과하지 않았습니다. Note 6에서 발견한 간격을 final gate 전에 닫은 것이 이번 단계의 가치였습니다. Note 8에서는 physical network isolation 아래 end-to-end offline research environment validation을 수행합니다.
