---
title: "RTX 5060 CUDA·PyTorch와 Local LLM 구축"
description: "Windows와 WSL2에서 RTX 5060의 CUDA·PyTorch 경로와 세 가지 Local LLM runtime을 실제 workload와 재부팅 후 지속성으로 검증합니다."
lang: ko
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

「Windows Research Development Baseline 구축과 WSL2 Gate 검증」에서는 Windows Native와 WSL2라는 두 개발 경로를 실제 project와 재부팅까지 확인했습니다. 이번 단계에서는 그 기준선을 유지한 채 RTX 5060을 CUDA·PyTorch 연구와 Local LLM 실행에 사용할 수 있는지 검증했습니다.

중심 과제는 CUDA를 설치하는 데 그치지 않았습니다. System CUDA, framework가 포함한 CUDA runtime, model runtime, model storage의 역할을 분리하고, 각각을 실제 workload로 확인해야 했습니다. 또한 최신 공식 지원 버전을 선택하면서 만난 compatibility friction을 숨기지 않고 다음 재구축에 사용할 근거로 남겼습니다.

이번에도 설치 직후의 한 번 성공만으로는 `PASS`로 판단하지 않았습니다. GPU 연산, model inference, local API와 storage 경로가 실제로 동작하고, 필요한 상태가 재부팅 뒤에도 유지돼야 기준선에 도달한 것으로 보았습니다.

## 1. Windows·WSL 기준선 위에서 시작하기

시작 시점의 GPU는 NVIDIA GeForce RTX 5060 Laptop GPU였고 VRAM은 약 8 GB였습니다. 초기 driver는 `591.74`였으며, `nvidia-smi`는 CUDA 지원 버전을 `13.1`로 표시했습니다.

그러나 CUDA Toolkit은 설치돼 있지 않았습니다. `nvcc` 명령이 없었고, `CUDA_PATH`도 없었으며, CUDA Toolkit directory도 존재하지 않았습니다. `nvidia-smi`의 CUDA 표시는 현재 driver가 지원하는 CUDA 수준이지, 같은 버전의 Toolkit이 system에 설치됐다는 뜻이 아닙니다. 이 구분을 출발 상태에 명시했습니다.

앞 단계에서 검증한 Windows project와 WSL2 distribution은 그대로 유지했습니다. 목표는 기존 기준선을 대체하는 별도 GPU 환경을 만드는 것이 아니라, Windows Native와 WSL2 양쪽에 검증 가능한 GPU 연구 계층을 추가하는 것이었습니다.

## 2. 최신 공식 지원 버전을 선택한 이유

이 연구 워크스테이션은 적어도 1년 이상 사용할 예정입니다. 그래서 당장의 마찰을 최소화하는 보수적인 구버전만 고르기보다, 구축 시점에 공식 지원되는 최신 stack을 우선했습니다. Ubuntu 26.04.1 LTS를 선택했던 앞 단계와 같은 수명주기 판단입니다.

물론 최신 조합은 구성요소 사이의 간격을 드러냈습니다. System CUDA Toolkit은 `13.4`였지만 PyTorch wheel은 CUDA `13.2` runtime을 포함했고, llama.cpp의 첫 CUDA build에는 HTTPS 기능이 없었으며, 최신 Transformers API는 처음 작성한 smoke-test code의 가정과 달랐습니다.

이 차이를 버전 선택의 실패로 보지는 않았습니다. 공식 지원 범위 안에서 실제로 통과하는 경로를 찾고, 마찰이 발생한 지점과 수정 근거를 함께 기록하는 것이 장기 연구환경에는 더 유용하다고 판단했습니다.

## 3. MSVC와 CMake build toolchain 마련

CUDA C++와 source build를 위해 먼저 Windows x64 C++ toolchain을 마련했습니다.

| 구성요소                  | 확인한 버전과 상태                                |
| ------------------------- | ------------------------------------------------- |
| Visual Studio Build Tools | `2026 18.10.1`                                    |
| MSVC                      | `19.51.36257`, x64                                |
| `cl.exe`                  | Visual Studio Developer environment에서 실행 성공 |
| CMake                     | `4.4.3`, 이후 llama.cpp source build에 사용       |

단순히 설치 목록만 확인하지 않고 Visual Studio Developer environment에서 `cl.exe`가 실제로 실행되는지 확인했습니다. CMake `4.4.3`은 뒤이어 설치했고, 이 조합은 CUDA smoke test와 llama.cpp build의 공통 기반이 됐습니다.

## 4. NVIDIA driver 갱신

NVIDIA driver를 `591.74`에서 `616.92`로 갱신했습니다. 최종 확인 상태는 NVIDIA kernel-mode driver(KMD) `616.92`, CUDA user-mode driver(UMD) `13.4`였습니다. 갱신 뒤에도 RTX 5060은 정상적으로 식별됐습니다.

Driver 설치 직후의 상태만으로 판정을 끝내지 않았습니다. Windows를 재부팅한 뒤에도 driver `616.92`, CUDA UMD `13.4`와 RTX 5060 식별 상태가 유지되는 것을 다시 확인했습니다. 이후 Windows와 WSL의 GPU 경로는 이 driver 기준선 위에서 검증했습니다.

## 5. CUDA Toolkit 13.4 설치

Windows system에는 CUDA Toolkit `13.4`를 설치했습니다. 최종 상태는 다음과 같습니다.

| 확인 항목       | 결과                                                       |
| --------------- | ---------------------------------------------------------- |
| `nvcc`          | `V13.4.92`                                                 |
| `CUDA_PATH`     | `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.4` |
| Toolkit version | `13.4`                                                     |

이제 driver가 CUDA를 지원한다는 상태와 compiler·header·library를 포함한 Toolkit이 설치된 상태가 분리돼 확인됐습니다. 다만 version 출력만으로는 CUDA Toolkit Gate를 통과한 것으로 보지 않았습니다. 실제 device code를 compile하고 RTX 5060에서 실행하는 단계가 필요했습니다.

## 6. 실제 CUDA C++ smoke test

CUDA C++ smoke test는 RTX 5060의 Compute Capability `12.0`에 맞춰 `sm_120`으로 compile했습니다. Test는 `1,048,576`개의 `float` element에 vector addition을 수행했습니다.

Host-to-device copy, kernel launch, synchronisation, device-to-host copy와 결과 검증을 모두 거쳤습니다. GPU가 이름만 조회되는지 확인하는 probe가 아니라 compiler, runtime, memory transfer와 실제 kernel execution을 한 경로에서 검증한 것입니다.

```text
CUDA smoke test PASS
```

RTX 5060은 Compute Capability `12.0`으로 보고됐고 최종 결과도 일치했습니다. 이 실제 compile-and-run 결과를 Windows CUDA Toolkit Gate의 기준으로 삼았습니다.

## 7. Windows에서 PyTorch CUDA 검증

Windows PyTorch project는 다음 위치에 구성했습니다.

```text
D:\Lab\Research\pytorch-smoke-test
```

Python `3.12`, uv `0.12.17` 환경에 PyTorch `2.14.0+cu132`를 설치했습니다. PyTorch가 포함한 CUDA runtime은 `13.2`였고, `torch.cuda.is_available()`은 `True`를 반환했습니다. RTX 5060과 capability `(12, 0)`도 정상적으로 식별됐습니다.

여기서 system CUDA Toolkit `13.4`와 PyTorch wheel의 CUDA runtime `13.2`는 서로 다른 계층입니다. Prebuilt PyTorch wheel은 자신이 포함한 runtime을 사용하므로, 정상적인 실행을 위해 두 version이 반드시 정확히 같아야 하는 것은 아닙니다. System Toolkit은 직접 CUDA C++를 build한 앞 단계에서, framework runtime은 PyTorch workload에서 각각 검증했습니다.

실제 matrix multiplication을 `cuda:0`에서 실행했고 결과가 성공적으로 반환됐습니다. 이로써 PyTorch가 GPU 이름만 조회한 것이 아니라 tensor 연산을 RTX 5060에서 수행하는 것을 확인했습니다.

## 8. Windows GPU smoke benchmark

같은 Windows project에서 `4096 × 4096` matrix multiplication을 실행해 반복 비교에 사용할 초기 값을 남겼습니다.

| 정밀도 | 관찰 시간  | 환산 처리량       | Peak CUDA memory |
| ------ | ---------- | ----------------- | ---------------- |
| FP32   | `14.86 ms` | 약 `9.25 TFLOPS`  | `224 MiB`        |
| FP16   | `4.36 ms`  | 약 `31.54 TFLOPS` | `224 MiB`        |

이 값은 해당 시점의 local smoke-test baseline입니다. 공식 GPU 성능 사양이나 광범위한 benchmark 결과로 해석하지 않습니다. 동일한 test 조건에서 환경 변화 뒤의 이상을 살피기 위한 비교점으로만 사용합니다.

## 9. WSL2를 통한 GPU 접근 경로

WSL 환경은 Ubuntu `26.04.1 LTS`, kernel `6.18.33.2-microsoft-standard-WSL2`였습니다. WSL 안에서 RTX 5060이 보였고, WSL의 NVIDIA-SMI는 `615.71.08`을 표시했습니다. Windows KMD는 `616.92`, CUDA UMD는 `13.4`였습니다.

`/usr/lib/wsl/lib/libcuda.so*`와 `/dev/dxg`가 존재하는 것도 확인했습니다. WSL 안에는 별도의 Linux NVIDIA display driver를 설치하지 않았습니다. GPU 접근은 Windows NVIDIA driver가 WSL에 제공하는 경로를 사용합니다.

이 구조를 지키는 것은 중요했습니다. Windows driver와 경쟁할 Linux display driver를 distribution 안에 중복 설치하지 않고, WSL에서 제공되는 GPU paravirtualisation path 위에 Linux research runtime을 구성했습니다.

## 10. WSL 안의 PyTorch CUDA

uv `0.12.17`은 Windows와 별도로 WSL 안에 설치했습니다. WSL Native project는 `/mnt/d`가 아니라 Linux filesystem의 다음 위치에 두었습니다.

```text
~/research/pytorch-smoke-test
```

이 project에는 Python `3.12`와 PyTorch `2.14.0+cu132`를 사용했습니다. PyTorch CUDA runtime은 Windows와 같은 `13.2`였고, `torch.cuda.is_available()`은 `True`였습니다. RTX 5060과 capability `(12, 0)`도 정상적으로 확인됐습니다.

Windows에서 사용한 것과 같은 CUDA matrix multiplication test를 WSL에서도 실행했고 성공했습니다. 앞 Note에서 검증한 Linux Native project 경로가 이제 실제 GPU tensor workload까지 이어졌습니다.

## 11. Windows와 WSL 측정값 관찰

WSL의 같은 smoke workload에서는 FP32 `14.88 ms`, 약 `9.23 TFLOPS`, FP16 `4.34 ms`, 약 `31.64 TFLOPS`가 관찰됐습니다. Peak CUDA memory는 `224 MiB`였습니다.

| 환경    | FP32                         | FP16                         | Peak memory |
| ------- | ---------------------------- | ---------------------------- | ----------- |
| Windows | `14.86 ms`, 약 `9.25 TFLOPS` | `4.36 ms`, 약 `31.54 TFLOPS` | `224 MiB`   |
| WSL2    | `14.88 ms`, 약 `9.23 TFLOPS` | `4.34 ms`, 약 `31.64 TFLOPS` | `224 MiB`   |

이 특정 matrix multiplication smoke workload에서는 두 경로의 값이 사실상 같았습니다. 그러나 이를 WSL의 GPU overhead가 언제나 0이라는 일반 명제로 확대하지 않습니다. Model, I/O, memory pressure와 workload 형태가 달라지면 결과도 달라질 수 있습니다. 이번 기록의 의미는 두 경로 모두 같은 test를 안정적으로 통과했고 초기 비교값을 확보했다는 데 있습니다.

## 12. Model storage를 D:로 분리

Model과 cache는 크기가 빠르게 늘고 OS 재설치 주기와도 분리할 필요가 있습니다. 앞서 정한 storage architecture에 맞춰 최종 위치를 D: 아래로 통일했습니다.

| 자산               | 최종 위치                   |
| ------------------ | --------------------------- |
| Ollama model       | `D:\Lab\Models\Ollama`      |
| llama.cpp cache    | `D:\Lab\Models\llama.cpp`   |
| Hugging Face cache | `D:\Lab\Models\HuggingFace` |

User environment에는 `OLLAMA_MODELS`, `LLAMA_CACHE`, `HF_HUB_CACHE`를 저장했습니다. **Ollama Desktop**의 **Model location**도 `D:\Lab\Models\Ollama`로 설정했습니다.

현재 Ollama Desktop application에는 자체 Model location 설정이 있었으므로, 초기의 경로 혼동을 upstream bug로 기록하지 않았습니다. GUI 설정과 environment variable을 같은 D: 경로로 맞췄고 재부팅 뒤에도 그 상태가 유지됐다는 것이 확인된 사실입니다. 두 mechanism 중 어느 쪽이 우선하는지는 이번 검증으로 단정하지 않습니다.

## 13. Ollama와 Qwen3.5 GPU inference

**Ollama** `0.34.2`에 `qwen3.5:4b` model을 배치했습니다. Model 크기는 약 `3.4 GB`, context는 `4096`이었습니다.

Model은 정상적으로 load됐고 interactive inference가 성공했습니다. `ollama ps`는 `100% GPU`를 보고했으며, 관찰한 VRAM 사용량은 약 `3.8 GB`였습니다. 이는 RTX 5060의 Local LLM 경로가 단순한 model inventory를 넘어 실제 GPU inference까지 도달했음을 보여줬습니다.

이 수치는 해당 model과 당시 runtime 상태에 대한 관찰입니다. 다른 context length, model, 동시 요청이나 runtime 설정에서도 같은 memory 사용량을 보장한다는 뜻은 아닙니다.

## 14. Ollama local API와 재부팅 지속성

Local API는 `http://127.0.0.1:11434/api/chat`에서 호출했고, test는 정확히 다음 문자열을 반환했습니다.

```text
Ollama API PASS
```

Warm API 호출에서 관찰한 세부 값은 다음과 같습니다.

| 항목           | 관찰값                                         |
| -------------- | ---------------------------------------------- |
| Prompt         | `21` tokens, `141645000 ns`, 약 `148 tokens/s` |
| Generation     | `6` tokens, `70365000 ns`, 약 `85 tokens/s`    |
| Load duration  | `1596500 ns`                                   |
| Total duration | `323625900 ns`                                 |

Windows 재부팅 뒤에는 Ollama server가 `127.0.0.1:11434`에서 자동으로 listen했고, `ollama ls`에도 `qwen3.5:4b`가 남아 있었습니다. D: model location도 유지됐습니다. Local API와 model storage를 포함한 재부팅 지속성을 Ollama runtime의 `PASS` 조건에 포함했습니다.

## 15. llama.cpp를 CUDA로 source build

llama.cpp는 prebuilt binary만 사용하는 대신 local source build를 수행했습니다. 관찰한 version은 `0.4.1-dev`, build `1`, commit `b29c606`이었습니다. MSVC `19.51.36257.0` x64와 CMake `4.4.3`을 사용했습니다.

CUDA build는 `GGML_CUDA=ON`, `CMAKE_CUDA_ARCHITECTURES=120`으로 구성했습니다. Build된 runtime은 RTX 5060을 `CUDA0`으로 식별했고 약 `8123 MiB`를 보고했습니다.

이 단계는 CUDA Toolkit Gate와 C++ build toolchain이 실제 research software의 source build까지 이어지는지 확인한 사례였습니다. 다만 첫 build는 GPU를 정상적으로 식별하면서도 Hugging Face의 `-hf` model retrieval에는 필요한 HTTPS support를 포함하지 않았습니다.

## 16. BoringSSL로 HTTPS 기능 추가

첫 CUDA build에서 `-hf` retrieval을 실행했을 때, HTTPS를 사용하려면 다음 중 하나가 필요하다는 error가 나타났습니다.

- `LLAMA_BUILD_BORINGSSL=ON`
- `LLAMA_BUILD_LIBRESSL=ON`
- `LLAMA_OPENSSL=ON`

Model을 수동으로 내려받아 문제를 우회하는 대신 build configuration을 다음과 같이 바꿨습니다.

```text
LLAMA_BUILD_BORINGSSL=ON
```

Rebuild 뒤에는 `ggml-org/gemma-3-1b-it-GGUF:Q4_K_M` model의 HTTPS download가 성공했습니다. `-ngl all`로 실제 CUDA inference를 실행했고, `nvidia-smi`에서도 `llama-cli.exe`가 GPU를 사용하는 것을 확인했습니다. 관찰한 VRAM 사용량은 약 `962 MiB`, prompt baseline은 `255.6 tokens/s`, generation baseline은 `204.8 tokens/s`였습니다.

최신 환경에서 만난 friction은 GPU compatibility failure가 아니라 optional HTTPS build capability가 빠진 상태였습니다. Error가 제시한 build option을 근거로 configuration을 고쳐 source build와 model retrieval을 하나의 재현 가능한 경로로 연결했습니다.

## 17. Transformers 직접 CUDA inference와 API 변화

세 번째 Local LLM 경로는 Transformers `5.17.0`, PyTorch `2.14.0+cu132`, `Qwen/Qwen3-0.6B` model을 사용한 FP16 direct CUDA inference였습니다. Hugging Face cache는 D: 경로를 사용했습니다.

첫 smoke test는 `apply_chat_template()`가 tensor를 직접 반환한다고 가정해 실패했습니다. 현재 API에 맞춰 다음과 같이 수정했습니다.

- `return_dict=True` 사용
- `model.generate(**inputs)` 호출
- `inputs["input_ids"]`로 input length 확인
- Deprecated `torch_dtype=` 대신 `dtype=` 사용

수정 뒤 direct CUDA inference가 성공했습니다. Generated token은 `128`, elapsed time은 `18.283 s`, generation baseline은 `7.0 tokens/s`, peak CUDA memory는 `1186 MiB`였습니다. Public Hugging Face model에는 인증 없이 접근했고 rate-limit warning이 나타났지만 기능 실패로 이어지지는 않았습니다.

이 `7.0 tokens/s`를 Ollama나 llama.cpp의 수치와 직접 비교하지 않습니다. Model, quantisation, precision, prompt와 inference stack이 서로 다르기 때문입니다. 여기서 확인한 것은 Transformers/PyTorch를 통한 세 번째 독립 GPU 실행 경로와 최신 API에 맞춘 code path입니다.

## 18. 재부팅 지속성과 manifest 기록

전체 Windows 재부팅 뒤 다음 상태가 유지되는지 다시 확인했습니다.

| 범위                  | 재확인한 상태                                                   |
| --------------------- | --------------------------------------------------------------- |
| Driver와 CUDA         | NVIDIA driver `616.92`, CUDA UMD `13.4`, `nvcc 13.4 / V13.4.92` |
| Build tool            | CMake `4.4.3`                                                   |
| Model runtime         | Ollama `0.34.2`, local server와 `qwen3.5:4b` visibility         |
| Environment variables | `CUDA_PATH`, `OLLAMA_MODELS`, `HF_HUB_CACHE`, `LLAMA_CACHE`     |
| GPU framework         | Windows PyTorch CUDA detection, llama.cpp CUDA device detection |
| Storage               | D: model storage path                                           |

검증 상태는 `D:\Lab\OfflineLab\manifests\` 아래 세 manifest에도 기록했습니다.

| 파일                       | 기록 범위                                     |
| -------------------------- | --------------------------------------------- |
| `gpu-windows-baseline.txt` | Windows driver, Toolkit, PyTorch와 GPU 기준선 |
| `gpu-wsl-baseline.txt`     | WSL GPU path와 PyTorch 기준선                 |
| `local-llm-baseline.txt`   | Model storage와 세 Local LLM runtime 기준선   |

이 파일들은 이후 상태 비교와 재구축 판단을 위한 증거입니다. Model 자체나 전체 환경의 full backup도 아니고, 자동 restore mechanism도 아닙니다.

## 19. GPU·Local LLM 기준선 PASS

이번 단계의 최종 판정은 다음과 같습니다.

| Gate                             | 결과   | 확인 기준                                                      |
| -------------------------------- | ------ | -------------------------------------------------------------- |
| Windows CUDA Toolkit Gate        | `PASS` | `sm_120` compile, memory copy, kernel 실행과 결과 검증         |
| Windows PyTorch CUDA Gate        | `PASS` | RTX 5060 식별과 `cuda:0` matrix multiplication                 |
| WSL GPU Access Gate              | `PASS` | Windows driver path, `/dev/dxg`, `libcuda.so`와 GPU visibility |
| WSL PyTorch CUDA Gate            | `PASS` | WSL Native project의 CUDA matrix multiplication                |
| Ollama Local LLM Runtime         | `PASS` | GPU inference, local API, D: model과 reboot persistence        |
| llama.cpp CUDA Runtime           | `PASS` | CUDA source build, HTTPS retrieval와 `-ngl all` inference      |
| Transformers Direct CUDA Runtime | `PASS` | FP16 model load와 PyTorch direct generation                    |
| Reboot / Persistence             | `PASS` | Driver, toolchain, variables, runtime과 storage path 재확인    |

Windows Native와 WSL2는 이제 모두 실제 CUDA·PyTorch workload를 통과한 GPU 연구 경로입니다. System CUDA `13.4`와 PyTorch runtime `13.2`의 역할을 분리했고, Windows와 WSL의 측정값은 이 smoke workload에 한정된 초기 비교 기준으로 남겼습니다.

Local LLM도 Ollama, llama.cpp, Transformers/PyTorch라는 서로 다른 세 실행 경로에서 검증했습니다. 과정에서 HTTPS build option과 Transformers API 변화 같은 compatibility friction을 만났지만, 이를 우회해 감추기보다 원인 범위를 확인하고 재현 가능한 수정으로 연결했습니다.

다음 연구 계층은 이 기준선 위에서 embeddings, RAG, offline-ready asset과 반복 가능한 AI experiment 같은 workflow로 확장할 수 있습니다. 구체적인 순서는 아직 고정하지 않되, 이번에 남긴 smoke test와 manifest를 이후 변화의 비교점으로 사용합니다.
