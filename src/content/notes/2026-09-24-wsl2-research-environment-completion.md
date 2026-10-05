---
title: "WSL2를 실제 Linux 연구환경으로 완성하기"
description: "WSL2에 Linux 빌드 도구, 격리된 Python, Jupyter와 Remote WSL 확장을 구성했습니다. 프로젝트별 CUDA 실행, 모델 공유와 재부팅 후 동작을 검증합니다."
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

「오프라인 연구 자산 구축」은 `WSL_Research_Workflow=DEFERRED_TO_NOTE_7`으로 끝났습니다. WSL2에서는 Ubuntu 기동, `/dev/dxg`, NVIDIA GPU 접근, PyTorch CUDA, GPU 벤치마크와 VS Code Server 연결을 검증했습니다. 독립적인 Linux 연구환경을 갖추려면 실제 연구 작업에 필요한 구성을 더해야 했습니다.

오프라인 자산 준비 중 `~/.vscode-server/extensions/extensions.json`을 확인하자 `[]`가 반환됐습니다. 서버는 있었지만 원격 Python·Jupyter 확장이 없었습니다. Note 6에는 이 미완성 상태를 기록하고 후속 작업으로 남겼습니다.

이번에는 Linux 개발 도구, 격리된 Python 프로젝트, Jupyter, VS Code Remote WSL, 프로젝트별 인터프리터, GPU 프레임워크와 공유 모델을 구성하고 재부팅 후에도 동작하는지 검증합니다. 네트워크를 실제로 분리하는 전체 환경 시험은 Note 8에서 수행할 예정입니다.

## 1. GPU 접근과 연구환경 구성

출발 환경은 커널 `6.18.33.2-microsoft-standard-WSL2`, 아키텍처 `x86_64`의 Ubuntu `26.04.1 LTS` (`resolute`)였고 사용자는 `securityon`이었습니다. Linux 연구 디렉터리는 `/home/securityon/research`이며, `D:\Lab`의 Windows 연구 자산에는 `/mnt/d/Lab`으로 접근했습니다. Git 버전은 `2.53.0`이었습니다.

`/dev/dxg`를 통해 VRAM `8151 MiB`의 NVIDIA GeForce RTX 5060 Laptop GPU를 확인했습니다. Windows는 KMD `616.92`를, WSL의 `nvidia-smi`는 `615.71.08`과 CUDA UMD `13.4`를 보고했습니다. 이 값들은 WSL GPU 구조에서 관찰한 표기입니다. WSL은 별도의 Linux 디스플레이 드라이버 대신 Windows NVIDIA 드라이버 경로를 계속 사용합니다.

VS Code `1.138.0`과 WSL Server의 커밋은 다음 값으로 일치했습니다.

```text
7debcd0e2acdea1c52de81bf9ee1620444407dda
```

이 상태에 Linux 빌드 도구, 분리된 런타임, 편집기 확장과 프로젝트 환경을 추가하고 실제 작업으로 검증할 필요가 있었습니다.

## 2. uv 설치 상태 재확인

첫 목록 조사는 Windows PowerShell에서 `wsl.exe bash`를 간접 실행해 수행했습니다. 비로그인·비대화형 셸에서는 `uv`가 없는 것으로 보였는데, 앞선 WSL 프로젝트에서 uv를 사용한 결과와 맞지 않았습니다.

대화형 WSL 세션에서 실제 연구용 셸의 상태를 확인했습니다.

```text
PATH includes: /home/securityon/.local/bin
uv: /home/securityon/.local/bin/uv
uv version: 0.12.17
```

첫 결과는 설치 여부보다 해당 실행 방식의 `PATH`를 반영한 것이었습니다. PowerShell에서 bash를 호출하는 과정에는 따옴표 처리와 CRLF 문제도 있어 진단 명령의 실행 방식부터 확인해야 했습니다.

한 셸에서 명령을 찾지 못했다면 셸 모드, 프로필 로딩, 환경 변수 상속과 따옴표 처리를 확인한 뒤 설치 상태를 판단해야 합니다.

## 3. Linux 빌드 도구 추가

다시 조사한 목록에는 Git, Python, uv, GPU 접근과 VS Code Server가 확인됐지만 `gcc`, `g++`, `make`, `cmake`, `ninja`, `pkg-config`, JupyterLab은 없었습니다. Windows에는 MSVC, CMake, CUDA Toolkit과 Visual Studio Build Tools가 있었고, WSL에는 Linux용 도구를 별도로 구성해야 했습니다.

WSL용 도구를 설치하고 검증했습니다.

| Tool         | 검증 version |
| ------------ | ------------ |
| GCC          | `15.2.0`     |
| G++          | `15.2.0`     |
| GNU Make     | `4.4.1`      |
| CMake        | `4.2.3`      |
| Ninja        | `1.13.2`     |
| `pkg-config` | `2.5.1`      |

결과는 `Linux_Native_Build_Toolchain=PASS`였습니다. Linux 프로젝트가 자체 컴파일러, 헤더, 패키지 메타데이터와 파일시스템을 사용해 빌드할 기반을 마련했습니다.

## 4. 시스템 Python과 연구용 Python 분리

Ubuntu 시스템 Python은 `/usr/bin/python3.14`의 `3.14.4`였으며 배포판 관리 아래 그대로 뒀습니다. 연구에는 uv `0.12.17` (`x86_64-unknown-linux-gnu`)가 관리하는 Python `3.12.14`를 사용합니다. 해당 경로는 다음과 같습니다.

```text
/home/securityon/.local/share/uv/python/cpython-3.12-linux-x86_64-gnu/
```

런타임 구성은 다음처럼 명시적으로 나뉩니다.

```text
Ubuntu system Python 3.14.4
  -> operating system과 distribution이 관리하는 작업

uv-managed research Python 3.12.14
  -> research project runtime

project-specific .venv
  -> dependency isolation
```

Ubuntu Python을 교체하거나 낮추면 연구용 패키지의 호환성이 배포판 내부 의존성과 얽힐 수 있습니다. 연구 런타임을 별도로 관리해 OS는 자체 인터프리터를 유지하고 각 프로젝트는 검증한 Python 버전을 사용하도록 했습니다.

## 5. WSL Jupyter 기본 환경 구성

공통 대화형 연구 도구를 위한 환경으로 `/home/securityon/research/wsl-research-base`를 만들었습니다. 다음 가상환경에서 uv가 관리하는 Python `3.12.14`를 사용합니다.

```text
/home/securityon/research/wsl-research-base/.venv
```

검증한 대화형 환경 구성은 다음과 같습니다.

| Component  | Version   |
| ---------- | --------- |
| Python     | `3.12.14` |
| JupyterLab | `4.6.4`   |
| IPython    | `9.17.1`  |
| ipykernel  | `7.3.0`   |

VS Code Remote WSL로 프로젝트를 열고 `/home/securityon/research/wsl-research-base/.venv/bin/python`을 인터프리터와 커널로 선택했습니다. Notebook에서 Python `3.12.14`, 해당 실행 파일과 다음 플랫폼 정보를 확인했습니다.

```text
Linux-6.18.33.2-microsoft-standard-WSL2-x86_64-with-glibc2.43
```

지정한 프로젝트 인터프리터로 원격 환경의 커널을 실행한 결과는 `Jupyter WSL kernel PASS`였습니다.

## 6. WSL 원격 확장 구성

비어 있던 WSL 확장 목록에 원격 확장을 구성한 뒤 최종 상태를 확인했습니다.

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

최종 개수는 `9`였습니다. Jupyter 확장을 설치하면서 관련 보조 확장도 원격 호스트에 함께 설치됐습니다. 아홉 개를 각각 수동 설치한 것은 아닙니다. Remote - WSL 확장 자체는 Windows 쪽에 있으며 이 개수에서 제외했습니다.

이전의 VS Code Server 연결 검증에 이어 `VS_Code_Remote_Extension_Layer=PASS`를 확인했습니다.

## 7. 작업 공간 신뢰 설정

Python 확장이 WSL에 설치된 뒤에도 처음에는 `Python: Select Interpreter` 명령을 사용할 수 없었습니다. 확장 UI에는 `Enable (Workspace)`가 표시됐고 VS Code 창은 `Restricted Mode`였습니다.

연구 작업 공간을 신뢰하도록 설정한 뒤 Python 확장과 프로젝트 인터프리터 선택 기능을 사용할 수 있었습니다. 다음 세 상태를 구분해 확인했습니다.

1. 확장 파일이 설치돼 있다.
2. 작업 공간에서 확장이 활성화돼 있다.
3. Workspace Trust가 실행 기능을 허용한다.

확장 목록이 맞더라도 편집기의 보안 상태에 따라 명령이 제한될 수 있습니다. 신뢰 설정을 마친 뒤 `Workspace_Trust=PASS`로 기록했습니다.

## 8. VS Code에서 PyTorch 프로젝트 재검증

기존 `/home/securityon/research/pytorch-smoke-test`에는 WSL 연산 시험이 있었습니다. 원격 확장과 신뢰 설정을 마친 VS Code Remote WSL에서 프로젝트를 다시 열고 다음 인터프리터를 선택했습니다.

```text
/home/securityon/research/pytorch-smoke-test/.venv/bin/python
```

프로젝트는 Python `3.12.14`, PyTorch `2.14.0+cu132`, 포함된 CUDA 런타임 `13.2`, `torch.cuda.is_available()`의 `True`, NVIDIA GeForce RTX 5060 Laptop GPU를 보고했습니다. `2048 x 2048` 행렬곱은 `cuda:0`에서 `torch.Size([2048, 2048])` 형태로 완료됐습니다.

결과는 `VS Code WSL PyTorch CUDA PASS`였습니다. 이번에는 편집기에서 실제 CUDA 연산까지 다음 경로를 검증했습니다.

```text
VS Code Remote WSL
  -> trusted workspace
  -> Python extension
  -> project-specific uv .venv
  -> PyTorch
  -> RTX 5060
  -> actual CUDA workload
```

이를 근거로 `PyTorch_CUDA_Research_Workflow=PASS`를 기록했습니다.

## 9. WSL Transformers 프로젝트 생성

Windows에는 `transformers-smoke-test`가 있었지만 대응하는 WSL 프로젝트는 없었습니다. `/home/securityon/research/transformers-smoke-test`를 새로 만들고 Python `3.12`와 다음 의존성을 선언했습니다.

```text
accelerate==1.15.0
safetensors>=0.8.0
torch==2.14.0+cu132
torchvision==0.29.0+cu132
transformers==5.17.0
```

프로젝트 메타데이터에는 PyTorch 소스를 명시적으로 유지했습니다.

```toml
[tool.uv.sources]
torch = { index = "pytorch" }
torchvision = { index = "pytorch" }

[[tool.uv.index]]
name = "pytorch"
url = "https://download.pytorch.org/whl/cu132"
```

전용 cu132 인덱스는 검증한 빌드를 식별하는 정보이므로 프로젝트 설정에 유지했습니다. `torch`, `transformers`, `accelerate`, `safetensors` import가 통과했고, 환경은 PyTorch `2.14.0+cu132`, Transformers `5.17.0`, Accelerate `1.15.0`, 사용 가능한 CUDA와 RTX 5060을 보고했습니다.

## 10. Windows 모델 저장소 공유

Hugging Face 저장소는 `D:\Lab\Models\HuggingFace`에 유지하고 WSL에서 `/mnt/d/Lab/Models/HuggingFace`로 접근했습니다. `Qwen/Qwen3-0.6B`를 Linux 파일시스템에 복제하지 않고 다음 설정으로 검증했습니다.

```text
HF_HUB_CACHE=/mnt/d/Lab/Models/HuggingFace
HF_HUB_OFFLINE=1
TRANSFORMERS_OFFLINE=1
local_files_only=True
```

토크나이저와 모델을 D:의 로컬 캐시에서 불러왔습니다. 가중치 `311 / 311`개를 모두 불러온 뒤 `cuda:0`에서 추론을 완료했습니다. 실행 경로는 다음과 같습니다.

```text
D:\Lab\Models\HuggingFace
  -> /mnt/d/Lab/Models/HuggingFace
  -> WSL Python 3.12
  -> Transformers 5.17.0
  -> PyTorch 2.14.0+cu132
  -> RTX 5060 cuda:0
```

최종 결과는 `WSL Transformers offline CUDA inference PASS`와 `Shared_Windows_WSL_Model_Store=PASS`였습니다. Windows와 WSL이 같은 저장소를 사용해 수 GB의 모델을 중복 보관하지 않아도 됐습니다.

라이브러리의 네트워크 검색을 막고 로컬 자산만 사용한 오프라인 모드 검증입니다. 네트워크를 실제로 분리하는 시험은 Note 8에 남겨 뒀습니다.

## 11. Triton 컴파일 경고 기록

WSL Transformers 추론 중 Triton이 NVIDIA 관련 보조 코드를 컴파일하면서 `_POSIX_C_SOURCE redefined` 경고를 출력했습니다. 이후 모델 로딩과 GPU 추론은 완료됐고 `cuda:0`과 최종 PASS가 출력됐습니다.

따라서 다음처럼 기록했습니다.

```text
Triton_Compile_Warning=OBSERVED
Functional_Impact=None observed
```

헤더 또는 매크로 재정의 경고가 있었지만 시험은 성공했습니다. 더 깊은 원인은 확정하지 못했으며, 관찰한 기능상 영향은 없었습니다.

## 12. 프로젝트별 인터프리터 검증

일반 Jupyter 작업은 앞서 `wsl-research-base`의 `.ipynb`와 커널 경로로 검증했습니다. Transformers 프로젝트는 별도 Notebook 커널 세션이 아니라 선택한 프로젝트 `.venv`의 Python 대화형 환경에서 확인했습니다.

```text
wsl-research-base
  -> 검증된 .ipynb와 kernel workflow

transformers-smoke-test의 project-specific uv environment
  -> 선택한 interpreter와 실제 project dependency
```

선택한 프로젝트 `.venv`의 Python 대화형 환경에서 PyTorch `2.14.0+cu132`, Transformers `5.17.0`, CUDA `True`, NVIDIA GeForce RTX 5060 Laptop GPU를 확인했습니다.

결과는 `Project_Specific_Venv=PASS`와 `Project_Python_CUDA=PASS`였습니다. 일반 Jupyter 작업의 `PASS`는 5절에 기록한 `wsl-research-base`의 `.ipynb`와 커널 검증에 근거합니다.

## 13. Stable TensorFlow 결과는 DEFERRED 유지

TensorFlow는 WSL의 보조 프레임워크 후보로, 주 연구환경 완료의 필수 조건에는 포함하지 않았습니다. 앞서 시험한 stable 버전의 결과를 유지했습니다.

| Version             | Installation | GPU discovery | GPU execution |
| ------------------- | ------------ | ------------- | ------------- |
| TensorFlow `2.21.0` | `PASS`       | `FAIL`        | 도달하지 못함 |
| TensorFlow `2.20.0` | `PASS`       | `PASS`        | `FAIL`        |

`2.21.0`에는 NVIDIA 라이브러리와 `ptxas` 관련 조치를 적용했지만 GPU 식별이 계속 실패했습니다. `2.20.0`은 Compute Capability `12.0`으로 RTX 5060을 식별했지만 실제 연산에서 `CUDA_ERROR_INVALID_PTX`, 이어 `CUDA_ERROR_INVALID_HANDLE`이 발생했습니다.

stable 결과는 계속 `Stable_TensorFlow_GPU_Path=DEFERRED`입니다. 설치, GPU 식별과 실제 연산 결과를 구분해 기록했습니다.

## 14. TensorFlow nightly 검증

TensorFlow `2.22.0-dev20260923` nightly 개발 빌드(`tf-nightly`)도 시험했습니다. RTX 5060을 식별하고 Compute Capability `12.0a`를 보고했으며, 일반 `2048 x 2048` GPU 행렬곱이 통과했습니다.

첫 성공 실행에서는 큰 CUDA 메모리를 여러 번 할당하려다 메모리 부족 경고가 나왔지만 연산은 완료됐습니다. 이어 memory growth를 활성화하자 같은 `2048 x 2048` 행렬곱이 다시 통과했고, 앞서 보였던 큰 메모리 사전 할당 경고는 나타나지 않았습니다.

다음으로 `@tf.function(jit_compile=True)`를 적용한 `1024 x 1024` 행렬곱을 실행했습니다. XLA 서비스가 CUDA용으로 초기화되고 RTX 5060의 Compute Capability `12.0a`를 보고했습니다. cuDNN `9.26.0`을 불러온 뒤 다음 로그를 남겼습니다.

```text
Compiled cluster using XLA!
```

XLA 시험은 `TensorFlow Nightly XLA GPU PASS`로 끝났습니다. 대화형 환경 또는 표준 입력으로 정의한 함수의 소스를 찾을 수 없다는 AutoGraph 경고도 나왔지만, 이번 실행에서 관찰한 기능상 영향은 없었습니다.

판정은 `TensorFlow_Nightly_GPU_Path=PREVIEW_PASS`입니다. 개발 중인 nightly 빌드의 결과이며 stable, beta 또는 운영 기준 상태로 채택한 것은 아닙니다. TensorFlow `2.22` stable 버전이 공식 출시되면 재시험 후 채택 여부를 결정할 계획입니다.

## 15. 프로젝트 내부의 cuDNN 검증

cuDNN이 어느 범위에 설치됐는지도 확인했습니다. WSL에는 시스템 전체에 설치된 cuDNN 패키지가 없었고 `dpkg -l | grep -i cudnn`도 결과를 반환하지 않았습니다. 반면 `/home/securityon/research/tensorflow-nightly-smoke-test` 환경에는 `nvidia-cudnn-cu12 9.26.0.51`이 있었고, XLA 실행에서 `Loaded cuDNN version 92600`을 기록했습니다.

관찰한 상태는 다음과 같습니다.

```text
System_Wide_cuDNN=NOT_INSTALLED
TensorFlow_Project_cuDNN=9.26.0.51
cuDNN_Runtime_Use=VERIFIED
```

Ubuntu는 시스템 구성요소를, 각 프레임워크 프로젝트는 Python과 GPU 라이브러리 의존성을 관리하도록 구성했습니다. 따라서 시스템 패키지와 프로젝트 런타임의 목록을 각각 확인해야 합니다.

## 16. Windows 재부팅 뒤 재검증

Windows를 재부팅하고 WSL 기동, Ubuntu 릴리스와 커널, Linux 빌드 도구, uv, 연구용 Python, Jupyter 기본 환경, `/dev/dxg`, RTX 5060 접근, VS Code Server 버전 일치와 원격 확장 아홉 개를 다시 확인했습니다. PyTorch CUDA 연산과 Transformers 로컬 모델 실행도 재검증했습니다.

재부팅 뒤에도 모든 항목이 통과해 `Reboot_Persistence=PASS`로 기록했습니다.

## 17. WSL 연구환경 기준 상태 기록

WSL 연구환경 구성과 재부팅 검증을 마친 시점의 기준 상태를 다음 파일에 기록했습니다.

```text
D:\Lab\OfflineLab\manifests\wsl-research-baseline.txt
```

WSL 경로는 다음과 같습니다.

```text
/mnt/d/Lab/OfflineLab/manifests/wsl-research-baseline.txt
```

기록 시점에 `D:\Lab\OfflineLab\manifests`에는 파일 `21`개가 있었습니다. Note 6의 목록과는 기록 시점이 다르므로 각각의 수치를 유지했습니다.

이 파일에는 당시 WSL 연구환경과 stable TensorFlow의 `DEFERRED` 상태를 기록했습니다. 이후 시험한 nightly 결과는 이 노트의 후속 검증으로 추가했으며, 기존 기준 상태 파일에 소급 반영하지 않았습니다.

## 18. 최종 검증 결과

다음 표에는 기준 상태 기록 이후의 TensorFlow nightly 시험도 포함했습니다. 주 연구환경의 완료와 stable TensorFlow의 미해결 상태를 구분합니다.

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

주 WSL 연구환경의 Linux 빌드, Python, Jupyter, PyTorch, Transformers, 모델 공유와 편집기 작업은 통과했습니다. stable TensorFlow는 유보 상태로, nightly는 후속 호환성 검증 결과로 따로 남겼습니다.

## 19. WSL 연구환경 구성 완료

WSL2에 Linux 빌드 도구, 격리된 연구용 Python, Jupyter, VS Code 원격 확장과 신뢰 설정, 프로젝트별 uv 환경을 갖췄습니다. PyTorch·Transformers CUDA 실행과 로컬 모델 공유를 검증했고, 재부팅 후에도 동작했습니다.

이번 과정에서는 셸의 실행 방식, 원격 확장과 신뢰 설정, 프로젝트별 라이브러리 위치를 실제 실행 결과와 함께 확인했습니다. 설치 목록만으로 놓치기 쉬웠던 차이를 이 기록에 남깁니다.

마지막 상태는 다음과 같습니다.

```text
WSL2 Research Environment = PASS
Stable TensorFlow GPU Path = DEFERRED
TensorFlow Nightly GPU Path = PREVIEW PASS
```

`tf-nightly 2.22.0-dev20260923`에서는 RTX 5060 식별, 일반 GPU 연산, memory growth 적용 후 연산, XLA/JIT 실행과 프로젝트가 관리하는 cuDNN `9.26` 사용을 확인했습니다. 이 결과는 stable 기준 상태와 구분한 preview 검증입니다.

전체 워크스테이션의 네트워크 분리 검증은 아직 수행하지 않았습니다. Note 6에서 발견한 WSL 연구환경의 미완성 구성을 마무리했으므로, Note 8에서 전체 환경의 오프라인 시험을 진행할 예정입니다.
