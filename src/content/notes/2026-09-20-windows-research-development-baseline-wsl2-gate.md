---
title: "Windows Research Development Baseline 구축과 WSL2 Gate 검증"
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

이번 단계의 판정 기준은 단순한 설치 여부가 아니었습니다. 도구가 실행되고, 대표적인 실제 작업을 수행하며, 선택한 저장소 구조와 함께 동작하고, 필요한 경우 재부팅이나 재시작 뒤에도 같은 상태를 유지해야 `PASS`로 판단했습니다.

## 1. 비어 있는 개발 스택에서 시작하기

작업을 시작할 때 Clean Windows에는 개발 스택이 없었습니다. Git, VS Code, Python, `py` launcher, uv, Jupyter, WSL이 모두 설치되지 않은 상태였습니다.

`python --version`을 실행하면 Microsoft Store 설치를 제안하는 Windows App Execution Alias가 반응했습니다. 이는 사용할 수 있는 Python runtime이 있다는 뜻이 아니었습니다. 명령 이름이 해석되는 상태와 실제 runtime이 설치된 상태를 구분한 것이 첫 확인점이었습니다.

이 단계에서 구축할 범위도 제한했습니다. Windows Native에서 Python 프로젝트와 Notebook을 실행할 수 있는 개발 기준선을 만들고, WSL2가 Linux Native 작업 경로로 사용할 수 있는지 검증합니다. CUDA, PyTorch GPU acceleration과 Local LLM은 아직 이 기준선 위에 올리지 않습니다.

## 2. Windows Native 기준선 구축

최종적으로 확인한 Windows 도구 버전은 다음과 같습니다.

| 구성요소               | 확인한 버전과 상태                                |
| ---------------------- | ------------------------------------------------- |
| Git                    | `2.55.0.windows.3`                                |
| **Visual Studio Code** | `1.138.0`, x64, Program Files에 machine-wide 설치 |
| uv                     | `0.12.17`                                         |
| Python                 | uv가 관리하는 `3.12.14`                           |
| JupyterLab             | `4.6.3`                                           |

Windows 연구 기준선에는 Python 3.12를 의도적으로 선택했습니다. '최신 Python'을 따르는 결정이 아니라, 다음 단계의 CUDA와 PyTorch 계층에서 호환성을 우선하기 위한 선택입니다.

Python runtime은 uv가 관리하되, 실제 프로젝트는 D:에 둡니다. C:에는 OS, 애플리케이션과 uv 관리 runtime이 있고, `D:\Lab\Research\` 아래에는 프로젝트와 각 프로젝트의 `.venv`가 놓이는 구조입니다. 개발환경 역시 앞 단계에서 정한 저장소 역할을 따르도록 했습니다.

## 3. C:와 D: 분리가 uv에 도달했을 때

`D:\Lab\Research\`의 프로젝트에서 `uv add requests`를 실행했을 때 다음 경고가 나타났습니다.

```text
Failed to hardlink files; falling back to full copy
```

프로젝트와 `.venv`는 D:에 있었지만 uv cache는 처음에 `C:\Users\<user>\AppData\Local\uv\cache`에 있었습니다. 서로 다른 volume 사이에서는 hardlink를 만들 수 없어 전체 복사로 전환된 것입니다. 의존성 설치 자체는 성공했으므로 이를 설치 실패로 해석하지 않았습니다.

경고만 없애기 위해 copy mode를 고정하는 대신, user-level `UV_CACHE_DIR`을 사용해 cache를 다음 위치로 옮겼습니다.

```text
D:\Lab\OfflineLab\cache\uv
```

반복적으로 커질 수 있는 package cache를 D:의 연구자산 구조에 맞추고, D:의 project virtual environment와 같은 volume에서 hardlink를 사용할 수 있게 한 결정입니다.

다만 uv cache는 성능을 위한 cache일 뿐, 재현성을 위해 선별해 보관할 offline wheelhouse와 같지 않습니다. 앞으로 만들 `D:\Lab\OfflineLab\wheelhouse`는 별도의 자산으로 남습니다.

## 4. 실제 Windows Smoke Test

설치 확인을 넘어 실제 경로를 검증하기 위해 `D:\Lab\Research\smoke-test`에 작은 project를 만들었습니다.

```powershell
uv init smoke-test
uv add requests
```

`uv init`은 이미 Git repository까지 초기화했습니다. 이후 별도로 실행한 `git init`이 `Reinitialized existing Git repository`를 출력하면서 이 동작을 확인했습니다. 오류라기보다 uv가 만든 project의 초기 상태를 직접 알게 된 과정이었습니다.

이 project는 Python `3.12.14`, project-local `.venv`, `requests 2.34.2`를 사용했습니다. 실제 Python smoke test는 다음 상태를 출력했습니다.

```text
Python 3.12.14
requests 2.34.2
Windows research baseline OK
```

이를 통해 uv의 Python resolution, project `.venv`, dependency 설치와 import, D: 연구 workspace에서의 Python 실행을 하나의 흐름으로 확인했습니다.

## 5. Windows와 WSL을 잇는 Git 정책

Windows Git의 global identity에는 공개 가능한 이름과 GitHub noreply 주소를 사용했습니다. 실제 이메일 주소는 이 기록에 포함하지 않습니다.

줄바꿈 정책은 global `core.autocrlf=input`과 repository의 `.gitattributes`를 함께 사용했습니다.

```gitattributes
* text=auto eol=lf
```

첫 staging에서 CRLF working-tree content가 LF로 정규화된다는 Git 경고가 나타났습니다. 이는 의도한 repository 정책이 적용되는 과정이므로 오류로 취급하지 않았습니다. repository 인식, staging과 root commit을 확인했고, 이후 새 repository의 기본 branch도 `init.defaultBranch=main`으로 통일했습니다.

이번 검증은 local Git 동작까지입니다. GitHub remote 인증이나 push까지 시험한 것으로 확대해서 해석하지 않습니다.

나중에 WSL 안에서도 Git `2.53.0`과 `/usr/bin/git`을 확인하고 identity, `core.autocrlf=input`, `init.defaultBranch=main`을 별도로 설정했습니다. Windows Git과 WSL Git의 global configuration은 서로 독립적입니다. WSL Native repository에서도 같은 `.gitattributes`를 적용하고 root commit이 성공하는 것을 확인했습니다.

## 6. 일반 사용자 권한의 VS Code 개발환경

VS Code를 처음 `code .`로 열었을 때 명령을 실행한 PowerShell이 Administrator 권한이어서 VS Code도 Administrator로 실행됐습니다. 개발도구를 일상적으로 elevated session에서 사용할 이유가 없으므로 이를 바로 수정했습니다.

최종 기준선은 일반 사용자 권한의 VS Code입니다. 직접 만든 local smoke-test folder가 처음 **Restricted Mode**로 열린 뒤에는 그 folder만 신뢰했습니다. 임의의 folder를 자동으로 신뢰하는 정책은 아닙니다.

Microsoft의 Python, Python Environments, debugpy, Pylance 등 표준 Python extension stack을 설치하고 workspace interpreter로 다음 경로를 선택했습니다.

```text
D:\Lab\Research\smoke-test\.venv\Scripts\python.exe
```

VS Code integrated terminal에서도 Python `3.12.14`와 `requests 2.34.2`를 확인했습니다. 이로써 VS Code에서 선택한 interpreter가 project-local `.venv`와 uv가 구성한 dependency environment까지 정확히 이어지는 것을 검증했습니다.

## 7. Jupyter UI와 Project Kernel 분리

Jupyter는 UI/runtime과 project kernel을 한 환경에 묶지 않았습니다. **JupyterLab**은 `uv tool`로 독립적으로 관리하고, Notebook이 실제로 사용할 `ipykernel`은 project `.venv`의 dev dependency로 추가했습니다. VS Code에서는 Jupyter extension이 Notebook UI를 제공합니다.

`uv tool install jupyterlab` 뒤에 노출된 실행 명령은 generic `jupyter`가 아니라 `jupyter-lab`이었습니다. 따라서 `jupyter lab --version`은 실패했지만 `jupyter-lab --version`에서는 `4.6.3`을 확인했습니다. 첫 명령의 실패가 JupyterLab 설치 실패를 의미하지는 않았습니다.

실제 Notebook smoke test는 project `.venv` kernel을 선택해 수행했습니다. Python `3.12.14`와 `requests 2.34.2` import, cell 실행, D:에 파일을 쓴 뒤 다시 읽는 과정이 모두 성공했습니다. 저장한 `baseline-test.ipynb`는 UI가 열렸다는 사실보다 더 구체적인 검증 artefact로 남았습니다.

## 8. 서로 충돌한 가상화 신호

WSL2 Gate를 열기 전에 확인한 `Win32_Processor.VirtualizationFirmwareEnabled`는 `False`를 반환했습니다. 이 값만 보면 firmware virtualisation이 꺼진 것처럼 보였습니다.

그러나 다른 근거는 반대였습니다.

| 확인 지점           | 관찰한 상태                             |
| ------------------- | --------------------------------------- |
| BIOS                | CPU VT(VT-x) `Supported`                |
| Task Manager        | **Virtualization: Enabled**             |
| `Get-ComputerInfo`  | `HyperVisorPresent = True`              |
| `Win32_DeviceGuard` | `VirtualizationBasedSecurityStatus = 2` |

VBS가 이미 실행 중이었고 Microsoft hypervisor도 WSL 설치 전부터 존재했습니다. 그래서 하나의 WMI property를 유일한 사실로 받아들이지 않고 BIOS, Windows UI, hypervisor와 Device Guard 상태를 교차 확인했습니다.

`Win32_Processor.VirtualizationFirmwareEnabled`가 왜 `False`였는지는 확정하지 못했습니다. 확인하지 못한 원인을 추정으로 채우지 않고, 상충하는 관찰값과 최종 동작 검증을 함께 남기는 편이 더 정확합니다.

## 9. WSL2 Platform 검증

초기에는 `VirtualMachinePlatform`과 `Microsoft-Windows-Subsystem-Linux`가 모두 `Disabled`였고, WSL engine과 distribution도 없었습니다. Distribution을 바로 설치하지 않고 먼저 다음 명령으로 platform을 준비했습니다.

```powershell
wsl --install --no-distribution
```

설치 뒤 확인한 WSL은 `2.7.14.0`, kernel은 `6.18.33.2-2`였습니다. 구성 과정의 한 시점에는 `VirtualMachinePlatform`과 `HypervisorPlatform`이 `Enabled`, `Microsoft-Windows-Subsystem-Linux`는 `Disabled`로 보였습니다. `hvservice`와 `wslservice`는 실행 중이었고 `vmcompute`도 manual service로 사용할 수 있었습니다.

초기에 나타났던 virtualisation 미활성화 메시지는 Windows virtualisation stack이 최종 검증 상태에 도달한 뒤 사라졌습니다. 그러나 어느 한 변경이 이를 해결했다고 단정할 근거는 확보하지 못했습니다.

따라서 Optional Feature의 표시만으로 Gate를 판정하지 않았습니다. 최종 기준은 WSL2 distribution이 실제로 기동되고 Linux Native 작업을 수행하는지였습니다.

## 10. Ubuntu 26.04 LTS를 선택한 이유

처음에는 성숙한 ecosystem, 풍부한 문서와 보수적인 호환성을 고려해 Ubuntu 24.04 LTS를 후보로 두었습니다. 최종 선택은 `Ubuntu-26.04`였고, 실제 설치된 release는 Ubuntu `26.04.1 LTS`, codename은 `Resolute Raccoon`이었습니다. WSL2 kernel은 `6.18.33.2-microsoft-standard-WSL2`였습니다.

이 선택은 단순히 새 버전이 더 낫다는 판단이 아닙니다. 이 workstation을 적어도 1년 이상 연구에 사용하고, 실제 연구 결과물은 초기 구축 시점보다 나중에 만들어질 가능성이 높았습니다. 따라서 현재 가장 성숙한 LTS만 선택하기보다 환경의 전체 수명주기를 함께 고려했습니다.

Ubuntu 26.04 자체가 LTS이고 contemporary CUDA 지원 범위에 Ubuntu 26.04.1이 포함된다는 점도 판단 근거였습니다. 더 새로운 환경에서 만나는 호환성 마찰 역시 숨겨야 할 불편이 아니라 Research Journey에서 기록할 유효한 근거라고 보았습니다.

결국 선택 기준은 장기 연구 수명주기, LTS, 현재 CUDA 지원과 compatibility friction을 학습 자료로 받아들일 의향의 조합이었습니다.

## 11. WSL Storage도 D:에 두기

`Ubuntu-26.04` distribution은 다음 위치를 지정해 설치했습니다.

```text
D:\Lab\WSL\Ubuntu-26.04
```

실제 `ext4.vhdx`도 이 D: 위치 아래에 존재하는 것을 확인했습니다. 앞 단계에서 마련한 storage architecture가 계획으로만 남지 않고 WSL 자산에도 적용된 것입니다.

그렇다고 WSL Native project를 기본적으로 `/mnt/d`에 두지는 않습니다. Windows Native project는 `D:\Lab\Research\...`, WSL Native project는 `/home/<user>/research/...`에 둡니다. Linux filesystem semantics가 필요한 project는 WSL의 ext4 안에서 작업하되, 그 virtual disk 자체는 D:에 보관하는 구조입니다.

첫 provisioning에서 Linux user를 만들었고 비밀번호 같은 credential은 기록하지 않았습니다. Canonical platform metrics 안내도 확인했습니다. 이 enterprise-oriented baseline에서는 불필요한 telemetry를 가능한 범위에서 줄이는 쪽을 선호하지만, metrics 선택이 기능에 실질적인 영향을 줬다고 주장하지는 않습니다.

## 12. 의도적으로 다른 두 Python 기준선

Ubuntu 기준 상태에서는 Ubuntu `26.04.1 LTS`, Python `3.14.4`, Git `2.53.0`을 확인했습니다. Linux home directory, `/mnt/d/Lab` mount, WSL에서 Windows D:로의 read/write, network와 HTTPS 연결도 정상 동작했습니다.

Native Linux project는 `/mnt/d`가 아니라 `~/research/wsl-smoke-test`에 만들었습니다. Smoke test는 Python `3.14.4`, `/home/.../research/wsl-smoke-test` 아래의 현재 경로와 다음 결과를 출력했습니다.

```text
WSL native Python baseline OK
```

Windows의 uv-managed Python은 `3.12.14`, Ubuntu base OS의 `/usr/bin/python3`는 `3.14.4`입니다. 이번 단계에서는 두 버전을 억지로 맞추지 않았습니다. 목적은 같은 research project를 양쪽에서 완전히 재현하는 것이 아니라, 각 환경의 기준선을 독립적으로 검증하는 것이기 때문입니다.

미래 project가 동일한 interpreter version을 요구한다면 WSL에도 uv를 도입할 수 있습니다. 현재의 version 차이는 오류가 아니라 검증 범위에 따른 의도적인 상태입니다.

## 13. VS Code Remote WSL 검증

VS Code Remote WSL의 첫 시도도 elevated context에서 시작돼 VS Code가 Administrator로 표시됐습니다. Windows Native 검증 때와 마찬가지로 일반 사용자 권한으로 바로잡았습니다.

최종 상태에서는 **WSL: Ubuntu-26.04** 연결이 보였고, `~/research/wsl-smoke-test` folder만 열어 신뢰했습니다. Linux home 전체를 포괄적으로 신뢰한 것은 아닙니다. VS Code Server가 WSL 안에 설치된 뒤, VS Code에서 WSL Python 실행까지 확인했습니다.

이 검증으로 Windows의 editor UI, WSL remote connection, Linux Native folder와 Python runtime이 실제 작업 경로로 연결됐습니다.

## 14. 재부팅과 재시작 후에도 남는가

전체 Windows reboot 뒤에 Git `2.55.0.windows.3`, VS Code `1.138.0`, uv `0.12.17`, Python `3.12.14`를 다시 확인했습니다. `Ubuntu-26.04`는 default WSL distribution으로 남았고 WSL default version도 `2`였습니다.

Windows smoke test를 다시 실행해 성공했고, WSL distribution을 재기동한 뒤 Native Python smoke test도 다시 성공했습니다. 설치 직후 한 번 실행된 상태가 아니라 reboot를 통과한 기준선임을 확인한 것입니다.

한 validation 단계 뒤 `.gitattributes`가 비어 보이는 예상 밖의 working-tree 상태도 있었습니다. 정확한 원인은 확정하지 못했습니다. 파일을 Git에서 복원한 뒤 `wsl --shutdown`과 distribution 재시작을 거쳤고, 다음 내용이 그대로 유지되며 working tree도 clean인 것을 확인했습니다.

```gitattributes
* text=auto eol=lf
```

원인을 과장하지 않고, 복원 뒤 restart persistence까지 확인한 관찰로만 남깁니다.

## 15. Development Baseline 기록

이번 단계의 개발환경 상태는 `D:\Lab\OfflineLab\manifests\` 아래 네 파일로 기록했습니다.

| 파일                                | 기록 범위                           |
| ----------------------------------- | ----------------------------------- |
| `development-windows-baseline.txt`  | Windows 도구와 runtime 버전         |
| `development-wsl-baseline.txt`      | WSL, distribution과 Linux 기준 상태 |
| `development-vscode-extensions.txt` | VS Code extension inventory         |
| `development-git-config.txt`        | Windows와 WSL의 Git 기준 설정       |

이 파일들은 이전 단계의 productivity와 storage manifest를 보완합니다. 그러나 목록만으로 전체 환경을 backup하거나 자동 복원할 수 있는 것은 아닙니다. 이후 상태 비교와 재구축 판단에 사용할 근거를 추가한 것입니다.

## 16. 기준선 도달과 다음 계층

이번 단계의 최종 판정은 다음과 같습니다.

| Gate                                | 결과   | 확인 기준                                                              |
| ----------------------------------- | ------ | ---------------------------------------------------------------------- |
| Windows Native Development Baseline | `PASS` | Project 생성, dependency import, VS Code와 Notebook 실제 실행          |
| WSL2 Gate                           | `PASS` | WSL2 기동, Linux Native project, storage·network·HTTPS·Remote WSL 확인 |
| Reboot / Restart Persistence        | `PASS` | Windows reboot와 WSL restart 뒤 smoke test 재실행                      |

여기서 `PASS`는 설치 목록에 도구 이름이 있다는 뜻이 아닙니다. 실행, 대표 작업, 선택한 storage model과의 결합, 재시작 뒤 지속성까지 확인했다는 의미입니다.

아직 NVIDIA CUDA Toolkit, PyTorch GPU acceleration, CUDA validation, GPU benchmark, Ollama, llama.cpp, Local LLM runtime과 local model deployment는 구성하지 않았습니다. 이들은 이번 개발 기준선과 WSL2 Gate 위에 올라갈 다음 연구 계층입니다.

Windows Native와 WSL2라는 두 실행 경로가 이제 실제로 작동합니다. 다음 노트에서는 이 기준을 유지하면서 RTX 5060을 사용하는 CUDA·PyTorch와 Local LLM 연구환경을 검증합니다.
