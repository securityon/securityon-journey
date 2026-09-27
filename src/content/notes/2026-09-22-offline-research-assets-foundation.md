---
title: "오프라인 연구 자산 구축"
description: "검증된 버전의 설치 파일, wheelhouse, 소스와 설정을 보관하고 오프라인 모드에서 재구축을 시험했습니다. WSL 연구환경과 TensorFlow에 남은 과제도 기록합니다."
lang: ko
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

「RTX 5060 CUDA·PyTorch와 Local LLM 구축」에서는 Windows와 WSL2의 GPU 경로와 세 가지 Local LLM 런타임을 검증했습니다. 앞으로 인터넷 접속이 제한되거나 완전히 차단된 환경에 들어가기 전에, 이 상태를 재구축하는 데 필요한 자산을 준비해야 했습니다.

이번에는 설치 파일, Python wheelhouse, 소스와 설정 기록을 보존하고 패키지 인덱스와 모델 검색을 막은 상태에서 일부 재구축 경로를 시험했습니다. 이 글에서는 이를 오프라인 모드 검증으로 부릅니다. 네트워크를 실제로 분리한 전체 환경 검증은 이후 단계로 남겼습니다.

오프라인 자산을 준비하면서 시리즈 순서도 조정했습니다. WSL2의 GPU 연산은 검증했지만, 초기 설계에서 의도한 독립적인 Linux 연구환경에는 아직 빠진 구성이 있었습니다. 이에 Note 7을 WSL2 연구환경 완성 단계로, Note 8을 전체 환경의 오프라인 검증 단계로 나눴습니다.

## 1. 골격만 있던 OfflineLab에서 시작하기

`D:\Lab\OfflineLab`에는 다음 최상위 디렉터리가 이미 있었습니다.

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

`manifests`에는 앞서 만든 워크스테이션 기준 상태가 들어 있었습니다. `cache`에는 uv 캐시만 있었고, 초기 크기는 약 `3.105 GB`, 파일 수는 `32,301`개였습니다. 반면 `installers`, `wheelhouse`, `vscode-extensions`, `repos`, `docs`, `backups`는 사실상 비어 있어 재구축 자산을 채워야 했습니다.

도구가 관리하는 캐시는 내용이 불완전하거나 비워질 수 있고 내부 구조도 바뀔 수 있습니다. 따라서 `cache`는 지워도 되는 작업 데이터로 취급하고, 검증된 오프라인 자산 용량에서 제외했습니다.

## 2. 모델과 재구축 자산 분리

작업 전 D: 볼륨은 전체 `602.8 GB` 중 `577.9 GB`가 비어 있었습니다. `D:\Lab\Models`는 시작 시점에 약 `5.323 GB`였고, OfflineLab과 의도적으로 분리했습니다.

| Root                | 역할                                                |
| ------------------- | --------------------------------------------------- |
| `D:\Lab\Models`     | 실제 Ollama, Hugging Face, llama.cpp 모델 자산      |
| `D:\Lab\OfflineLab` | 설치 파일, wheelhouse, 소스, 문서, 백업과 검증 근거 |

OfflineLab에는 환경 재구축에 필요한 파일과 기록을 모으고, 큰 모델 저장소는 복제하지 않았습니다. 모델은 오프라인 운영에 필요하므로 원래 위치에서 별도로 목록을 관리했습니다.

## 3. 검증된 버전의 복구용 설치 파일 보관

검증된 환경과 버전이 일치하는 복구용 설치 파일을 보관했습니다. 아래 표는 보관 자산을 기록한 것이며, 각 파일이 최초 설치에 사용됐던 파일과 동일하다는 의미는 아닙니다.

| 구성요소               | 검증 상태                                                         | 보관한 오프라인 자산                   |
| ---------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| Git for Windows        | Git `2.55.0.windows.3`; winget package `2.55.0.3`                 | `Git_2.55.0.3_User_X64_inno_en-US.exe` |
| **Visual Studio Code** | `1.138.0`, x64; commit `7debcd0e2acdea1c52de81bf9ee1620444407dda` | x64 User Installer                     |
| uv                     | `0.12.17`; `x86_64-pc-windows-msvc`                               | `uv-x86_64-pc-windows-msvc.zip`        |
| CMake                  | `4.4.3`                                                           | Windows x64 MSI                        |
| NVIDIA Studio Driver   | `616.92`; RTX 5060 Laptop GPU; DCH / WHQL                         | Driver installer                       |
| CUDA                   | Toolkit `13.4`; `nvcc V13.4.92`                                   | `cuda_13.4.2_windows_x86_64.exe`       |
| Ollama                 | `0.34.2`                                                          | Windows x64 installer                  |

uv 아카이브에는 `uv.exe`, `uvw.exe`, `uvx.exe`가 들어 있습니다. CUDA 이름은 특히 구분할 필요가 있습니다. `13.4.2`는 보존한 설치 파일 릴리스이고, `13.4`는 설치된 Toolkit 계열이며, `V13.4.92`는 관찰한 컴파일러 버전입니다. 서로 연관된 서로 다른 계층의 표기이며, 하나의 버전을 다르게 보고한 것이 아닙니다.

오프라인 복구에서는 이미 동작한 버전을 다시 구성하는 것이 우선입니다. 새 버전은 별도로 평가해야 하며, 보관 파일을 교체하면 복구 과정에 새로운 호환성 검증이 필요해집니다.

## 4. Visual Studio 오프라인 레이아웃 구성

**Visual Studio Build Tools** `2026 18.10.1`은 작은 온라인 부트스트래퍼만 보관해서는 충분하지 않았습니다. 다음 범위로 실제 오프라인 레이아웃을 만들었습니다.

```text
Microsoft.VisualStudio.Workload.VCTools
Recommended + Optional
Language: en-US
```

결과는 파일 `1,400`개, `7.029 GB`였습니다. 레이아웃 검증은 종료 코드 `0`을 반환했고 다음 문구를 포함했습니다.

```text
Verification completed. No problem was found.
Setup completed successfully.
```

보관 범위는 VCTools와 그 Recommended·Optional 구성요소입니다. 네트워크 분리 후 CUDA, llama.cpp와 다른 네이티브 연구 소프트웨어를 빌드할 때 필요한 구성요소를 구하기 어려울 수 있어 C++ 범위는 의도적으로 넓게 잡았습니다.

## 5. VSIX 배포 플랫폼에 대한 가정 수정

검증된 Windows VS Code 기준 상태에는 다음 열 개 확장이 있었습니다.

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

열 개 모두 동일 버전의 VSIX를 보존했습니다. 이 중 네 개는 `win32-x64`, 여섯 개는 universal 패키지였습니다.

처음에는 모든 확장이 `win32-x64` 전용 VSIX를 제공한다고 가정했습니다. 여러 요청에서 `has no support for targetPlatform win32-x64`가 반환됐는데, 해당 릴리스는 universal VSIX로 배포되고 있었습니다. 수집 로직을 `win32-x64`부터 시도하고 실패하면 universal로 전환하도록 고쳤습니다.

## 6. 일치하는 WSL VS Code Server 보존

VS Code Remote 개발은 WSL 내부의 서버 바이너리에도 의존합니다. Windows VS Code `1.138.0`의 커밋은 다음과 같습니다.

```text
7debcd0e2acdea1c52de81bf9ee1620444407dda
```

WSL에는 같은 커밋의 서버가 이미 설치돼 있었습니다.

```text
~/.vscode-server/bin/7debcd0e2acdea1c52de81bf9ee1620444407dda
```

이에 맞는 Linux x64 VS Code Server 아카이브를 명시적으로 보존했습니다. SHA-256은 다음과 같습니다.

```text
F766476592CD9F875E9E7E66E483DBA7E9661B794D8DBCA566249126D3525324
```

커밋 일치 검사를 통과했습니다. 오프라인 재구축에는 데스크톱 클라이언트의 정확한 커밋과 맞는 서버 아카이브가 별도로 필요합니다.

## 7. 용도별 wheelhouse 구성

Python `3.12` 환경을 재구축할 수 있도록 용도별 wheelhouse를 만들었습니다.

선언한 환경에 필요한 배포 파일을 한 디렉터리에 모으면 목록 작성, 해시 생성, 복사와 `--no-index` 설치 검증이 가능합니다. uv 캐시는 평상시 작업에 활용하되 이 검증 대상에는 포함하지 않았습니다.

## 8. PyTorch cu132 출처와 구성 기록

`pytorch-cu132-py312` wheelhouse에는 패키지뿐 아니라 프로젝트의 출처와 구성 기록도 함께 남겼습니다.

- `pyproject.toml`
- `uv.lock`
- 내보낸 requirements
- 다운로드용으로 정리한 requirements

프로젝트는 전용 소스를 명시했습니다.

```toml
[tool.uv.sources]
torch = { index = "pytorch" }
torchvision = { index = "pytorch" }

[[tool.uv.index]]
name = "pytorch"
url = "https://download.pytorch.org/whl/cu132"
```

`uv export` 결과에는 플랫폼 조건이 붙은 Linux 의존성도 포함됐습니다. 내보낸 requirements만으로는 PyTorch 전용 cu132 소스가 프로젝트 메타데이터만큼 분명하게 드러나지 않았습니다. 따라서 universal lock 또는 export를 특정 환경용 오프라인 wheelhouse와 같다고 보지 않았습니다.

`pyproject.toml`과 `uv.lock`으로 출처와 구성을 유지하면서 Windows와 Python 3.12용 wheel을 명시적으로 수집했습니다. 결과는 파일 `17`개, 약 `1.891 GB`였습니다. 약 `1.9 GB`인 `torch-2.14.0+cu132-cp312-cp312-win_amd64.whl`, `torchvision-0.29.0+cu132-cp312-cp312-win_amd64.whl`과 필요한 Windows 의존성이 포함됐습니다.

## 9. 패키지 인덱스 없이 PyTorch 재구축

다음 위치에 새 환경을 만들었습니다.

```text
D:\Lab\Research\pytorch-offline-test
```

로컬 wheelhouse에서 `--no-index`와 `--find-links`로 설치했습니다. 새 환경에서 확인한 결과는 다음과 같습니다.

| 확인 항목                   | 관찰 결과                             |
| --------------------------- | ------------------------------------- |
| PyTorch                     | `2.14.0+cu132`                        |
| 포함된 CUDA 런타임          | `13.2`                                |
| `torch.cuda.is_available()` | `True`                                |
| GPU                         | NVIDIA GeForce RTX 5060 Laptop GPU    |
| Workload                    | `cuda:0`의 `torch.Size([2048, 2048])` |

CUDA 행렬곱이 성공했습니다. 패키지 인덱스 없이 새 환경을 만들고 GPU 작업까지 실행한 결과로 PyTorch 오프라인 wheelhouse를 `PASS`로 판정했습니다.

## 10. Transformers 환경 재구축

`transformers-py312`라는 독립적인 wheelhouse도 만들었습니다. 검증한 주요 버전은 PyTorch `2.14.0+cu132`, Transformers `5.17.0`, Accelerate `1.15.0`입니다.

`D:\Lab\Research\transformers-offline-test`에 새 환경을 만들고 로컬 wheelhouse에서 `--no-index`로 설치했습니다. 패키지 import가 통과했고 CUDA가 사용 가능했으며 NVIDIA GeForce RTX 5060 Laptop GPU도 정상적으로 식별됐습니다.

Transformers 복구가 별도 PyTorch 시험 디렉터리의 내용이나 배치에 의존하지 않도록 wheelhouse를 독립적으로 구성했습니다. 재구축 단위를 완성하는 데 필요한 Python 배포 파일의 중복은 허용하되 큰 모델 저장소는 별도로 유지했습니다.

## 11. 오프라인 모드에서 로컬 모델 추론

기존 `D:\Lab\Models\HuggingFace`에는 `Qwen/Qwen3-0.6B`가 있었습니다. Transformers 검증은 다음 설정으로 실행했습니다.

```text
HF_HUB_OFFLINE=1
TRANSFORMERS_OFFLINE=1
local_files_only=True
```

가중치는 로컬 캐시에서만 불러왔고, 모델은 `cuda:0`에서 실제 추론을 완료했습니다. 최종 결과는 다음과 같습니다.

```text
Transformers offline CUDA inference PASS
```

라이브러리의 네트워크 검색을 막고 로컬 자산에서 모델을 불러온 검증입니다. 네트워크를 실제로 분리하는 전체 환경 시험은 Note 8에서 수행할 예정입니다.

## 12. llama.cpp 소스 보관

검증된 llama.cpp 소스의 전체 커밋은 다음과 같습니다.

```text
b29c606e28a01b1bc8c1351026a0fa6e616bf6c4
```

작업 트리에는 변경 사항이 없었습니다. 다음 위치에 전체 Git 번들을 만들었습니다.

```text
D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606.bundle
```

번들 검증은 통과했고 SHA-1 저장소의 전체 이력을 보고했습니다. 번들 SHA-256은 다음과 같습니다.

```text
9CED5B9B80FBFC9994E7FC78E344D446BE40BCE3BFF08BDB43E63D3C21F228D5
```

주요 설정을 기록한 `build-recipe.txt`도 보존했습니다.

```text
GGML_CUDA=ON
CMAKE_CUDA_ARCHITECTURES=120
LLAMA_BUILD_BORINGSSL=ON
```

첫 CUDA 빌드에는 HTTPS 백엔드가 없어 Hugging Face 모델을 가져오지 못했습니다. `LLAMA_BUILD_BORINGSSL=ON`으로 다시 빌드한 뒤 HTTPS 다운로드와 CUDA 추론이 모두 성공했습니다. 재구축 때 이 설정이 빠지지 않도록 빌드 기록에 포함했습니다.

## 13. 시험 코드와 복구 기록 보관

검증된 smoke-test 소스와 프로젝트 메타데이터는 `D:\Lab\OfflineLab\repos\smoke-tests`로 복사했습니다. CUDA 소스와 검증된 실행 파일, PyTorch·Transformers smoke-test 소스와 메타데이터, `pyproject.toml`, `uv.lock`, 관련 스크립트가 포함됐습니다.

`.venv`, 빌드 디렉터리, 캐시, 모델 파일처럼 재구축 가능하거나 별도로 관리되는 상태를 불필요하게 복제하는 항목은 제외했습니다. 보존한 smoke-test 파일에는 SHA-256 목록도 생성했습니다.

복구에 필요한 연구환경 경로도 기록했습니다.

```text
CUDA_PATH_MACHINE=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.4
OLLAMA_MODELS_USER=D:\Lab\Models\Ollama
HF_HUB_CACHE_USER=D:\Lab\Models\HuggingFace
LLAMA_CACHE_USER=D:\Lab\Models\llama.cpp
```

복구 문서와 함께 Git, VS Code, 환경 설정을 선별해 백업했습니다. 임의의 환경 변수나 인증 정보는 포함하지 않고 연구환경 재구축에 필요한 설정만 남겼습니다.

## 14. WSL에서 TensorFlow 2.21.0 조사

TensorFlow는 WSL 전용 보조 프레임워크 후보로 검토했습니다. `tensorflow[and-cuda]==2.21.0` 설치는 결국 성공했지만, 여러 개의 큰 NVIDIA CUDA wheel을 `files.pythonhosted.org`에서 내려받는 과정에서 반복적인 연결 시간 초과가 발생해 설치가 쉽지 않았습니다. 설치된 GPU 의존성 구성은 CUDA 12.9 Python 패키지를 사용했습니다.

그러나 TensorFlow `2.21.0`의 GPU 식별은 다음 오류와 함께 실패했습니다.

```text
Cannot dlopen some GPU libraries
```

공식 안내 방식에 따른 NVIDIA 공유 `.so` 라이브러리와 `ptxas` 심볼릭 링크 조치를 적용했습니다. 이때 확인한 `ptxas`는 CUDA `12.9`, 버전 `V12.9.86`이었습니다. 조치 뒤에도 GPU 식별은 실패했습니다.

이 환경에서 TensorFlow `2.21.0`은 GPU를 사용할 수 있는 상태에 도달하지 못했습니다.

## 15. TensorFlow 2.20.0 비교

A/B 비교를 위해 TensorFlow `2.20.0`용 별도 환경를 만들었습니다. 이 버전은 NVIDIA GeForce RTX 5060 Laptop GPU를 찾았고 Compute Capability `12.0`을 보고했습니다.

GPU 식별 뒤 실제 연산을 시험했습니다. TensorFlow는 사전 빌드된 wheel에 Compute Capability `12.0`과 호환되는 CUDA 커널 바이너리가 없어 PTX에서 JIT 컴파일할 것이라고 경고했습니다. 실제 GPU 작업은 다음 오류로 실패했습니다.

```text
CUDA_ERROR_INVALID_PTX
CUDA_ERROR_INVALID_HANDLE
```

두 버전에서는 서로 다른 불완전 상태가 나타났습니다.

| 시험 버전           | GPU 식별 | GPU 실행      |
| ------------------- | -------- | ------------- |
| TensorFlow `2.21.0` | `FAIL`   | 도달하지 못함 |
| TensorFlow `2.20.0` | `PASS`   | `FAIL`        |

GPU 식별과 실제 연산을 별도 검증 항목으로 기록했습니다.

## 16. TensorFlow GPU 검증 유보

TensorFlow GPU 경로는 `DEFERRED`로 남겼습니다. 시험한 stable wheel과 RTX 5060 Compute Capability `12.0` 사이의 호환성 문제를 관찰했지만, 그보다 구체적인 상위 프로젝트의 원인까지 확정할 근거는 없습니다.

같은 RTX 5060에서 CUDA C++, Windows·WSL PyTorch, llama.cpp, Ollama, Transformers는 GPU 작업을 수행했습니다. 이번에 시험한 TensorFlow 조합은 실제 GPU 연산에 실패했으며, 호환성 조건이 달라지면 재시험할 필요가 있습니다.

## 17. WSL 연구환경의 미완성 구성 확인

오프라인 자산을 준비하면서 WSL 내부의 원격 확장 목록도 확인했습니다.

```text
~/.vscode-server/extensions/extensions.json
```

내용은 다음과 같았습니다.

```json
[]
```

WSL에서는 Ubuntu 기동, `/dev/dxg`를 통한 GPU 접근, NVIDIA 드라이버 경로, PyTorch CUDA, GPU 벤치마크와 VS Code Server 연결을 확인했습니다. 그러나 WSL 쪽 Python·Jupyter 원격 확장은 아직 설치되지 않았습니다.

초기 설계의 목표는 제한망이나 오프라인에서도 사용할 수 있는 독립적인 Linux 연구환경이었습니다. GPU 연산 경로를 검증한 데 이어 실제 연구 작업에 필요한 구성을 더해야 했습니다.

WSL 연구환경 완성은 Note 7로 분리하고, Note 8에서 전체 환경을 검증하기로 했습니다.

## 18. 최종 기록 직전의 자산 목록

다음 목록은 `offline-assets-baseline.txt`를 작성하기 직전의 상태입니다. `manifests`의 파일 수 `18`개에는 해당 최종 기록 파일이 포함되지 않았습니다.

| Category            |                  Files |        Size |
| ------------------- | ---------------------: | ----------: |
| `backups`           |                    `3` |           — |
| `cache`             |               `70,525` |  `8.944 GB` |
| `docs`              |                    `1` |           — |
| `installers`        |                `1,414` | `13.605 GB` |
| `manifests`         | 최종 기록 추가 전 `18` |           — |
| `repos`             |                   `18` |  `0.036 GB` |
| `vscode-extensions` |                   `10` |  `0.063 GB` |
| `wheelhouse`        |                   `60` |  `3.805 GB` |

`cache`를 제외하고 선별한 OfflineLab 자산은 `17.509 GB`였습니다. 별도 `D:\Lab\Models`에는 파일 `33`개, `5.323 GB`의 모델 자산이 있었습니다.

`8.944 GB`로 늘어난 캐시는 복구용으로 선별한 자산 용량에 합산하지 않았습니다.

## 19. 보관 자산의 해시 생성

다음 자산 디렉터리 전체에 대한 SHA-256 목록을 만들었습니다.

- `installers`
- `wheelhouse`
- `vscode-extensions`
- `repos`
- `docs`
- `backups`

결과 파일은 `D:\Lab\OfflineLab\manifests\offline-assets-sha256.txt`이며, 크기는 `348,367`바이트, 항목은 `1,506`개였습니다. 작업용 `cache`는 의도적으로 제외했습니다.

체크섬은 수집한 파일의 무결성을 확인할 기준으로 남겼습니다. 설치 파일의 실행 여부와 의존성 완전성은 재구축 시험으로 별도 확인해야 합니다.

## 20. 자산 기반의 검증 결과 기록

최종 기준 상태는 다음 위치에 기록했습니다.

```text
D:\Lab\OfflineLab\manifests\offline-assets-baseline.txt
```

| Gate                                | 결과                 |
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

이번에 보관한 설치 파일, wheelhouse, 소스, 설정과 체크섬을 별도 관리하는 모델 및 재구축 시험 결과와 함께 복구 근거로 사용할 수 있게 됐습니다.

## 21. 완료 범위와 남은 과제

재구축 자산을 모아 버전과 해시를 기록했고, Windows Python·PyTorch·Transformers와 로컬 모델의 일부 경로는 오프라인 모드 시험을 통과했습니다. 이후 재구축에 필요한 소스와 빌드 도구도 보관했습니다.

WSL 연구환경 완성, TensorFlow GPU 호환성 해결, 네트워크를 실제로 분리한 전체 환경 검증은 아직 남아 있습니다.

따라서 이번 단계의 올바른 판정은 다음과 같습니다.

```text
Offline Research Assets Foundation = PASS
```

Note 7에서 WSL2 연구환경을 완성한 뒤 Note 8에서 전체 환경의 오프라인 검증을 수행할 예정입니다.
