---
title: "제한망 연구용 Offline Asset 기반 구축"
description: "버전이 고정된 installer, wheelhouse, source, configuration record와 checksum을 보존하고 offline-style 재구축을 검증하며 WSL과 TensorFlow의 남은 간격을 기록합니다."
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

「RTX 5060 CUDA·PyTorch와 Local LLM 연구 계층 구축」에서는 Windows와 WSL2의 GPU 경로를 마련하고 세 가지 Local LLM runtime을 검증했습니다. 다음 과제는 또 하나의 online installation이 아니었습니다. 이 연구 워크스테이션은 앞으로 Internet access가 제한되거나 불안정하거나 완전히 차단된 환경에서 사용될 수 있습니다. 그런 환경에 들어가기 전에 검증된 상태를 재구축하는 데 필요한 자산을 갖춰야 했습니다.

이번 단계는 전체 워크스테이션이 물리적으로 network를 끊은 시험을 통과했다는 주장이 아닙니다. 정확한 installer, 명시적인 Python wheelhouse, source와 configuration record를 보존하고, package index와 model lookup을 막은 상태에서 일부 재구축 경로를 실제로 시험했습니다. 이를 offline-mode 또는 offline-style validation으로 구분합니다. Network를 실제로 분리한 최종 end-to-end test는 이후 단계의 gate로 남겨 둡니다.

구현 과정에서는 series 순서도 바뀌었습니다. Offline asset을 준비하면서 WSL2가 GPU compute path는 통과했지만, 초기 architecture가 의도한 독립적인 Linux 연구환경으로는 아직 완성되지 않았다는 사실이 드러났습니다. 이 이력을 고쳐 쓰거나 빠진 작업을 이번 단계에 억지로 포함하지 않았습니다. 발견한 간격을 그대로 기록하고, Note 7을 WSL2 완성 단계로, Note 8을 end-to-end offline validation 단계로 조정했습니다.

## 1. 골격만 있던 OfflineLab에서 시작하기

`D:\Lab\OfflineLab`에는 이미 다음 top-level directory가 있었습니다.

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

구조에는 각 자산의 의도된 역할이 드러나 있었고, `manifests`에는 앞서 만든 workstation baseline이 들어 있었습니다. 하지만 그 내용까지 offline reconstruction set을 이룬 것은 아니었습니다. `cache`에는 uv cache만 있었고, 초기 크기는 약 `3.105 GB`, `32,301` files였습니다. 반면 `installers`, `wheelhouse`, `vscode-extensions`, `repos`, `docs`, `backups`는 사실상 비어 있었습니다.

이 출발 상태에서 재사용 가능한 tool cache와 검증된 offline asset은 같지 않다는 점이 분명해졌습니다. Cache는 도구가 내부적으로 관리하고, 불완전할 수 있으며, 비워지거나 구조가 바뀔 수도 있습니다. 그래서 `cache`는 disposable working state로 유지하고 검증된 offline asset 용량에서는 제외했습니다.

## 2. Model과 Reconstruction Asset 분리 유지

작업 전 D: volume은 전체 `602.8 GB` 중 `577.9 GB`가 비어 있었습니다. `D:\Lab\Models`는 시작 시점에 약 `5.323 GB`였고, OfflineLab과 의도적으로 분리했습니다.

| Root                | 역할                                                             |
| ------------------- | ---------------------------------------------------------------- |
| `D:\Lab\Models`     | 실제 Ollama, Hugging Face, llama.cpp model asset                 |
| `D:\Lab\OfflineLab` | Installer, wheelhouse, source 보존, 문서, backup과 검증 evidence |

OfflineLab의 목적은 환경을 재구축하고 그 근거를 설명하는 것이지, 큰 model store를 하나 더 복제하는 것이 아닙니다. 중복을 피하면 수명주기 경계가 분명해지고 자산 용량도 과장되지 않습니다. Model은 offline 운영에 여전히 필요하지만, 자체 위치에서 별도로 inventory합니다.

## 3. 실제 구축 버전의 Installer 보존

수집 당일의 가장 최신 installer를 무조건 내려받지 않고, 검증된 workstation을 실제로 만든 버전을 보존했습니다.

| 구성요소               | 검증 상태                                                         | 보존한 offline asset                   |
| ---------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| Git for Windows        | Git `2.55.0.windows.3`; winget package `2.55.0.3`                 | `Git_2.55.0.3_User_X64_inno_en-US.exe` |
| **Visual Studio Code** | `1.138.0`, x64; commit `7debcd0e2acdea1c52de81bf9ee1620444407dda` | x64 User Installer                     |
| uv                     | `0.12.17`; `x86_64-pc-windows-msvc`                               | `uv-x86_64-pc-windows-msvc.zip`        |
| CMake                  | `4.4.3`                                                           | Windows x64 MSI                        |
| NVIDIA Studio Driver   | `616.92`; RTX 5060 Laptop GPU; DCH / WHQL                         | Driver installer                       |
| CUDA                   | Toolkit `13.4`; `nvcc V13.4.92`                                   | `cuda_13.4.2_windows_x86_64.exe`       |
| Ollama                 | `0.34.2`                                                          | Windows x64 installer                  |

uv archive에는 `uv.exe`, `uvw.exe`, `uvx.exe`가 들어 있습니다. CUDA 이름은 특히 구분할 필요가 있습니다. `13.4.2`는 보존한 installer release이고, `13.4`는 설치된 Toolkit family이며, `V13.4.92`는 관찰한 compiler version입니다. 서로 연관된 서로 다른 계층의 label이지, 하나의 version을 다르게 보고한 것이 아닙니다.

Offline recovery의 첫 목표는 이미 동작한 상태를 재현하는 것이므로 exact-version 보존이 중요합니다. 새 installer는 별도로 평가할 수 있지만, 이를 조용히 대체하면 recovery가 새로운 compatibility experiment로 바뀝니다.

## 4. 실제 Visual Studio Offline Layout 구성

**Visual Studio Build Tools** `2026 18.10.1`은 작은 online bootstrapper만 보관해서는 충분하지 않았습니다. 다음 범위로 실제 offline layout을 만들었습니다.

```text
Microsoft.VisualStudio.Workload.VCTools
Recommended + Optional
Language: en-US
```

결과는 `1,400` files, `7.029 GB`였습니다. Layout verification은 exit code `0`을 반환했고 다음 문구를 포함했습니다.

```text
Verification completed. No problem was found.
Setup completed successfully.
```

이는 Visual Studio의 모든 workload가 아닙니다. VCTools workload와 그 Recommended·Optional component를 보존한 것입니다. 이후 CUDA, llama.cpp 또는 다른 native research build에 필요한 component를 isolation 뒤에 구하기 어려울 수 있어 C++ 범위는 의도적으로 넓게 유지했습니다. 추가 용량은 Visual Studio 전체를 무제한으로 모은 결과가 아니라, 정의된 workload 안에서 미래 build의 여지를 확보한 비용입니다.

## 5. VSIX Platform 가정 수정

검증된 Windows VS Code baseline에는 다음 열 개 extension이 있었습니다.

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

열 개 모두 exact-version VSIX를 보존했습니다. 이 중 네 개는 `win32-x64`, 여섯 개는 universal package였습니다.

처음에는 모든 extension이 `win32-x64` 전용 VSIX를 제공할 것이라고 가정했습니다. 하지만 여러 요청이 `has no support for targetPlatform win32-x64`를 반환했습니다. 이 문구는 extension이 Windows를 지원하지 않는다는 뜻이 아니었습니다. 해당 release가 universal VSIX로 배포된 것이었습니다. 수집 logic을 `win32-x64`부터 시도하고 실패하면 universal로 전환하도록 고쳤습니다. 최종 열 개 파일만 보여 주는 것보다 packaging model에 대한 잘못된 가정과 구현 수정을 함께 남기는 편이 이후 재구축에 더 유용합니다.

## 6. 일치하는 WSL VS Code Server 보존

VS Code Remote 개발은 WSL 내부의 server binary에도 의존합니다. Windows VS Code `1.138.0`의 commit은 다음과 같습니다.

```text
7debcd0e2acdea1c52de81bf9ee1620444407dda
```

WSL에는 같은 commit의 server가 이미 설치돼 있었습니다.

```text
~/.vscode-server/bin/7debcd0e2acdea1c52de81bf9ee1620444407dda
```

이에 맞는 Linux x64 VS Code Server archive를 명시적으로 보존했습니다. SHA-256은 다음과 같습니다.

```text
F766476592CD9F875E9E7E66E483DBA7E9661B794D8DBCA566249126D3525324
```

Commit match check는 통과했습니다. 이미 연결된 WSL session에서는 server가 VS Code 자체의 일부처럼 보여 놓치기 쉬운 자산입니다. 그러나 isolated rebuild에서는 desktop client의 정확한 commit에 묶인 별도 dependency입니다.

## 7. Cache 신뢰를 명시적인 Wheelhouse로 대체

기존 uv cache만으로 Python 환경을 offline에서 재구축할 수 있다고 판단하지 않았습니다. 대신 Python `3.12`용으로 목적이 분명한 wheelhouse를 만들었습니다.

질문도 “cache에 우연히 필요한 object가 충분히 있는가?”에서 “선언한 환경에 필요한 distribution이 이 directory에 있는가?”로 바뀌었습니다. 후자는 inventory, hash, copy와 `--no-index` 검증이 가능합니다. Cache reuse는 평상시 작업에 유용하지만, 검증된 foundation에는 포함하지 않습니다.

## 8. PyTorch cu132 Provenance 보존

`pytorch-cu132-py312` wheelhouse에는 package뿐 아니라 project provenance도 함께 남겼습니다.

- `pyproject.toml`
- `uv.lock`
- exported requirements
- 수집에 사용한 download-oriented requirements

Project는 전용 source를 명시했습니다.

```toml
[tool.uv.sources]
torch = { index = "pytorch" }
torchvision = { index = "pytorch" }

[[tool.uv.index]]
name = "pytorch"
url = "https://download.pytorch.org/whl/cu132"
```

`uv export`는 platform 조건이 붙은 Linux dependency까지 포함하는 universal dependency representation을 만들었습니다. Exported requirements만으로는 PyTorch 전용 cu132 source도 project metadata만큼 분명하게 드러나지 않았습니다. 따라서 universal lock 또는 export를 machine-specific offline wheelhouse와 같다고 보지 않았습니다.

`pyproject.toml`과 `uv.lock`으로 provenance를 유지하면서 Windows와 Python 3.12용 wheel을 명시적으로 수집했습니다. 결과는 `17` files, 약 `1.891 GB`였습니다. 약 `1.9 GB`인 `torch-2.14.0+cu132-cp312-cp312-win_amd64.whl`, `torchvision-0.29.0+cu132-cp312-cp312-win_amd64.whl`과 필요한 Windows dependency가 포함됐습니다.

## 9. Package Index 없이 PyTorch 재구축

다음 위치에 새 environment를 만들었습니다.

```text
D:\Lab\Research\pytorch-offline-test
```

Local wheelhouse를 대상으로 `--no-index`와 `--find-links`를 사용해 설치했습니다. 단순한 file inventory가 아니라 실제 reconstruction test였습니다. 설치한 환경에서 확인한 결과는 다음과 같습니다.

| 확인 항목                   | 관찰 결과                             |
| --------------------------- | ------------------------------------- |
| PyTorch                     | `2.14.0+cu132`                        |
| Bundled CUDA runtime        | `13.2`                                |
| `torch.cuda.is_available()` | `True`                                |
| GPU                         | NVIDIA GeForce RTX 5060 Laptop GPU    |
| Workload                    | `cuda:0`의 `torch.Size([2048, 2048])` |

실제 local CUDA matrix multiplication이 성공했습니다. 따라서 PyTorch offline wheelhouse는 package index 없이 새 환경을 만들고 GPU workload까지 실행할 수 있다는 근거로 `PASS`를 받았습니다. 그럴듯한 이름의 wheel file이 존재하는지만 확인한 판정이 아닙니다.

## 10. Transformers 환경 재구축

`transformers-py312`라는 별도의 self-contained wheelhouse도 만들었습니다. 검증한 주요 version은 PyTorch `2.14.0+cu132`, Transformers `5.17.0`, Accelerate `1.15.0`입니다.

`D:\Lab\Research\transformers-offline-test`에 새 environment를 만들고 local wheelhouse에서 `--no-index`로 설치했습니다. Package import가 통과했고 CUDA가 사용 가능했으며 NVIDIA GeForce RTX 5060 Laptop GPU도 정상적으로 식별됐습니다.

이 wheelhouse를 self-contained로 둔 것은 Transformers recovery path가 별도 PyTorch test directory의 내용이나 배치에 암묵적으로 의존하지 않게 하기 위해서입니다. 하나의 reconstruction unit을 완결하기 위한 Python distribution 중복은 허용하되, 큰 model store는 이 방식으로 중복하지 않았습니다.

## 11. Offline Mode에서 Local Model Inference 실행

기존 `D:\Lab\Models\HuggingFace`에는 `Qwen/Qwen3-0.6B`가 있었습니다. Transformers validation은 다음 설정으로 실행했습니다.

```text
HF_HUB_OFFLINE=1
TRANSFORMERS_OFFLINE=1
local_files_only=True
```

Weight는 local cache에서만 load됐고, model은 `cuda:0`에서 실제 inference를 완료했습니다. 최종 결과는 다음과 같습니다.

```text
Transformers offline CUDA inference PASS
```

이는 library의 network lookup을 막고 local asset에서 model을 load한 offline-mode validation입니다. 모든 구성요소를 대상으로 network를 물리적으로 분리해 시험했다는 증거는 아닙니다. 그보다 강한 end-to-end 주장은 Note 8까지 유보합니다.

## 12. llama.cpp를 재구축 가능한 Source로 보존

검증된 llama.cpp source의 full commit은 다음과 같습니다.

```text
b29c606e28a01b1bc8c1351026a0fa6e616bf6c4
```

Working tree는 clean 상태였습니다. 다음 위치에 complete Git bundle을 만들었습니다.

```text
D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606.bundle
```

Bundle verification은 통과했고 SHA-1 repository의 complete history를 보고했습니다. Bundle SHA-256은 다음과 같습니다.

```text
9CED5B9B80FBFC9994E7FC78E344D446BE40BCE3BFF08BDB43E63D3C21F228D5
```

중요한 configuration을 기록한 `build-recipe.txt`도 보존했습니다.

```text
GGML_CUDA=ON
CMAKE_CUDA_ARCHITECTURES=120
LLAMA_BUILD_BORINGSSL=ON
```

BoringSSL option에는 실제 구현에서 얻은 lesson이 담겨 있습니다. 첫 CUDA build는 GPU를 정상적으로 식별했지만 HTTPS backend가 없어 Hugging Face model을 가져오지 못했습니다. `LLAMA_BUILD_BORINGSSL=ON`으로 rebuild한 뒤에는 HTTPS model retrieval과 CUDA inference가 모두 통과했습니다. Source만 남겼다면 이 operational knowledge는 보존되지 않았을 것입니다.

## 13. Smoke Test와 Recovery Record 보존

검증된 smoke-test source와 project metadata는 `D:\Lab\OfflineLab\repos\smoke-tests`로 복사했습니다. CUDA source와 검증된 executable, PyTorch·Transformers smoke-test source와 metadata, `pyproject.toml`, `uv.lock`, 관련 script가 포함됐습니다.

`.venv`, build directory, cache, model file처럼 재구축 가능하거나 별도로 관리되는 상태를 불필요하게 복제하는 항목은 제외했습니다. 보존한 smoke-test file에는 SHA-256 manifest도 생성했습니다.

Recovery에 필요한 연구환경 경로도 기록했습니다.

```text
CUDA_PATH_MACHINE=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.4
OLLAMA_MODELS_USER=D:\Lab\Models\Ollama
HF_HUB_CACHE_USER=D:\Lab\Models\HuggingFace
LLAMA_CACHE_USER=D:\Lab\Models\llama.cpp
```

Recovery note와 함께 Git, VS Code, environment configuration을 선별해 backup했습니다. 이 기록에는 임의의 environment variable이나 credential을 넣지 않았습니다. Recovery set은 연구환경 재구축에 필요한 configuration을 설명해야 하지만, secret이 들어 있을 수 있는 user state까지 archive로 만들어서는 안 됩니다.

## 14. WSL에서 TensorFlow 2.21.0 조사

TensorFlow는 WSL 전용 secondary framework 후보로 검토했습니다. `tensorflow[and-cuda]==2.21.0` 설치는 결국 성공했지만, 여러 개의 큰 NVIDIA CUDA wheel을 `files.pythonhosted.org`에서 내려받는 과정에서 반복적인 connection timeout이 발생해 설치가 쉽지 않았습니다. 설치된 GPU dependency family는 CUDA 12.9 Python package를 사용했습니다.

그러나 TensorFlow `2.21.0`의 GPU discovery는 다음 error와 함께 실패했습니다.

```text
Cannot dlopen some GPU libraries
```

공식 안내 방식에 따른 shared NVIDIA `.so` library와 `ptxas` symlink remediation을 적용했습니다. 이때 확인한 `ptxas`는 CUDA `12.9`, version `V12.9.86`이었습니다. 조치 뒤에도 GPU discovery는 실패했습니다.

중요한 결과는 package installation이 결국 끝났다는 사실이 아닙니다. 이 환경에서 TensorFlow `2.21.0`은 사용할 수 있는 GPU path에 도달하지 못했습니다.

## 15. TensorFlow 2.20.0 비교

A/B comparison을 위해 TensorFlow `2.20.0`용 별도 environment를 만들었습니다. 이 version은 NVIDIA GeForce RTX 5060 Laptop GPU를 찾았고 Compute Capability `12.0`을 보고했습니다.

하지만 detection은 성공적인 execution과 같지 않았습니다. TensorFlow는 prebuilt wheel에 Compute Capability `12.0`과 호환되는 CUDA kernel binary가 없어 PTX에서 JIT compile할 것이라고 경고했습니다. 실제 GPU workload는 다음 error로 실패했습니다.

```text
CUDA_ERROR_INVALID_PTX
CUDA_ERROR_INVALID_HANDLE
```

두 version에서는 서로 다른 불완전 상태가 나타났습니다.

| 시험 version        | GPU discovery | GPU execution |
| ------------------- | ------------- | ------------- |
| TensorFlow `2.21.0` | `FAIL`        | 도달하지 못함 |
| TensorFlow `2.20.0` | `PASS`        | `FAIL`        |

GPU detection과 GPU execution은 별도 gate입니다. Framework 출력에 device가 보이는 것은 유용한 diagnostic evidence이지만, 완료된 workload를 대신할 수는 없습니다.

## 16. TensorFlow GPU Path 유보

TensorFlow GPU path의 판정은 `PASS`가 아니라 `DEFERRED`로 남겼습니다. 관찰 결과로 말할 수 있는 범위는 시험한 stable TensorFlow wheel과 RTX 5060 Compute Capability `12.0` 사이에 compatibility gap이 있었다는 것입니다. 그보다 구체적인 upstream root cause까지 확정할 근거는 없습니다.

또한 workstation GPU 전체의 실패를 뜻하지 않습니다. 같은 RTX 5060에서 CUDA C++, Windows·WSL PyTorch, llama.cpp, Ollama, Transformers가 이미 실제 GPU workload를 실행했습니다. 검증한 TensorFlow 조합에는 동작하는 GPU execution path가 없었고, compatibility 상황이 달라질 때 다시 살펴봐야 한다는 것이 제한된 결론입니다.

## 17. 완성되지 않은 WSL 연구 Workflow 발견

Offline 준비 과정에서 WSL 내부의 remote extension manifest도 확인했습니다.

```text
~/.vscode-server/extensions/extensions.json
```

내용은 다음과 같았습니다.

```json
[]
```

WSL은 이미 Ubuntu startup, `/dev/dxg` GPU access, NVIDIA driver path, PyTorch CUDA, GPU benchmark, VS Code Server connectivity를 통과했습니다. 이 결과들은 유효하지만 WSL을 주로 compute path로 검증한 것이었습니다. WSL-side remote Python·Jupyter extension은 아직 설치되지 않았습니다.

초기 architecture에서 WSL2는 GPU smoke-test route 이상이어야 했습니다. 제한망 또는 offline 환경에서도 사용할 수 있는 독립적인 Linux 연구환경이 원래 의도였습니다. Offline asset을 준비하는 과정에서 implementation이 아직 그 design intent에 도달하지 않았음이 드러났습니다.

이를 숨겨진 실패가 아니라 final validation 전 발견한 유용한 간격으로 봅니다. 이미 범위가 넓은 asset 보존 단계에 WSL 완성까지 넣으면 scope와 evidence가 흐려집니다. 그래서 「WSL2 Research Environment Completion」을 Note 7로 분리하고, Note 8에서 전체 환경을 end-to-end로 검증하기로 순서를 수정했습니다.

## 18. 최종 Baseline 기록 직전 Asset Inventory

다음 category inventory는 `offline-assets-baseline.txt`를 작성하기 직전에 capture한 snapshot입니다. 따라서 `manifests`의 `18` files는 해당 final baseline file이 추가되기 전 count입니다.

| Category            |                         Files |        Size |
| ------------------- | ----------------------------: | ----------: |
| `backups`           |                           `3` |           — |
| `cache`             |                      `70,525` |  `8.944 GB` |
| `docs`              |                           `1` |           — |
| `installers`        |                       `1,414` | `13.605 GB` |
| `manifests`         | final baseline update 전 `18` |           — |
| `repos`             |                          `18` |  `0.036 GB` |
| `vscode-extensions` |                          `10` |  `0.063 GB` |
| `wheelhouse`        |                          `60` |  `3.805 GB` |

`cache`를 제외한 intentional OfflineLab asset은 `17.509 GB`였습니다. 별도 `D:\Lab\Models`에는 `33` files, `5.323 GB`의 model asset이 있었습니다.

`8.944 GB`인 cache를 intentional offline asset 용량에 더하지 않았습니다. 시작 상태보다 커진 점은 운영 측면에서 의미가 있지만, 이를 curated recovery material로 계산하면 이번 단계에서 확인한 핵심 구분이 사라집니다.

## 19. 의도적으로 보존한 Asset Root Hashing

다음 asset root 전체에 대한 SHA-256 manifest를 만들었습니다.

- `installers`
- `wheelhouse`
- `vscode-extensions`
- `repos`
- `docs`
- `backups`

결과 파일은 `D:\Lab\OfflineLab\manifests\offline-assets-sha256.txt`이며, 크기는 `348,367` bytes, entry는 `1,506`개였습니다. Disposable `cache`는 의도적으로 제외했습니다.

Checksum은 모든 installer가 실행되거나 모든 dependency 관계가 완전하다는 사실까지 증명하지 않습니다. 수집한 정확한 file의 integrity evidence를 제공합니다. Reconstruction test가 이에 대응하는 functional evidence입니다.

## 20. Foundation Baseline 기록

최종 baseline은 다음 위치에 기록했습니다.

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

이번 단계의 중심 lesson은 offline readiness가 하나의 file이 아니라 evidence system이라는 점입니다. Exact installer, 명시적인 wheelhouse, 별도 관리하는 model, 재구축 가능한 source, configuration record, checksum과 실제 reconstruction test가 함께 필요합니다. 하나의 cache, lockfile, device detection 결과나 성공한 online installation이 이 전체를 대신할 수는 없습니다.

## 21. 두 간격을 명시한 Foundation PASS

Offline reconstruction foundation은 이제 명시적으로 구성됐고, version과 hash가 기록됐으며, 일부 경로는 실제 reconstruction test를 통과했습니다. Windows Python, PyTorch, Transformers와 local-model path가 offline-style test를 통과했고, 이후 재구축에 필요한 source와 toolchain asset도 보존했습니다.

그러나 workstation 전체가 아직 offline-ready인 것은 아닙니다. 완전한 WSL research workflow가 남아 있고, TensorFlow GPU compatibility도 해결되지 않았으며, network를 물리적으로 분리한 end-to-end validation도 수행하지 않았습니다. 이 한계는 부가 설명이 아니라 결과의 일부입니다.

따라서 이번 단계의 올바른 판정은 다음과 같습니다.

```text
Offline Research Assets Foundation = PASS
```

Note 7에서는 초기 architecture가 의도했던 WSL2 연구환경을 완성합니다. 그다음 Note 8에서 end-to-end offline research environment validation을 수행할 예정입니다. 구현 중 발견한 간격에서 작업을 나누는 편이 초기 순서가 처음부터 완전했던 것처럼 소급해 정리하는 것보다 연구 기록으로서 더 정확합니다.
