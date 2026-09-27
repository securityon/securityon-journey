---
title: "오프라인 연구환경 검증"
description: "제한망 진입 전 네트워크를 끊고 연구환경을 시험했습니다. WSL 복구와 새 Python 환경의 재구축, llama.cpp 번들 복구 실패와 수정 과정을 기록합니다."
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

「WSL2를 실제 Linux 연구환경으로 완성하기」에서는 오프라인 자산을 준비하며 발견한 WSL 작업환경의 누락을 보완했습니다. Linux 빌드 도구, 격리된 Python 프로젝트, Jupyter와 VS Code Remote WSL을 구성하고, PyTorch·Transformers의 GPU 실행과 공유 모델 접근, 재부팅 후 동작까지 확인했습니다.

이제 외부 네트워크를 실제로 끊어 볼 차례였습니다. `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, `local_files_only=True`, `uv --offline` 같은 설정은 각 도구의 온라인 조회를 막습니다. 이번에는 연결 자체가 없는 상태에서 연구환경을 사용하고, 보존한 자산으로 새 환경을 만들거나 복구할 수 있는지 확인하려 했습니다.

이 글은 Windows 워크스테이션 구축 시리즈의 여덟 번째 노트입니다. 인터넷을 자유롭게 사용할 수 있는 환경에서 제한망 진입을 준비하며, 네트워크 단절 시험과 복구·재구축 시험을 진행했습니다. 그 과정에서 여섯 번째 노트의 `git bundle verify`를 통과한 llama.cpp 번들이 독립된 저장소로 복구되지 않는 문제를 발견했습니다.

## 1. 이번에 확인할 범위

앞선 단계에서 WSL 연구환경과 재부팅 후 동작을 확인했고, OfflineLab에는 설치파일, wheelhouse, 소스, 복구 문서, 체크섬과 manifest를 보관했습니다. 모델은 `D:\Lab\Models`에서 별도로 관리했습니다.

이번 시험에서는 다음 두 가지를 추가로 확인했습니다.

| 앞선 확인             | 이번 확인                                   |
| --------------------- | ------------------------------------------- |
| 도구의 오프라인 모드  | 외부 네트워크를 실제로 끊은 상태에서의 동작 |
| 자산 보존과 해시 기록 | 새 환경 재구축 또는 독립된 환경으로의 복구  |

TensorFlow 정식판의 기존 시험 결과는 그대로 남아 있었습니다. `2.21.0`은 설치됐지만 NVIDIA 라이브러리와 `ptxas` 관련 조치 뒤에도 GPU를 찾지 못했습니다. `2.20.0`은 Compute Capability `12.0`의 RTX 5060을 찾았지만 실행 중 `CUDA_ERROR_INVALID_PTX`, `CUDA_ERROR_INVALID_HANDLE`이 차례로 발생했습니다.

TensorFlow `2.22.0-dev20260923` nightly 개발 빌드(`tf-nightly`)는 일반 `2048 x 2048` GPU 행렬곱과 memory growth 적용 후의 재실행에 성공했습니다. 재실행에서는 앞서 나타난 대규모 메모리 사전 할당 경고가 사라졌습니다. `1024 x 1024` XLA/JIT 연산도 `Compiled cluster using XLA!`와 함께 완료됐고, Compute Capability `12.0a`와 cuDNN `9.26.0` 사용을 확인했습니다. 이 결과는 정식판 채택 전의 시험 결과로 유지했습니다.

## 2. 완성된 WSL 환경 보존

네트워크를 끊기 전에 `Ubuntu-26.04` 배포판을 다음 위치로 내보냈습니다.

```text
D:\Lab\OfflineLab\backups\wsl\Ubuntu-26.04-research-baseline-20260924.tar
```

TAR의 크기는 `20.1 GB`, SHA-256은 다음과 같습니다.

```text
45B37CEA6EAED26A837BC693A2670918514C7A250B23FD8469B5A9B93F72006C
```

스냅샷에는 Ubuntu, Linux 빌드 도구, uv와 연구용 Python, Jupyter 환경, VS Code Server와 원격 확장, PyTorch·Transformers·TensorFlow 프로젝트가 포함됐습니다. 모델은 앞서 정한 저장소 구조에 따라 `D:\Lab\Models`에 별도로 두었습니다.

이 TAR로 환경을 복구할 수 있는지 확인하기 위해 별도 배포판으로 가져와 실행하기로 했습니다.

## 3. 별도 배포판으로 복구 시험

TAR를 `Ubuntu-26.04-RestoreTest`라는 임시 배포판으로 가져왔습니다. 설치 위치는 다음과 같습니다.

```text
D:\Lab\WSL-Restore-Test
```

기존 `Ubuntu-26.04`는 그대로 두었고, `wsl -l -v`에서 두 배포판을 각각 확인했습니다. 복구 시험에는 기존 배포판 대신 새로 가져온 배포판을 사용했습니다.

`wsl --import`는 네트워크 단절 전에 수행했습니다. 복구한 배포판의 기능을 먼저 확인한 뒤 연결을 끊고 시험했으며, 오프라인 상태에서 import를 반복한 것은 아닙니다.

## 4. 복구된 사용자와 프로젝트 확인

복구한 배포판에는 사용자 `securityon`, UID와 GID `1000`, 셸 `/bin/bash`, 예상한 HOME 경로가 있었습니다.

```text
HOME=/home/securityon
```

처음 PowerShell에서 bash 명령을 실행했을 때는 HOME 출력이 잘못된 것처럼 보였습니다. PowerShell이 bash보다 먼저 `$HOME`을 확장한 결과였습니다. WSL에서 직접 확인하자 HOME은 정상이었고, 복구 손상이 아닌 셸 사이의 인용 처리 문제로 확인됐습니다.

`/home/securityon/research`에는 다음 프로젝트가 복구돼 있었습니다.

```text
pytorch-smoke-test
tensorflow-220-smoke-test
tensorflow-nightly-smoke-test
tensorflow-smoke-test
transformers-smoke-test
wsl-research-base
wsl-smoke-test
```

복구한 배포판에서 `/mnt/d/Lab` 접근도 확인했습니다. 결과는 `User_Home_Restore=PASS`, `Research_Project_Restore=PASS`, `Shared_D_Access=PASS`였습니다.

## 5. 네트워크 단절 전 복구 상태 확인

네트워크를 끊기 전에 복구한 배포판의 Linux 빌드 도구, uv, 연구용 Python, Jupyter, 버전이 일치하는 VS Code Server와 원격 확장, `/dev/dxg`, RTX 5060 접근과 프로젝트별 환경을 확인했습니다.

복구한 PyTorch 프로젝트는 PyTorch `2.14.0+cu132`, 포함된 CUDA 런타임 `13.2`, CUDA 사용 가능 여부 `True`, NVIDIA GeForce RTX 5060 Laptop GPU를 보고했습니다. `2048 x 2048` 행렬곱은 `cuda:0`에서 `torch.Size([2048, 2048])`로 완료됐고 `RESTORED WSL PyTorch CUDA PASS`를 출력했습니다.

복구한 Transformers 프로젝트는 `D:\Lab\Models\HuggingFace`를 `/mnt/d/Lab/Models/HuggingFace`로 사용했습니다. `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, `local_files_only=True` 상태에서 `Qwen/Qwen3-0.6B`의 `311 / 311` 가중치를 모두 불러오고 `cuda:0`에서 추론을 완료했습니다. 결과는 `RESTORED WSL Transformers CUDA PASS`였습니다.

한 번의 `uv run`에서는 로컬 `transformers-smoke-test` 프로젝트 패키지가 밀리초 단위로 다시 빌드·설치됐습니다. 이 동작만으로 외부 다운로드가 있었다고 판단하지 않았으며, 이후 연결을 끊은 상태에서도 실행을 확인했습니다.

## 6. 외부 네트워크 단절 확인

워크스테이션을 외부 네트워크에서 실제로 분리한 뒤 접속을 확인했습니다. 이 시험에서는 외부 접속이 차단돼야 `PASS`로 판단했습니다.

| 접속 확인 대상     | 관찰 상태 | 판정   |
| ------------------ | --------- | ------ |
| Windows 외부 HTTPS | `BLOCKED` | `PASS` |
| WSL 외부 네트워크  | `BLOCKED` | `PASS` |
| PyPI               | `BLOCKED` | `PASS` |
| Hugging Face       | `BLOCKED` | `PASS` |

사용 가능한 외부 연결이 없는 상태를 확인해 `Physical_Network_Isolation=PASS`로 기록했습니다. 이후 시험에서는 실제 단절 상태에 각 도구의 오프라인 설정도 함께 적용했습니다.

## 7. 오프라인 WSL·Jupyter·원격 개발환경

`Ubuntu-26.04-RestoreTest` 안에서 필요한 곳에 uv `--offline`을 적용하고 연구용 Python `3.12.14`, JupyterLab `4.6.4`, IPython `9.17.1`, ipykernel `7.3.0`을 검증했습니다. 결과는 `Physical_Offline_WSL_Python_Jupyter=PASS`였습니다.

배포판에서 `/dev/dxg`와 NVIDIA GeForce RTX 5060 Laptop GPU가 유지되는 것도 확인했습니다. `Physical_Offline_WSL_GPU_Access=PASS`를 기록한 뒤 실제 연산을 시험했습니다.

외부 연결이 없는 동안에도 VS Code Remote WSL이 동작했습니다. 이미 설치·보존한 서버, Python·Jupyter 원격 확장, 프로젝트 인터프리터와 Jupyter 커널을 사용할 수 있었고, `Physical_Offline_VS_Code_WSL=PASS`, `Physical_Offline_Jupyter=PASS`를 기록했습니다.

이 시험은 설치된 원격 구성요소를 사용하는 범위였으며, VS Code Marketplace의 오프라인 접근은 시험하지 않았습니다.

## 8. 네트워크 단절 상태의 PyTorch CUDA 실행

`/home/securityon/research/pytorch-smoke-test`에서 `uv run --offline`으로 복구한 프로젝트를 실행했습니다.

| 확인 항목      | 결과                                  |
| -------------- | ------------------------------------- |
| PyTorch        | `2.14.0+cu132`                        |
| CUDA 런타임    | `13.2`                                |
| CUDA 사용 가능 | `True`                                |
| GPU            | NVIDIA GeForce RTX 5060 Laptop GPU    |
| 연산           | `2048 x 2048` 행렬곱                  |
| 출력           | `cuda:0`의 `torch.Size([2048, 2048])` |

복구한 환경에서 외부 패키지 접근 없이 GPU 연산을 완료했고, `PHYSICAL OFFLINE WSL PyTorch CUDA PASS`를 출력했습니다.

## 9. 공유 모델 저장소에서 Transformers 실행

복구한 Transformers 프로젝트에는 다음 조건을 함께 적용했습니다.

```text
physical network isolation
uv run --offline
HF_HUB_OFFLINE=1 and TRANSFORMERS_OFFLINE=1
local_files_only=True
```

`Qwen/Qwen3-0.6B`는 Windows와 공유하는 모델 저장소의 WSL 경로인 `/mnt/d/Lab/Models/HuggingFace`에서 불러왔습니다. `cuda:0`에서 추론을 완료했고 `PHYSICAL OFFLINE WSL Transformers CUDA PASS`를 출력했습니다.

## 10. TensorFlow nightly의 오프라인 재검증

복구한 TensorFlow nightly 프로젝트도 네트워크를 끊은 상태에서 실행했습니다. TensorFlow `2.22.0-dev20260923` 개발 빌드(`tf-nightly`)는 RTX 5060을 찾았고, 일반 GPU 행렬곱, memory growth 적용 후 연산, XLA/JIT 연산을 모두 통과했습니다.

XLA는 프로젝트에서 관리하는 cuDNN을 사용했습니다. WSL 시스템 전체에 설치된 cuDNN 패키지는 없었고, 프로젝트 환경에는 `nvidia-cudnn-cu12 9.26.0.51`이 있었습니다. 실행 로그는 `Loaded cuDNN version 92600`을 기록했습니다.

오프라인 시험 결과는 `TensorFlow_Nightly_Offline_Preview=PASS`였습니다. 개발 빌드의 분류는 `TensorFlow_Nightly_GPU_Path=PREVIEW_PASS`로 유지하고, 정식판은 `Stable_TensorFlow_GPU_Path=PENDING`으로 기록했습니다.

여섯 번째와 일곱 번째 노트의 `DEFERRED`는 당시 정식판 시험에서 사용할 수 있는 GPU 실행 경로를 확보하지 못해 유보한 상태입니다. 이번 `PENDING`은 nightly 성공 후 TensorFlow `2.22` 정식판의 출시와 재검증을 기다린다는 뜻입니다. 정식판이 새로 통과한 것은 아니며, nightly를 정식판·베타 또는 운영 기준 환경으로 채택하지 않았습니다.

## 11. 외부 연결 없이 Windows 로컬 AI 실행

같은 네트워크 단절 상태에서 Windows의 로컬 AI도 실행했습니다. Ollama는 `qwen3.5:4b` 추론과 다음 localhost API 호출에 성공했습니다.

```text
http://localhost:11434
```

Localhost 통신은 외부 네트워크를 사용하지 않습니다. 결과는 `Physical_Offline_Ollama=PASS`였습니다.

llama.cpp는 기존 로컬 GGUF 파일로 GPU 오프로딩과 추론을 완료해 `Physical_Offline_llama.cpp=PASS`를 기록했습니다. 이 시험에서는 `-hf`로 모델을 가져오지 않고 로컬 파일을 직접 지정했습니다.

## 12. Wheelhouse에서 PyTorch 재구축

Wheelhouse로 새 환경을 만들 수 있는지 확인하기 위해 다음 위치에 Windows 프로젝트를 만들었습니다.

```text
D:\Lab\Research\pytorch-physical-offline-test
```

기존 프로젝트의 `.venv`는 재사용하지 않았습니다. 네트워크를 끊은 상태에서 `--no-index`와 `--find-links`로 다음 wheelhouse의 패키지를 설치했습니다.

```text
D:\Lab\OfflineLab\wheelhouse\pytorch-cu132-py312
```

새 환경은 PyTorch `2.14.0+cu132`, 사용 가능한 CUDA와 NVIDIA GeForce RTX 5060 Laptop GPU를 보고했고, CUDA 행렬곱도 통과했습니다. 출력은 `PHYSICAL OFFLINE PYTORCH WHEELHOUSE PASS`였으며, 최종 기록에는 `Physical_Offline_PyTorch_Wheelhouse_Reconstruction=PASS`로 남겼습니다.

## 13. Transformers 재구축과 로컬 추론

두 번째 Windows 프로젝트는 다음 위치에 만들었습니다.

```text
D:\Lab\Research\transformers-physical-offline-test
```

네트워크가 차단된 상태에서 `--no-index`와 `--find-links`로 `D:\Lab\OfflineLab\wheelhouse\transformers-py312`의 패키지를 설치했습니다. 재구축한 환경에는 PyTorch `2.14.0+cu132`, Transformers `5.17.0`, Accelerate `1.15.0`이 포함됐습니다.

이어 `D:\Lab\Models\HuggingFace`에서 `Qwen/Qwen3-0.6B`의 `311 / 311` 가중치를 모두 불러왔고, `cuda:0`에서 추론을 완료했습니다. 출력은 `PHYSICAL OFFLINE TRANSFORMERS WHEELHOUSE PASS`였으며, 최종 기록에는 `Physical_Offline_Transformers_Wheelhouse_Reconstruction=PASS`로 남겼습니다.

## 14. 기존 llama.cpp 번들의 복구 실패

여섯 번째 노트에서는 llama.cpp 커밋 `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`를 `llama.cpp-b29c606.bundle`로 보존했습니다. 당시 `git bundle verify`는 전체 이력이 포함돼 있고 번들이 정상이라고 보고했습니다.

이번에는 완전히 독립된 저장소로 복제를 시도했지만 다음 오류로 실패했습니다.

```text
Could not read d9e03f1074dbd2979126d91dce1b5d304ec8394e
Failed to traverse parents of commit b29c606e28a01b1bc8c1351026a0fa6e616bf6c4
remote did not send all necessary objects
```

번들 검사와 실제 복구 결과가 달랐습니다.

```text
Earlier_Bundle_Format_Verification=PASS
Earlier_Bundle_Independent_Restore=FAIL
```

여섯 번째 노트에는 당시 수행한 검사 결과를 남겨 두었습니다. 이번 복구 시험을 통해 그 검사만으로는 복구 가능성을 판단하기에 부족했음을 알게 됐습니다.

## 15. 원본 저장소 조사

원인을 좁히기 위해 `D:\Lab\Research\llama.cpp`를 조사했습니다. `git rev-parse --is-shallow-repository`는 `false`를 반환했고, `remote.origin.promisor`, `remote.origin.partialclonefilter` 설정, replace ref와 `.git/info/grafts` 파일도 없었습니다.

누락됐다고 보고된 부모 커밋 `d9e03f1074dbd2979126d91dce1b5d304ec8394e`는 원본 저장소에 정상적으로 존재했고, 검증한 커밋 `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`의 조상이었습니다. 일반 탐색과 `--no-replace-objects` 탐색은 모두 `96,959`개 객체를 세었습니다.

원본 저장소의 무결성 검사도 통과했습니다.

| 확인 항목          | 결과         |
| ------------------ | ------------ |
| `git fsck --full`  | `PASS`       |
| 검사한 객체 수     | `99,090`     |
| 압축된 저장소 크기 | `378.25 MiB` |

원본 저장소는 검사에 통과했지만 보존한 번들로는 독립된 저장소를 복구할 수 없었습니다. 그보다 구체적인 Git 내부 원인은 확인하지 못했습니다.

## 16. 번들 교체와 독립 복구

검증한 소스 태그 `b10964`는 `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`를 가리킵니다. 문제를 계속 조사하기 위해 네트워크를 다시 연결한 뒤, 복구에 실패한 번들을 삭제하지 않고 다음 이름으로 보관했습니다.

```text
D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606-failed-restore.bundle
```

이 태그를 기준으로 새 전체 번들을 만들어 기존 복구 경로에 두었습니다.

```text
D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606.bundle
```

여섯 번째 노트의 SHA-256은 복구에 실패해 따로 보관한 이전 번들의 값입니다. 교체한 번들의 해시로 재사용하지 않았습니다.

새 번들에서 독립된 저장소로 복제할 때 약 `356.08 MiB`가 전송됐고 `93,839`개 객체가 복구됐습니다. `b10964`를 체크아웃해 detached HEAD가 됐으며, 이는 특정 태그를 복구할 때 예상한 상태였습니다. 복구한 HEAD는 `b29c606e28a01b1bc8c1351026a0fa6e616bf6c4`와 일치했고 `git fsck --full`도 `93,839`개 객체를 대상으로 통과했습니다.

결과는 `llama.cpp_Source_Recovery=PASS`였습니다. 원격 Git 저장소 없이 로컬 번들 파일로 복구했지만, 교체한 번들의 최종 복제는 네트워크 재연결 후에 수행했습니다. 연결을 다시 끊고 반복 시험하지는 않았습니다.

## 17. 소스 복구의 확인 기준

이번 실패 이후에는 `git bundle verify`에 더해 다음 절차로 실제 복구를 확인하기로 했습니다.

1. 소스 자산을 보존한다.
2. 별도 위치의 독립된 저장소로 복제한다.
3. 예상한 커밋과 일치하는지 확인한다.
4. 복구한 저장소에서 `git fsck --full`을 실행한다.

실패한 번들도 남겨 두어 검사 기준을 바꾼 계기를 추적할 수 있게 했습니다.

## 18. 현재 자산의 해시 목록 기록

여섯 번째 노트의 `D:\Lab\OfflineLab\manifests\offline-assets-sha256.txt`는 그대로 두고, 보존 대상 OfflineLab 경로의 현재 파일을 대상으로 새 manifest를 만들었습니다.

```text
D:\Lab\OfflineLab\manifests\offline-assets-sha256-20260925.txt
Size: 348,657 bytes
```

임시 캐시는 계속 제외했습니다. OfflineLab 밖의 모델 저장소에는 별도 manifest를 만들었습니다.

```text
D:\Lab\OfflineLab\manifests\model-assets-sha256-20260925.txt
Size: 5,623 bytes
Model root: D:\Lab\Models
```

이전 manifest는 당시 상태의 기록으로 유지하고, 이번 자산 상태는 날짜가 붙은 새 파일에 남겼습니다.

## 19. 오프라인 상태에서 WSL 재시작

앞선 네트워크 단절 시험 중, llama.cpp 문제를 조사하려고 연결을 복구하기 전에 WSL을 종료하고 다시 시작했습니다. 재시작 뒤에도 RTX 5060에 접근할 수 있었고 PyTorch CUDA 연산이 통과했습니다.

결과는 `Physical_Offline_Persistence=PASS`였습니다. 이번에 확인한 범위는 오프라인 상태의 WSL 종료·재시작이며, Windows 전체 재부팅 시험은 아닙니다.

## 20. 최종 검증 상태 기록

최종 검증 상태는 다음 파일에 기록했습니다.

```text
D:\Lab\OfflineLab\manifests\offline-end-to-end-validation-baseline.txt
```

파일 크기는 `6,875`바이트였습니다. 이번 단계가 끝났을 때 `D:\Lab\OfflineLab\manifests`에는 `24`개 파일이 있었고, 일곱 번째 노트의 완료 시점에는 `21`개였습니다.

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

TensorFlow 정식판은 별도의 후속 검증 대상으로 남겼습니다. 아래 완료 범위는 이번에 시험한 주요 연구 작업을 기준으로 합니다.

## 21. 기업 환경 반입 전 준비와 오프라인 검증 마무리

이번에는 제한망에 들어가기 전 준비한 연구환경을 실제 네트워크 단절 상태에서 사용하고, 보존 자산으로 일부 환경을 재구축했습니다. 복구한 WSL의 연구 도구와 GPU 연산, Windows의 로컬 AI 실행, wheelhouse를 이용한 새 Python 환경 구성이 동작했습니다. 다만 WSL import는 단절 전에, 교체한 llama.cpp 번들의 최종 복제는 재연결 후에 수행했습니다.

특히 llama.cpp 번들의 복구 실패는 보존한 파일을 독립된 환경에서 직접 사용해 볼 필요를 보여 줬습니다. 이후 소스 복구 기준에 별도 저장소로의 복제, 커밋 일치 확인과 무결성 검사를 포함했습니다.

최종 기록의 상태값은 다음과 같습니다.

```text
End-to-End Offline Research Environment = PASS
Stable TensorFlow GPU Path = PENDING
TensorFlow Nightly GPU Path = PREVIEW PASS
```

여기까지 완료한 범위는 기업 환경 반입 전의 준비와 시험한 오프라인 작업입니다. 실제 회사의 필수 보안 프로그램과 Proxy·CA·SSL/TLS Inspection 등 네트워크 정책 아래에서 적응·검증하는 작업은 아직 수행하지 않았습니다. Embedding·RAG 작업 흐름, `D:\Recovery\GoldenResearch.wim` 생성과 WinRE를 이용한 복구 시험도 남아 있습니다. TensorFlow `2.22` 정식판은 출시 후 다시 검증할 예정입니다.

따라서 초기 아키텍처의 모든 목표가 끝난 것은 아닙니다. 이번 기록은 제한망 진입 전에 사용할 수 있는 연구 기능과 복구 경로를 어디까지 확인했는지 정리한 것입니다. MacBook 연구환경 구축은 별도의 후속 프로젝트로 다룹니다.
