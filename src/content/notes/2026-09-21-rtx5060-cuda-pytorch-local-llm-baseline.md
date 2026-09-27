---
title: "RTX 5060 CUDA·PyTorch와 Local LLM 구축"
description: "Windows와 WSL2에서 RTX 5060의 CUDA·PyTorch 경로와 세 가지 Local LLM 런타임을 실제 작업과 재부팅 후 지속성으로 검증합니다."
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

「Windows 개발환경과 WSL2 검증」에서는 Windows와 WSL2의 두 개발 경로를 실제 프로젝트와 재부팅까지 확인했습니다. 이번에는 그 기준선을 유지한 채 RTX 5060을 CUDA·PyTorch 연구와 Local LLM 실행에 사용할 수 있는지 검증했습니다.

시스템 CUDA, 프레임워크에 포함된 CUDA 런타임, 모델 실행 도구와 저장소의 역할을 구분하고 각각 실제 작업으로 시험했습니다. 최신 공식 지원 버전을 선택하면서 만난 호환성 문제와 해결 과정도 다음 재구축에 참고할 수 있도록 기록했습니다.

GPU 연산, 모델 추론, 로컬 API와 저장소 경로가 동작하고, 필요한 상태가 재부팅 뒤에도 유지되는 것을 이번 `PASS`의 조건으로 삼았습니다.

## 1. Windows·WSL 기준선 위에서 시작하기

시작 시점의 GPU는 NVIDIA GeForce RTX 5060 Laptop GPU였고 VRAM은 약 8 GB였습니다. 초기 드라이버는 `591.74`였으며, `nvidia-smi`는 CUDA 지원 버전을 `13.1`로 표시했습니다.

CUDA Toolkit은 설치돼 있지 않았습니다. `nvcc` 명령과 `CUDA_PATH`, Toolkit 디렉터리가 모두 없었습니다. `nvidia-smi`의 CUDA 표시는 현재 드라이버의 지원 수준이며, 같은 버전의 Toolkit 설치 여부와는 구분해야 합니다.

앞 단계의 Windows 프로젝트와 WSL2 배포판을 유지하면서 양쪽에 GPU 연구환경을 추가했습니다.

## 2. 최신 공식 지원 버전을 선택한 이유

이 연구 워크스테이션은 적어도 1년 이상 사용할 예정입니다. 그래서 당장의 마찰을 최소화하는 보수적인 구버전만 고르기보다, 구축 시점에 공식 지원되는 최신 구성을 우선했습니다. Ubuntu 26.04.1 LTS를 선택했던 앞 단계와 같은 수명주기 판단입니다.

최신 조합에서는 구성요소 간 차이가 드러났습니다. 시스템 CUDA Toolkit은 `13.4`였지만 PyTorch wheel은 CUDA `13.2` 런타임을 포함했고, llama.cpp의 첫 CUDA 빌드에는 HTTPS 기능이 없었습니다. Transformers API의 반환 구조도 처음 작성한 시험 코드의 가정과 달랐습니다.

공식 지원 범위 안에서 동작하는 조합을 찾고, 문제가 발생한 지점과 수정 근거를 기록하는 것이 장기 연구환경에 유용하다고 판단했습니다.

## 3. MSVC와 CMake 빌드 도구 마련

CUDA C++와 소스 빌드를 위해 먼저 Windows x64 C++ 빌드 도구을 마련했습니다.

| 구성요소                  | 확인한 버전과 상태                         |
| ------------------------- | ------------------------------------------ |
| Visual Studio Build Tools | `2026 18.10.1`                             |
| MSVC                      | `19.51.36257`, x64                         |
| `cl.exe`                  | Visual Studio Developer 환경에서 실행 성공 |
| CMake                     | `4.4.3`, 이후 llama.cpp 소스 빌드에 사용   |

Visual Studio Developer 환경에서 `cl.exe` 실행을 확인했습니다. 뒤이어 CMake `4.4.3`을 설치했고, 이 조합을 CUDA smoke test와 llama.cpp 빌드에 사용했습니다.

## 4. NVIDIA 드라이버 갱신

NVIDIA 드라이버를 `591.74`에서 `616.92`로 갱신했습니다. 최종 확인 상태는 NVIDIA 커널 모드 드라이버(KMD) `616.92`, CUDA 사용자 모드 드라이버(UMD) `13.4`였습니다. 갱신 뒤에도 RTX 5060은 정상적으로 식별됐습니다.

Windows 재부팅 뒤에도 드라이버 `616.92`, CUDA UMD `13.4`와 RTX 5060 식별 상태가 유지됐습니다. 이후 Windows와 WSL의 GPU 경로는 이 상태에서 검증했습니다.

## 5. CUDA Toolkit 13.4 설치

Windows 시스템에는 CUDA Toolkit `13.4`를 설치했습니다. 최종 상태는 다음과 같습니다.

| 확인 항목    | 결과                                                       |
| ------------ | ---------------------------------------------------------- |
| `nvcc`       | `V13.4.92`                                                 |
| `CUDA_PATH`  | `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.4` |
| Toolkit 버전 | `13.4`                                                     |

컴파일러·헤더·라이브러리를 포함한 Toolkit 설치를 확인한 뒤, 장치 코드를 컴파일하고 RTX 5060에서 실행해 CUDA Toolkit Gate를 검증했습니다.

## 6. 실제 CUDA C++ smoke test

CUDA C++ smoke test는 RTX 5060의 Compute Capability `12.0`에 맞춰 `sm_120`으로 컴파일했습니다. `1,048,576`개의 `float` 원소에 벡터 덧셈을 수행하는 시험입니다.

호스트에서 장치로의 복사, 커널 실행, 동기화, 장치에서 호스트로의 복사와 결과 검증을 모두 거쳤습니다.

```text
CUDA smoke test PASS
```

RTX 5060은 Compute Capability `12.0`으로 보고됐고 최종 결과도 일치했습니다. 이 실제 컴파일·실행 결과를 Windows CUDA Toolkit Gate의 기준으로 삼았습니다.

## 7. Windows에서 PyTorch CUDA 검증

Windows PyTorch 프로젝트는 다음 위치에 구성했습니다.

```text
D:\Lab\Research\pytorch-smoke-test
```

Python `3.12`, uv `0.12.17` 환경에 PyTorch `2.14.0+cu132`를 설치했습니다. PyTorch가 포함한 CUDA 런타임은 `13.2`였고, `torch.cuda.is_available()`은 `True`를 반환했습니다. RTX 5060과 capability `(12, 0)`도 정상적으로 식별됐습니다.

여기서 시스템 CUDA Toolkit `13.4`와 PyTorch wheel의 CUDA 런타임 `13.2`는 서로 다른 계층입니다. 사전 빌드된 PyTorch wheel은 자신이 포함한 런타임을 사용하므로, 정상적인 실행을 위해 두 버전이 반드시 정확히 같아야 하는 것은 아닙니다. 시스템 Toolkit은 직접 CUDA C++를 빌드한 앞 단계에서, 프레임워크 런타임은 PyTorch 작업 부하에서 각각 검증했습니다.

`cuda:0`에서 행렬곱을 실행했고 결과가 성공적으로 반환됐습니다. PyTorch가 RTX 5060에서 텐서 연산을 수행하는 것을 확인했습니다.

## 8. Windows GPU smoke 벤치마크

같은 Windows 프로젝트에서 `4096 × 4096` 행렬곱을 실행해 반복 비교에 사용할 초기 값을 남겼습니다.

| 정밀도 | 관찰 시간  | 환산 처리량       | 최대 CUDA 메모리 |
| ------ | ---------- | ----------------- | ---------------- |
| FP32   | `14.86 ms` | 약 `9.25 TFLOPS`  | `224 MiB`        |
| FP16   | `4.36 ms`  | 약 `31.54 TFLOPS` | `224 MiB`        |

처리량은 행렬곱의 이론적 연산량을 약 2N³ FLOPs로 두고 측정 시간에서 환산한 근사값입니다. 이 값은 해당 시점의 로컬 시험 기준값이며, 공식 GPU 성능 사양이나 광범위한 벤치마크 결과로 해석하지 않습니다. 동일한 시험 조건에서 환경 변화 뒤의 이상을 살피기 위한 비교점으로만 사용합니다.

## 9. WSL2를 통한 GPU 접근 경로

WSL 환경은 Ubuntu `26.04.1 LTS`, 커널 `6.18.33.2-microsoft-standard-WSL2`였습니다. WSL 안에서 RTX 5060이 보였고, WSL의 NVIDIA-SMI는 `615.71.08`을 표시했습니다. Windows KMD는 `616.92`, CUDA UMD는 `13.4`였습니다.

`/usr/lib/wsl/lib/libcuda.so*`와 `/dev/dxg`가 존재하는 것도 확인했습니다. WSL 안에는 별도의 Linux NVIDIA 디스플레이 드라이버를 설치하지 않았습니다. GPU 접근은 Windows NVIDIA 드라이버가 WSL에 제공하는 경로를 사용합니다.

Linux 연구 런타임은 WSL이 제공하는 GPU 준가상화 경로 위에 구성했습니다.

## 10. WSL 안의 PyTorch CUDA

uv `0.12.17`은 Windows와 별도로 WSL 안에 설치했습니다. WSL 프로젝트는 `/mnt/d`가 아니라 Linux 파일시스템의 다음 위치에 두었습니다.

```text
~/research/pytorch-smoke-test
```

이 프로젝트에는 Python `3.12`와 PyTorch `2.14.0+cu132`를 사용했습니다. PyTorch CUDA 런타임은 Windows와 같은 `13.2`였고, `torch.cuda.is_available()`은 `True`였습니다. RTX 5060과 capability `(12, 0)`도 정상적으로 확인됐습니다.

Windows에서 사용한 것과 같은 CUDA 행렬곱 시험을 WSL에서도 실행했고 성공했습니다. 앞 노트에서 검증한 Linux 프로젝트 경로가 이제 실제 GPU 텐서 작업 부하까지 이어졌습니다.

## 11. Windows와 WSL 측정값 관찰

WSL의 같은 smoke 작업 부하에서는 FP32 `14.88 ms`, 약 `9.23 TFLOPS`, FP16 `4.34 ms`, 약 `31.64 TFLOPS`가 관찰됐습니다. 최대 CUDA 메모리는 `224 MiB`였습니다.

| 환경    | FP32                         | FP16                         | 최대 메모리 |
| ------- | ---------------------------- | ---------------------------- | ----------- |
| Windows | `14.86 ms`, 약 `9.25 TFLOPS` | `4.36 ms`, 약 `31.54 TFLOPS` | `224 MiB`   |
| WSL2    | `14.88 ms`, 약 `9.23 TFLOPS` | `4.34 ms`, 약 `31.64 TFLOPS` | `224 MiB`   |

이 특정 행렬곱 smoke 작업 부하에서는 Windows Native와 WSL2의 측정값이 거의 동일했습니다. 다만 이 결과만으로 WSL2의 GPU 오버헤드가 항상 없다고 일반화할 수는 없습니다. CPU와 GPU 사이의 데이터 이동, 메모리 접근 패턴, I/O, 연산 종류와 같은 작업 부하 특성이 달라지면 두 환경의 차이도 달라질 수 있습니다. 이번 비교의 의미는 동일한 PyTorch CUDA 작업 부하가 두 경로에서 모두 정상적으로 실행됐고, 이후 환경 변화와 비교할 초기 기준값을 확보했다는 데 있습니다.

## 12. 모델 저장소를 D:로 분리

모델과 캐시는 크기가 빠르게 늘어 OS 재설치 주기와 분리할 필요가 있습니다. 앞서 정한 저장소 설계에 맞춰 최종 위치를 D: 아래로 통일했습니다.

| 자산              | 최종 위치                   |
| ----------------- | --------------------------- |
| Ollama 모델       | `D:\Lab\Models\Ollama`      |
| llama.cpp 캐시    | `D:\Lab\Models\llama.cpp`   |
| Hugging Face 캐시 | `D:\Lab\Models\HuggingFace` |

사용자 환경 변수에 `OLLAMA_MODELS`, `LLAMA_CACHE`, `HF_HUB_CACHE`를 저장했습니다. **Ollama Desktop**의 **Model location**도 `D:\Lab\Models\Ollama`로 설정했습니다.

Ollama Desktop에는 자체 **Model location** 설정이 있어 초기 경로 혼동을 제품의 버그로 단정하지 않았습니다. GUI 설정과 환경 변수를 같은 D: 경로로 맞춘 뒤 재부팅 후에도 유지되는 것을 확인했습니다. 두 설정 중 어느 쪽이 우선하는지는 확인하지 못했습니다.

## 13. Ollama와 Qwen3.5 GPU 추론

**Ollama** `0.34.2`에 `qwen3.5:4b` 모델을 배치했습니다. 모델 크기는 약 `3.4 GB`, 컨텍스트는 `4096`이었습니다.

모델 로딩과 대화형 추론이 성공했습니다. `ollama ps`는 `100% GPU`를 보고했으며, 관찰한 VRAM 사용량은 약 `3.8 GB`였습니다.

이 수치는 해당 모델과 당시 런타임에서 관찰한 값입니다. 컨텍스트 길이, 모델, 동시 요청 수와 런타임 설정에 따라 메모리 사용량은 달라질 수 있습니다.

## 14. Ollama 로컬 API와 재부팅 지속성

로컬 API는 `http://127.0.0.1:11434/api/chat`에서 호출했고, 시험은 정확히 다음 문자열을 반환했습니다.

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

Windows 재부팅 뒤 Ollama 서버가 `127.0.0.1:11434`에서 자동으로 연결을 수신했고, `ollama ls`에도 `qwen3.5:4b`가 남아 있었습니다. D: 모델 저장 위치도 유지됐습니다. 로컬 API와 모델 저장소를 포함한 재부팅 검증을 Ollama 런타임의 `PASS` 조건에 포함했습니다.

## 15. llama.cpp를 CUDA로 소스 빌드

llama.cpp는 사전 빌드된 바이너리만 사용하는 대신 로컬 소스 빌드를 수행했습니다. 관찰한 버전은 `0.4.1-dev`, 빌드 `1`, 커밋 `b29c606`이었습니다. MSVC `19.51.36257.0` x64와 CMake `4.4.3`을 사용했습니다.

CUDA 빌드는 `GGML_CUDA=ON`, `CMAKE_CUDA_ARCHITECTURES=120`으로 구성했습니다. 빌드된 런타임은 RTX 5060을 `CUDA0`으로 식별했고 약 `8123 MiB`를 보고했습니다.

첫 빌드는 GPU를 정상적으로 식별했지만, Hugging Face의 `-hf` 모델 다운로드에 필요한 HTTPS 기능을 포함하지 않았습니다.

## 16. BoringSSL로 HTTPS 기능 추가

첫 CUDA 빌드에서 `-hf` 다운로드를 시도하자 HTTPS를 사용하려면 다음 중 하나가 필요하다는 오류가 나타났습니다.

- `LLAMA_BUILD_BORINGSSL=ON`
- `LLAMA_BUILD_LIBRESSL=ON`
- `LLAMA_OPENSSL=ON`

모델 다운로드 기능을 빌드에 포함하도록 설정을 다음과 같이 바꿨습니다.

```text
LLAMA_BUILD_BORINGSSL=ON
```

재빌드 뒤에는 `ggml-org/gemma-3-1b-it-GGUF:Q4_K_M` 모델의 HTTPS 다운로드가 성공했습니다. `-ngl all`로 실제 CUDA 추론을 실행했고, `nvidia-smi`에서도 `llama-cli.exe`가 GPU를 사용하는 것을 확인했습니다. 관찰한 VRAM 사용량은 약 `962 MiB`, 프롬프트 처리 속도는 `255.6 tokens/s`, 생성 속도는 `204.8 tokens/s`였습니다.

오류가 제시한 빌드 옵션으로 HTTPS 백엔드를 추가해 다운로드 문제를 해결했습니다.

## 17. Transformers 직접 CUDA 추론과 API 변화

세 번째 Local LLM 경로는 Transformers `5.17.0`, PyTorch `2.14.0+cu132`, `Qwen/Qwen3-0.6B` 모델을 사용한 FP16 직접 CUDA 추론이었습니다. Hugging Face 캐시는 D: 경로를 사용했습니다.

첫 smoke test는 `apply_chat_template()`의 반환값을 텐서로 직접 다룰 수 있다고 가정해 실패했습니다. 이번에 설치한 Transformers `5.17.0` 환경의 실제 반환 구조에 맞춰 다음과 같이 수정했습니다.

- `return_dict=True` 사용
- `model.generate(**inputs)` 호출
- `inputs["input_ids"]`로 입력 길이 확인
- 사용 중단이 예고된 `torch_dtype=` 대신 `dtype=` 사용

수정 뒤 직접 CUDA 추론이 성공했습니다. `128`개 토큰 생성에 `18.283 s`가 걸렸으며, 생성 속도는 `7.0 tokens/s`, 최대 CUDA 메모리 사용량은 `1186 MiB`였습니다. 공개 Hugging Face 모델에 인증 없이 접근하면서 요청 제한 경고가 나타났지만 기능 실패로 이어지지는 않았습니다.

모델, 양자화, 정밀도, 프롬프트와 추론 구성이 달라 이 `7.0 tokens/s`를 Ollama나 llama.cpp의 수치와 직접 비교하지 않습니다. 이번 시험에서는 API에 맞게 수정한 코드로 Transformers/PyTorch의 독립적인 GPU 실행 경로를 확인했습니다.

## 18. 재부팅 지속성과 상태 기록

전체 Windows 재부팅 뒤 다음 상태가 유지되는지 다시 확인했습니다.

| 범위            | 재확인한 상태                                                     |
| --------------- | ----------------------------------------------------------------- |
| 드라이버와 CUDA | NVIDIA 드라이버 `616.92`, CUDA UMD `13.4`, `nvcc 13.4 / V13.4.92` |
| 빌드 도구       | CMake `4.4.3`                                                     |
| 모델 런타임     | Ollama `0.34.2`, 로컬 서버와 `qwen3.5:4b` 식별                    |
| 환경 변수       | `CUDA_PATH`, `OLLAMA_MODELS`, `HF_HUB_CACHE`, `LLAMA_CACHE`       |
| GPU 프레임워크  | Windows PyTorch CUDA 식별, llama.cpp CUDA 장치 식별               |
| 저장소          | D: 모델 저장소 경로                                               |

검증 상태는 `D:\Lab\OfflineLab\manifests\` 아래 세 파일에도 남겼습니다.

| 파일                       | 기록 범위                                       |
| -------------------------- | ----------------------------------------------- |
| `gpu-windows-baseline.txt` | Windows 드라이버, Toolkit, PyTorch와 GPU 기준선 |
| `gpu-wsl-baseline.txt`     | WSL GPU 경로와 PyTorch 기준선                   |
| `local-llm-baseline.txt`   | 모델 저장소와 세 Local LLM 런타임 기준선        |

이 파일들은 이후 상태 비교와 재구축 판단에 사용할 기록입니다. 모델과 전체 환경의 백업이나 자동 복원 기능은 제공하지 않습니다.

## 19. GPU·Local LLM 기준선 PASS

이번 단계의 최종 판정은 다음과 같습니다.

| Gate                             | 결과   | 확인 기준                                                  |
| -------------------------------- | ------ | ---------------------------------------------------------- |
| Windows CUDA Toolkit Gate        | `PASS` | `sm_120` 컴파일, 메모리 복사, 커널 실행과 결과 검증        |
| Windows PyTorch CUDA Gate        | `PASS` | RTX 5060 식별과 `cuda:0` 행렬곱                            |
| WSL GPU Access Gate              | `PASS` | Windows 드라이버 경로, `/dev/dxg`, `libcuda.so`와 GPU 식별 |
| WSL PyTorch CUDA Gate            | `PASS` | WSL 프로젝트의 CUDA 행렬곱                                 |
| Ollama Local LLM Runtime         | `PASS` | GPU 추론, 로컬 API, D: 모델과 재부팅 후 상태 유지          |
| llama.cpp CUDA Runtime           | `PASS` | CUDA 소스 빌드, HTTPS 다운로드와 `-ngl all` 추론           |
| Transformers Direct CUDA Runtime | `PASS` | FP16 모델 로딩과 PyTorch 직접 생성                         |
| Reboot / Persistence             | `PASS` | 드라이버, nvcc·CMake, 변수, 런타임과 저장소 경로 재확인    |

Windows Native와 WSL2는 이제 모두 실제 CUDA·PyTorch 작업 부하를 통과한 GPU 연구 경로입니다. 시스템 CUDA `13.4`와 PyTorch 런타임 `13.2`의 역할을 분리했고, Windows와 WSL의 측정값은 이 smoke 작업 부하에 한정된 초기 비교 기준으로 남겼습니다.

Local LLM은 Ollama, llama.cpp, Transformers/PyTorch의 세 경로에서 검증했습니다. HTTPS 빌드 옵션과 Transformers API 변경에 따른 문제는 원인과 수정 내용을 함께 남겼습니다.

이후에는 이 기준선 위에 임베딩, RAG, 오프라인 자산과 반복 가능한 AI 실험을 구축할 수 있습니다. 구체적인 순서는 아직 정하지 않았으며, 이번 시험과 상태 기록을 이후 변화의 비교점으로 사용할 계획입니다.
