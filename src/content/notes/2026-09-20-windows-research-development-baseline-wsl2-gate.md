---
title: "Windows 개발환경과 WSL2 검증"
description: "Windows Native 개발환경과 WSL2를 실제 작업, 저장소 설계, 재부팅 후 지속성까지 검증해 연구 개발 기준선과 다음 GPU 연구 계층으로 넘어갈 조건을 확정합니다."
lang: ko
translationKey: windows-research-development-baseline-wsl2-gate
pubDatetime: 2026-09-20T00:00:00+09:00
tags:
  - research-journey
  - windows
  - workstation
  - development
  - wsl
featured: false
draft: false
---

「Storage & Productivity Baseline 구축」에서는 OS와 데이터의 수명주기를 분리하고, 연구자산이 놓일 D: 구조를 먼저 마련했습니다. 이제 그 기준 위에 Windows Native 개발환경을 올리고, 선택 경로로 설계했던 WSL2가 실제로 동작하는지 확인할 차례였습니다.

첫 아키텍처 노트에서는 Windows 개발환경 구축과 WSL2 사전 점검을 비교적 큰 단계로 묶었습니다. 실제 작업에서는 Clean Windows, Storage & Productivity, Windows 개발 기준선, WSL2 Gate처럼 더 작은 검증 계층으로 나뉘었습니다. 초기 설계를 고쳐 쓰기보다 구현 과정에서 무엇이 구체화됐는지를 이번 기록에 남깁니다.

이번 단계에서는 도구 실행, 대표 작업, 저장소 구조와의 연계, 필요한 재부팅·재시작 검증을 마쳐야 `PASS`로 판단했습니다.

## 1. 비어 있는 개발 스택에서 시작하기

작업을 시작할 때 Clean Windows에는 개발 스택이 없었습니다. Git, VS Code, Python, `py` 런처, uv, Jupyter, WSL이 모두 설치되지 않은 상태였습니다.

`python --version`을 실행하자 Windows App Execution Alias가 반응하며 Microsoft Store 설치를 제안했습니다. 사용할 수 있는 Python 런타임은 없었습니다.

이 단계에서 구축할 범위도 제한했습니다. Windows에서 Python 프로젝트와 Notebook을 실행할 수 있는 개발 기준선을 만들고, WSL2가 Linux 환경의 작업 경로로 사용할 수 있는지 검증합니다. CUDA, PyTorch GPU 가속과 Local LLM은 아직 이 기준선 위에 올리지 않습니다.

## 2. Windows Native 기준선 구축

최종적으로 확인한 Windows 도구 버전은 다음과 같습니다.

| 구성요소               | 확인한 버전과 상태                                |
| ---------------------- | ------------------------------------------------- |
| Git                    | `2.55.0.windows.3`                                |
| **Visual Studio Code** | `1.138.0`, x64, Program Files에 machine-wide 설치 |
| uv                     | `0.12.17`                                         |
| Python                 | uv가 관리하는 `3.12.14`                           |
| JupyterLab             | `4.6.3`                                           |

Windows 연구 기준선에는 다음 단계의 CUDA와 PyTorch 호환성을 고려해 Python 3.12를 선택했습니다.

Python 런타임은 uv가 관리하되, 실제 프로젝트는 D:에 둡니다. C:에는 OS, 애플리케이션과 uv 관리 런타임이 있고, `D:\Lab\Research\` 아래에는 프로젝트와 각 프로젝트의 `.venv`가 놓이는 구조입니다. 개발환경 역시 앞 단계에서 정한 저장소 역할을 따르도록 했습니다.

## 3. C:와 D: 분리가 uv에 도달했을 때

`D:\Lab\Research\`의 프로젝트에서 `uv add requests`를 실행했을 때 다음 경고가 나타났습니다.

```text
Failed to hardlink files; falling back to full copy
```

프로젝트와 `.venv`는 D:에 있었지만 uv 캐시는 처음에 `C:\Users\<user>\AppData\Local\uv\cache`에 있었습니다. 서로 다른 볼륨 사이에서는 하드링크를 만들 수 없어 전체 복사로 전환된 것입니다. 의존성 설치 자체는 성공했으므로 이를 설치 실패로 해석하지 않았습니다.

경고만 없애기 위해 복사 모드를 고정하는 대신, 사용자 수준 `UV_CACHE_DIR`을 사용해 캐시를 다음 위치로 옮겼습니다.

```text
D:\Lab\OfflineLab\cache\uv
```

반복적으로 커질 수 있는 패키지 캐시를 D:의 연구자산 구조에 맞추고, D:의 프로젝트 가상환경과 같은 볼륨에서 하드링크를 사용할 수 있게 한 결정입니다.

다만 uv 캐시는 성능을 위한 캐시일 뿐, 재현성을 위해 선별해 보관할 오프라인 wheelhouse와 같지 않습니다. 앞으로 만들 `D:\Lab\OfflineLab\wheelhouse`는 별도의 자산으로 남습니다.

## 4. 실제 Windows Smoke Test

설치 확인을 넘어 실제 경로를 검증하기 위해 `D:\Lab\Research\smoke-test`에 작은 프로젝트를 만들었습니다.

```powershell
uv init smoke-test
uv add requests
```

`uv init`은 Git 저장소도 함께 초기화했습니다. 이후 별도로 실행한 `git init`의 `Reinitialized existing Git repository` 출력에서 이를 확인했습니다.

이 프로젝트는 Python `3.12.14`, 프로젝트별 `.venv`, `requests 2.34.2`를 사용했습니다. 실제 Python smoke test는 다음 상태를 출력했습니다.

```text
Python 3.12.14
requests 2.34.2
Windows research baseline OK
```

이를 통해 uv의 Python 선택, 프로젝트 `.venv`, 의존성 설치와 import, D: 연구 작업 공간에서의 Python 실행을 하나의 흐름으로 확인했습니다.

## 5. Windows와 WSL을 잇는 Git 정책

Windows Git의 전역 사용자 정보에는 공개 가능한 이름과 GitHub noreply 주소를 사용했습니다. 실제 이메일 주소는 이 기록에 포함하지 않습니다.

줄바꿈 정책은 전역 `core.autocrlf=input`과 저장소의 `.gitattributes`를 함께 사용했습니다.

```gitattributes
* text=auto eol=lf
```

첫 스테이징에서 작업 트리의 CRLF 줄바꿈이 LF로 정규화된다는 Git 경고가 나타났습니다. 이는 의도한 저장소 정책이 적용되는 과정이므로 오류로 취급하지 않았습니다. 저장소 인식, 스테이징과 최초 커밋을 확인했고, 이후 새 저장소의 기본 브랜치도 `init.defaultBranch=main`으로 통일했습니다.

이번에는 로컬 Git 동작까지 검증했습니다. GitHub 원격 인증과 push는 시험하지 않았습니다.

나중에 WSL 안에서도 Git `2.53.0`과 `/usr/bin/git`을 확인하고 사용자 정보, `core.autocrlf=input`, `init.defaultBranch=main`을 별도로 설정했습니다. Windows Git과 WSL Git의 전역 설정은 서로 독립적입니다. WSL Native 저장소에서도 같은 `.gitattributes`를 적용하고 최초 커밋이 성공하는 것을 확인했습니다.

## 6. 일반 사용자 권한의 VS Code 개발환경

VS Code를 처음 `code .`로 열었을 때 명령을 실행한 PowerShell이 Administrator 권한이어서 VS Code도 Administrator로 실행됐습니다. 개발도구를 일상적으로 관리자 세션에서 사용할 이유가 없으므로 이를 바로 수정했습니다.

최종 기준선은 일반 사용자 권한의 VS Code입니다. 직접 만든 로컬 smoke-test 폴더가 처음 **Restricted Mode**로 열린 뒤에는 해당 폴더만 신뢰하도록 설정했습니다.

Microsoft의 Python, Python Environments, debugpy, Pylance 등 표준 Python 확장 구성을 설치하고 작업 공간 인터프리터로 다음 경로를 선택했습니다.

```text
D:\Lab\Research\smoke-test\.venv\Scripts\python.exe
```

VS Code 통합 터미널에서도 Python `3.12.14`와 `requests 2.34.2`를 확인했습니다. 이로써 VS Code에서 선택한 인터프리터가 프로젝트별 `.venv`와 uv가 구성한 의존성 환경까지 정확히 이어지는 것을 검증했습니다.

## 7. Jupyter UI와 프로젝트 커널 분리

Jupyter는 UI/런타임과 프로젝트 커널을 한 환경에 묶지 않았습니다. **JupyterLab**은 `uv tool`로 독립적으로 관리하고, Notebook이 실제로 사용할 `ipykernel`은 프로젝트 `.venv`의 개발 의존성으로 추가했습니다. VS Code에서는 Jupyter 확장이 Notebook UI를 제공합니다.

`uv tool install jupyterlab` 뒤에 노출된 실행 명령은 `jupyter-lab`이었습니다. `jupyter lab --version`은 실패했지만 `jupyter-lab --version`으로 `4.6.3`을 확인했습니다.

Notebook 검증에는 프로젝트 `.venv`의 커널을 선택했습니다. Python `3.12.14`와 `requests 2.34.2` import, 셀 실행, D:에 파일을 쓴 뒤 다시 읽는 과정이 모두 성공했습니다. 결과는 `baseline-test.ipynb`로 저장했습니다.

## 8. 서로 충돌한 가상화 신호

WSL2 Gate를 열기 전에 확인한 `Win32_Processor.VirtualizationFirmwareEnabled`는 `False`를 반환했습니다. 이 값만 보면 펌웨어 가상화가 꺼진 것처럼 보였습니다.

그러나 다른 근거는 반대였습니다.

| 확인 지점           | 관찰한 상태                             |
| ------------------- | --------------------------------------- |
| BIOS                | CPU VT(VT-x) `Supported`                |
| Task Manager        | **Virtualization: Enabled**             |
| `Get-ComputerInfo`  | `HyperVisorPresent = True`              |
| `Win32_DeviceGuard` | `VirtualizationBasedSecurityStatus = 2` |

VBS가 이미 실행 중이었고 Microsoft 하이퍼바이저도 WSL 설치 전부터 존재했습니다. 그래서 하나의 WMI 속성을 유일한 사실로 받아들이지 않고 BIOS, Windows UI, 하이퍼바이저와 Device Guard 상태를 교차 확인했습니다.

`Win32_Processor.VirtualizationFirmwareEnabled`가 `False`를 반환한 원인은 확정하지 못했습니다.

## 9. WSL2 플랫폼 검증

초기에는 `VirtualMachinePlatform`과 `Microsoft-Windows-Subsystem-Linux`가 모두 `Disabled`였고, WSL 엔진과 배포판도 없었습니다. 배포판을 바로 설치하지 않고 먼저 다음 명령으로 플랫폼을 준비했습니다.

```powershell
wsl --install --no-distribution
```

설치 뒤 확인한 WSL은 `2.7.14.0`, 커널은 `6.18.33.2-2`였습니다. 구성 과정의 한 시점에는 `VirtualMachinePlatform`과 `HypervisorPlatform`이 `Enabled`, `Microsoft-Windows-Subsystem-Linux`는 `Disabled`로 보였습니다. `hvservice`와 `wslservice`는 실행 중이었고 `vmcompute`도 수동 시작 서비스로 사용할 수 있었습니다.

초기에 나타났던 가상화 미활성화 메시지는 Windows 가상화 구성이 최종 검증 상태에 도달한 뒤 사라졌습니다. 그러나 어느 한 변경이 이를 해결했다고 단정할 근거는 확보하지 못했습니다.

따라서 Optional Feature의 표시만으로 Gate를 판정하지 않았습니다. 최종 기준은 WSL2 배포판이 실제로 기동되고 Linux 환경의 작업을 수행하는지였습니다.

## 10. Ubuntu 26.04 LTS를 선택한 이유

처음에는 성숙한 생태계, 풍부한 문서와 보수적인 호환성을 고려해 Ubuntu 24.04 LTS를 후보로 두었습니다. 최종 선택은 `Ubuntu-26.04`였고, 실제 설치된 릴리스는 Ubuntu `26.04.1 LTS`, 코드명은 `Resolute Raccoon`이었습니다. WSL2 커널은 `6.18.33.2-microsoft-standard-WSL2`였습니다.

이 연구 워크스테이션은 적어도 1년 이상 사용할 예정이었고, 연구 결과물도 초기 구축 시점보다 나중에 나올 가능성이 높았습니다. 그래서 현재 생태계의 성숙도와 환경의 전체 사용 기간을 함께 고려했습니다.

Ubuntu 26.04가 LTS이고 당시 CUDA 지원 범위에 Ubuntu 26.04.1이 포함된다는 점도 판단 근거였습니다. 새로운 환경의 호환성 문제는 해결 과정과 함께 연구 기록으로 남기기로 했습니다.

## 11. WSL 저장소도 D:에 두기

`Ubuntu-26.04` 배포판은 다음 위치를 지정해 설치했습니다.

```text
D:\Lab\WSL\Ubuntu-26.04
```

`ext4.vhdx`도 지정한 D: 경로에 존재하는 것을 확인했습니다.

그렇다고 WSL 프로젝트를 기본적으로 `/mnt/d`에 두지는 않습니다. Windows 프로젝트는 `D:\Lab\Research\...`, WSL 프로젝트는 `/home/<user>/research/...`에 둡니다. Linux 파일시스템 동작이 필요한 프로젝트는 WSL의 ext4 안에서 작업하되, 그 가상 디스크 자체는 D:에 보관하는 구조입니다.

첫 설정에서 Linux 사용자를 만들었고 비밀번호 같은 인증 정보는 기록하지 않았습니다. Canonical platform metrics 안내도 확인했습니다. 이 기업 환경을 염두에 둔 기준선에서는 불필요한 텔레메트리를 가능한 범위에서 줄이는 쪽을 선호하지만, 지표 수집 선택이 기능에 실질적인 영향을 줬다고 주장하지는 않습니다.

## 12. 의도적으로 다른 두 Python 기준선

Ubuntu 기준 상태에서는 Ubuntu `26.04.1 LTS`, Python `3.14.4`, Git `2.53.0`을 확인했습니다. Linux 홈 디렉터리, `/mnt/d/Lab` 마운트, WSL에서 Windows D:로의 읽기·쓰기, 네트워크와 HTTPS 연결도 정상 동작했습니다.

Linux 프로젝트는 `/mnt/d`가 아니라 `~/research/wsl-smoke-test`에 만들었습니다. Smoke test는 Python `3.14.4`, `/home/.../research/wsl-smoke-test` 아래의 현재 경로와 다음 결과를 출력했습니다.

```text
WSL native Python baseline OK
```

Windows의 uv가 관리하는 Python은 `3.12.14`, Ubuntu 기본 OS의 `/usr/bin/python3`는 `3.14.4`입니다. 이번 단계에서는 두 버전을 억지로 맞추지 않았습니다. 목적은 같은 연구 프로젝트를 양쪽에서 완전히 재현하는 것이 아니라, 각 환경의 기준선을 독립적으로 검증하는 것이기 때문입니다.

향후 프로젝트가 같은 인터프리터 버전을 요구한다면 WSL에도 uv를 도입할 수 있습니다.

## 13. VS Code Remote WSL 검증

VS Code Remote WSL의 첫 시도도 관리자 권한에서 시작돼 VS Code가 Administrator로 표시됐습니다. Windows 환경 검증 때와 마찬가지로 일반 사용자 권한으로 바로잡았습니다.

최종 상태에서는 **WSL: Ubuntu-26.04** 연결이 보였고, `~/research/wsl-smoke-test` 폴더만 열어 신뢰했습니다. Linux 홈 디렉터리 전체를 포괄적으로 신뢰한 것은 아닙니다. VS Code Server가 WSL 안에 설치된 뒤, VS Code에서 WSL Python 실행까지 확인했습니다.

## 14. 재부팅과 재시작 후에도 남는가

전체 Windows 재부팅 뒤에 Git `2.55.0.windows.3`, VS Code `1.138.0`, uv `0.12.17`, Python `3.12.14`를 다시 확인했습니다. `Ubuntu-26.04`는 기본 WSL 배포판으로 남았고 WSL 기본 버전도 `2`였습니다.

Windows smoke test를 다시 실행했고, WSL 배포판을 재기동한 뒤 Linux 환경의 Python smoke test도 반복했습니다. 두 시험 모두 성공했습니다.

한 검증 단계 뒤 `.gitattributes`가 비어 보이는 예상 밖의 작업 트리 상태도 있었습니다. 정확한 원인은 확정하지 못했습니다. 파일을 Git에서 복원한 뒤 `wsl --shutdown`과 배포판 재시작을 거쳤고, 다음 내용이 그대로 유지되며 작업 트리에도 변경 사항이 없는 것을 확인했습니다.

```gitattributes
* text=auto eol=lf
```

## 15. 개발환경 기준 상태 기록

이번 단계의 개발환경 상태는 `D:\Lab\OfflineLab\manifests\` 아래 네 파일로 기록했습니다.

| 파일                                | 기록 범위                     |
| ----------------------------------- | ----------------------------- |
| `development-windows-baseline.txt`  | Windows 도구와 런타임 버전    |
| `development-wsl-baseline.txt`      | WSL, 배포판과 Linux 기준 상태 |
| `development-vscode-extensions.txt` | VS Code 확장 목록             |
| `development-git-config.txt`        | Windows와 WSL의 Git 기준 설정 |

이 파일들은 이전 단계의 생산성 도구·저장소 목록을 보완하며, 이후 상태 비교와 재구축 판단에 사용할 기록입니다. 전체 환경의 백업이나 자동 복원 기능은 제공하지 않습니다.

## 16. 기준선 도달과 다음 계층

이번 단계의 최종 판정은 다음과 같습니다.

| Gate                                | 결과   | 확인 기준                                                        |
| ----------------------------------- | ------ | ---------------------------------------------------------------- |
| Windows Native Development Baseline | `PASS` | 프로젝트 생성, 의존성 import, VS Code와 Notebook 실제 실행       |
| WSL2 Gate                           | `PASS` | WSL2 기동, Linux 프로젝트, 저장소·네트워크·HTTPS·Remote WSL 확인 |
| Reboot / Restart Persistence        | `PASS` | Windows 재부팅과 WSL 재시작 뒤 smoke test 재실행                 |

아직 NVIDIA CUDA Toolkit, PyTorch GPU 가속, CUDA 검증, GPU 벤치마크, Ollama, llama.cpp, Local LLM 런타임과 로컬 모델 배포는 구성하지 않았습니다. 이들은 이번 개발 기준선과 WSL2 Gate 위에 올라갈 다음 연구 계층입니다.

Windows Native와 WSL2라는 두 실행 경로가 이제 실제로 작동합니다. 다음 노트에서는 이 기준을 유지하면서 RTX 5060을 사용하는 CUDA·PyTorch와 Local LLM 연구환경을 검증합니다.
