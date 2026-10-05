---
title: "워크스테이션 구축 명령어 기록"
description: "워크스테이션 구축 중의 설치·설정·조회·WSL 명령과 당시 옵션, 결과 및 미확인 범위를 기록합니다."
lang: ko
translationKey: workstation-command-notes-paths-and-versions
pubDatetime: 2026-09-28T00:00:00+09:00
tags:
  - research-journey
  - windows
  - workstation
  - development
featured: false
draft: false
---

Windows 연구 워크스테이션을 구축하는 동안 설치 명령만큼 자주 쓴 것은 확인 명령이었습니다. 설치한 도구가 실행되는지, 어느 경로에서 발견되는지, 프로젝트가 의도한 Python을 사용하는지를 반복해서 살폈습니다. 구축 일지에는 그 결과와 판단을 중심으로 남겼지만, 나중에 같은 확인을 하려면 명령과 옵션도 함께 찾아볼 수 있어야 했습니다.

이 글에는 구축 과정의 설치·설정·상태 조회 명령과 당시 옵션을 정리합니다. 버전은 구축 당시의 값입니다. 코드 블록은 용도별로 묶었으므로 위에서부터 실행하는 설치 스크립트는 아닙니다. 확인 방법과 실행 결과를 함께 정리하되, 결과가 남아 있지 않은 항목은 별도로 표시했습니다.

## 1. 버전과 경로를 함께 확인하기

Git, **Visual Studio Code**, uv를 설치한 뒤 Windows PowerShell에서 다음 명령을 사용했습니다.

```powershell
git --version
where.exe git
code --version
where.exe code
uv --version
where.exe uv
```

| 도구    | 당시 버전          | 경로 조회에서 확인한 위치                     |
| ------- | ------------------ | --------------------------------------------- |
| Git     | `2.55.0.windows.3` | `C:\Program Files\Git\cmd\git.exe`            |
| VS Code | `1.138.0`          | `C:\Program Files\Microsoft VS Code\bin` 아래 |
| uv      | `0.12.17`          | 내 계정의 WinGet Links 아래                   |

버전과 경로를 나란히 남기니, 나중에 다른 설치본이나 실행 별칭을 만났을 때 비교할 기준이 생겼습니다. VS Code는 이때 `Program Files` 아래 경로가 확인됐습니다. 별도로 보관한 User Installer가 원래 설치에 사용된 파일이었는지는 이 조회로 알 수 없어 미확인으로 남깁니다.

PowerShell에서는 실행 파일을 찾을 때 `where.exe`라고 적었습니다. `where`는 `Where-Object`의 별칭이기도 하므로, 둘을 같은 명령으로 생각하면 조회 결과를 잘못 읽기 쉽습니다. [Microsoft의 Where-Object 문서](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/where-object)에도 이 별칭이 명시돼 있습니다.

명령과 인자의 역할은 다음과 같습니다.

| 명령·인자                                         | 설명                                                                                                                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `git --version`, `uv --version`                   | 각각 Git과 uv의 버전을 출력합니다. `--version`은 버전 정보를 요청하는 옵션입니다.                                                                                              |
| `code --version`                                  | VS Code의 버전, commit ID, 아키텍처를 출력합니다. 위 결과 표에는 버전만 발췌했습니다.                                                                                          |
| `where.exe git`, `where.exe code`, `where.exe uv` | 뒤의 이름은 검색 대상 인자입니다. 별도 검색 옵션 없이 현재 디렉터리와 PATH에 등록된 경로에서 일치하는 파일을 찾습니다. 확장자를 생략하면 PATHEXT에 등록된 확장자를 적용합니다. |

`where.exe`는 디스크 전체를 검색하는 명령으로 사용한 것이 아닙니다. 설명은 [Windows where 문서](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/where)와 [VS Code CLI 문서](https://code.visualstudio.com/docs/configure/command-line)를 참고했습니다.

## 2. Python 설치와 명령 탐색

Python은 uv로 설치했습니다. 당시 실행 기록에 남은 명령은 다음과 같습니다.

```powershell
uv python install 3.12
uv python list
python --version
python3.12 --version
where.exe python
uv python find 3.12
```

`3.12`를 지정한 설치 결과는 `3.12.14`였습니다. 이 명령 자체가 패치 버전까지 고정한 것은 아니므로, 설치 당시 결과를 함께 보관합니다.

설치 과정에는 내 계정의 `.local\bin`이 PATH에 없다는 경고가 있었습니다. 후속 `where.exe python` 출력에는 `.local\bin`과 WindowsApps 경로가 함께 나타났습니다. 다만 PATH를 어떻게 수정했는지는 당시 기록에 남아 있지 않습니다.

`uv python list`로 보이는 Python 목록과 `python --version`으로 실행되는 Python을 함께 확인했습니다. `uv python find 3.12`는 uv가 요청한 버전에 맞춰 찾는 실행 파일을 확인하는 데 썼습니다. 이 명령의 탐색 방식은 [uv의 Python 버전 문서](https://docs.astral.sh/uv/concepts/python-versions/)에서 확인할 수 있습니다.

| 명령·인자                | 설명                                                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uv python install 3.12` | `python`은 Python 관리 명령군, `install`은 설치 하위 명령입니다. `3.12`는 옵션이 아니라 설치할 버전 요청 인자이며, 패치 버전은 지정하지 않았습니다. |
| `uv python list`         | 설치된 Python과 설치 가능한 Python을 보여 줍니다. 설치된 것만 표시하도록 제한하는 옵션은 이 호출에 없습니다.                                        |
| `python --version`       | 현재 셸에서 `python`이라는 이름으로 실행되는 인터프리터의 버전을 출력합니다.                                                                        |
| `python3.12 --version`   | `python3.12`라는 명령 이름으로 버전을 조회합니다. 이름에 포함된 `3.12`는 별도 옵션이 아닙니다.                                                      |
| `where.exe python`       | `python`과 일치하는 파일 경로를 검색합니다. 여러 후보가 나오면 버전 조회 결과와 함께 읽습니다.                                                      |
| `uv python find 3.12`    | `find`는 조건에 맞는 Python 실행 파일의 경로를 찾습니다. `3.12`가 버전 조건이며, 이 명령 자체는 Python 설치 명령이 아닙니다.                        |

하위 명령과 기본 조회 범위는 [uv CLI 문서](https://docs.astral.sh/uv/reference/cli/#uv-python)에서 확인했습니다.

## 3. Jupyter 명령을 찾지 못했을 때

Jupyter를 확인하는 과정에서는 다음 호출이 실패했습니다.

```powershell
jupyter lab --version
```

명령을 찾지 못한다는 오류가 나왔습니다. 이어서 설치된 도구가 노출한 명령을 살폈습니다.

```powershell
uv tool list
jupyter-lab --version
where.exe jupyter-lab
```

`uv tool list`에는 `jupyter-lab`, `jupyter-labextension`, `jupyter-labhub`가 나타났고, `jupyter-lab --version`은 `4.6.3`을 반환했습니다. 당시 환경에서는 `jupyter lab`과 `jupyter-lab`의 차이가 실제 확인 결과를 바꿨습니다. 첫 호출이 실패했을 때 곧바로 재설치하기보다, 노출된 명령 이름을 먼저 확인한 과정이 기억할 만했습니다.

| 명령·인자               | 설명                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `jupyter lab --version` | `jupyter` 진입점에 `lab` 하위 명령과 버전 조회 옵션을 전달하는 호출입니다. 당시에는 진입점 명령을 찾지 못해 버전 조회까지 도달하지 못했습니다. |
| `uv tool list`          | uv로 설치한 도구와 노출된 실행 명령을 조회합니다. 프로젝트의 모든 Python 의존성을 나열하는 명령은 아닙니다. 추가 옵션은 사용하지 않았습니다.   |
| `jupyter-lab --version` | `jupyter-lab` 실행 명령에 버전 조회를 요청합니다. 하이픈은 명령 이름의 일부이며 옵션 구분자가 아닙니다.                                        |
| `where.exe jupyter-lab` | `jupyter-lab`이라는 이름으로 찾을 수 있는 실행 파일의 경로를 조회합니다.                                                                       |

도구 목록의 조회 범위는 [uv tool list 문서](https://docs.astral.sh/uv/reference/cli/#uv-tool-list)를 참고했습니다.

## 4. 파일 존재와 명령 검색을 나눠 보기

Windows 복구환경을 점검할 때도 명령 검색 문제가 있었습니다. 아래 명령은 `reagentc.exe`를 찾는 방법입니다. 당시 실행 결과는 남아 있지 않아 여기서는 조회 방법을 설명합니다.

```powershell
where.exe reagentc.exe
Get-Command reagentc.exe
Test-Path C:\Windows\System32\reagentc.exe
```

`Test-Path`가 `True`를 반환하면 다음과 같이 전체 경로로 실행할 수 있습니다.

```powershell
C:\Windows\System32\reagentc.exe /info
```

이 과정에서 남길 팁은 검색 결과가 없을 때 파일 부재를 바로 결론 내리지 않는 것입니다. 실행 파일 검색, 알려진 경로의 파일 존재, 실제 명령 실행을 순서대로 구분해 볼 수 있습니다. 이 명령 목록만으로 당시 WinRE 상태를 판단할 수는 없습니다.

| 명령·인자                                    | 설명                                                                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `where.exe reagentc.exe`                     | 검색 대상에 `.exe`까지 지정해 현재 디렉터리와 PATH에서 파일을 찾습니다.                                                                      |
| `Get-Command reagentc.exe`                   | PowerShell이 해당 이름의 명령을 찾을 수 있는지 조회하고 명령 정보를 반환합니다. `reagentc.exe`는 이름 인자이며 프로그램을 실행하지 않습니다. |
| `Test-Path C:\Windows\System32\reagentc.exe` | 주어진 전체 경로가 존재하는지 `True` 또는 `False`로 반환합니다. 경로는 위치 인자이며, 이 호출은 파일의 정상 실행 여부를 검사하지 않습니다.   |
| `C:\Windows\System32\reagentc.exe /info`     | 전체 경로로 프로그램을 실행합니다. `/info`는 Windows RE의 상태와 복구 정보를 표시하는 옵션입니다.                                            |

명령 동작은 [Get-Command](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/get-command), [Test-Path](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/test-path), [REAgentC](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/reagentc-command-line-options) 공식 문서를 참고했습니다.

## 5. 설치 목록을 읽기 쉽게 줄이기

앱 패키지 목록을 확인할 때는 필요한 속성만 골라 정렬했습니다. 아래 명령과 목록 출력은 당시 실행 기록에 남아 있습니다.

```powershell
Get-AppxPackage |
Select-Object Name |
Sort-Object Name
```

이때는 패키지 이름을 살피는 목적이어서 `Name`만 남겼습니다. 버전·설치 경로까지 보관한 목록으로 취급하지 않으며, 일반 데스크톱 프로그램 전체 목록과도 구분합니다.

| 명령·구문            | 설명                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Get-AppxPackage`    | 현재 사용자 프로필에 설치된 앱 패키지를 조회합니다. 다른 사용자나 전체 사용자를 지정하는 옵션은 사용하지 않았습니다.         |
| `\|`                 | 앞 명령의 결과 객체를 다음 명령으로 전달하는 PowerShell 파이프입니다. 여기서는 패키지 객체를 넘긴 뒤 필요한 속성을 고릅니다. |
| `Select-Object Name` | 각 객체에서 `Name` 속성만 선택합니다. `Name`은 `-Property`의 위치 인자이며 패키지 이름을 새로 지정하는 값이 아닙니다.        |
| `Sort-Object Name`   | 전달받은 객체를 `Name` 속성 기준으로 기본 오름차순 정렬합니다. 여기서도 `Name`은 정렬 기준 속성의 위치 인자입니다.           |

조회 범위와 속성 선택은 [Get-AppxPackage](https://learn.microsoft.com/en-us/powershell/module/appx/get-appxpackage)와 [Select-Object](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/select-object) 문서를 참고했습니다.

구축 과정을 다시 읽으면서, 짧은 조회 명령에도 확인하려던 질문이 있었다는 점이 보였습니다. 버전은 무엇인지, 어떤 경로가 발견되는지, 도구가 실제로 노출한 명령은 무엇인지가 각각 달랐습니다. 앞으로도 명령만 복사해 두기보다 그때의 질문과 필요한 출력까지 함께 남기려 합니다.

## 6. Windows 설치와 패키지 조회

다음은 WinGet으로 패키지를 설치하고 조회하는 명령입니다. 개별 실행 결과는 남아 있지 않습니다. `install`은 설치, `list`는 목록 조회입니다. `--id`는 패키지 ID, `-e`는 정확한 일치, `--scope machine`은 전체 사용자 설치 범위 요청입니다. 뒤의 Firefox·Chrome 문자열은 목록 검색 인자입니다. 설치 파일 자체를 보관하는 명령은 아닙니다.

```powershell
winget install --id Git.Git -e
winget install --id Microsoft.VisualStudioCode -e --scope machine
winget install --id astral-sh.uv -e
```

```powershell
winget install --id Mozilla.Firefox -e
winget install --id Google.Chrome -e
winget list Firefox
winget list "Google Chrome"
```

```powershell
winget install --id 7zip.7zip -e
winget install --id DigitalScholar.Zotero -e
```

## 7. 기존 조회와 확장 설치 원문

버전·경로 조회는 앞 절에서 설명했습니다. 여기서는 당시 명령을 한 묶음으로 살펴봅니다. `--install-extension` 뒤에는 확장 ID가 오며, `uv add --dev ipykernel`의 `--dev`는 개발 의존성으로 추가합니다. `jupyter lab --version`의 실패와 `jupyter-lab --version`의 성공을 함께 남깁니다.

```powershell
code --install-extension ms-python.python
uv add --dev ipykernel
code --install-extension ms-toolsai.jupyter
jupyter lab --version
uv tool list
jupyter-lab --version
where.exe jupyter-lab
```

## 8. uv 의존성과 캐시

첫 묶음은 실행 출력이 있습니다. `uv add`는 의존성을 추가하고 `uv run`은 프로젝트 환경에서 명령을 실행합니다. `New-Item -ItemType Directory -Force`는 디렉터리를 준비하며 `-Force`는 이미 존재하는 디렉터리를 허용합니다. hardlink 실패 뒤 copy fallback 경고가 있었지만 설치는 완료됐습니다. 캐시를 D:로 옮긴 상태는 앞선 개발환경 노트에 기록했고, 오프라인 자산 점검에서도 해당 위치의 uv 캐시를 확인했습니다. 아래에는 그 경로를 지정하는 환경변수 설정을 남겼습니다. `User`는 사용자 범위이며, 변경 후에는 새 셸에서 캐시 경로를 확인해야 합니다.

```powershell
uv add requests
uv cache dir
New-Item -ItemType Directory -Force D:\Lab\OfflineLab\cache\uv
uv run python .\main.py
```

```powershell
[Environment]::SetEnvironmentVariable("UV_CACHE_DIR", "D:\Lab\OfflineLab\cache\uv", "User")
```

## 9. 가상화 기능과 서비스 진단

`-Property`는 조회 속성, `-Online`은 현재 Windows, `-Match`는 정규식 필터입니다. 패턴 안의 `|`는 대안이며 파이프와 구분합니다. `Get-Service`의 쉼표 목록은 서비스 이름입니다. `findstr /i`는 대소문자를 무시합니다. `-ErrorAction SilentlyContinue`는 오류 표시를 억제하므로 빈 결과를 정상 판정으로 읽지 않습니다. `-ClassName`과 `-Namespace`는 CIM 조회 대상을 지정합니다. 초기에는 vmcompute와 hcsdiag 조회 실패가 있었고 후속 상태가 달랐습니다. Device Guard 조회 방법은 뒤이어 확인한 속성 값과 함께 정리했습니다.

```powershell
Get-ComputerInfo -Property `
  HyperVisorPresent, `
  HyperVRequirementVMMonitorModeExtensions, `
  HyperVRequirementVirtualizationFirmwareEnabled, `
  HyperVRequirementSecondLevelAddressTranslation, `
  HyperVRequirementDataExecutionPreventionAvailable
```

```powershell
Get-WindowsOptionalFeature -Online |
Where-Object FeatureName -Match 'VirtualMachinePlatform|Microsoft-Windows-Subsystem-Linux' |
Select-Object FeatureName, State
```

```powershell
bcdedit /enum {current} | findstr /i hypervisorlaunchtype
Get-Service vmcompute,wslservice,hvservice |
Select-Object Name,Status,StartType
hcsdiag hostproperties processortopology
hcsdiag hostproperties cpugroup
```

```powershell
Get-WindowsOptionalFeature -Online |
Where-Object FeatureName -Match 'VirtualMachinePlatform|HypervisorPlatform|Microsoft-Windows-Subsystem-Linux' |
Select-Object FeatureName, State
Get-Service vmcompute,wslservice,hvservice -ErrorAction SilentlyContinue |
Select-Object Name,Status,StartType
wsl --status
```

```powershell
Get-CimInstance `
  -ClassName Win32_DeviceGuard `
  -Namespace root\Microsoft\Windows\DeviceGuard |
Select-Object `
  VirtualizationBasedSecurityStatus,
  SecurityServicesConfigured,
  SecurityServicesRunning
```

## 10. WSL 설치와 공유 경로

실행 출력이 남은 묶음입니다. `--list --online`은 설치 가능한 배포판을 조회하고 `--distribution`은 배포판, `--location`은 저장 위치, `--no-launch`는 설치 직후 실행하지 않도록 지정합니다. `-d`는 실행할 배포판입니다. Bash에서 `cd ~`는 홈 이동, `pwd`는 현재 경로, `cat`은 파일 내용, `uname -a`는 시스템 정보를 표시합니다. `>`는 파일을 새로 쓰거나 덮어씁니다. 당시 ext4.vhdx와 WSL 2, 공유 경로의 시험 파일 출력이 확인됐습니다.

```powershell
wsl --list --online
wsl --install --distribution Ubuntu-26.04 --location D:\Lab\WSL\Ubuntu-26.04 --no-launch
wsl -l -v
Get-ChildItem D:\Lab\WSL\Ubuntu-26.04
wsl -d Ubuntu-26.04
```

```bash
cd ~
pwd
cat /etc/os-release
uname -a
python3 --version
ls /mnt/d/Lab
echo "WSL baseline OK" > /mnt/d/Lab/Research/wsl-test.txt
cat /mnt/d/Lab/Research/wsl-test.txt
```

## 11. Git 설정과 변경 확인

Windows 작업 위치는 `D:\Lab\Research\smoke-test`, WSL은 `~/research/wsl-smoke-test`였습니다. `--global`은 사용자 설정, `input`은 당시 `core.autocrlf` 값입니다. `init`은 초기화, `add .`은 현재 경로의 변경 스테이징, `commit -m`은 메시지를 지정한 커밋입니다. `branch -m`은 이름 변경, `--show-current`는 현재 브랜치 조회입니다. `status --short`는 짧은 상태, `log -1 --oneline`은 최근 한 커밋의 한 줄 표시입니다. `diff --`는 뒤를 경로로 구분하며 `ls-files --eol`은 인덱스·작업 파일의 줄바꿈을 조회합니다. 이메일은 `<email>`로 일반화했습니다. 초기 Windows 커밋의 브랜치는 `master`였고, `.gitattributes` 변경 원인은 미확인입니다.

```powershell
Get-Content .gitignore
git config --global core.autocrlf input
git config --global core.autocrlf
git init
git status --short
git add .
git commit -m "Initial smoke test"
```

```bash
git config --global user.name "SecurityOn"
git config --global user.email "<email>"
git config --global core.autocrlf input
git init
git config --global init.defaultBranch main
git branch -m main
git branch --show-current
printf '* text=auto eol=lf\n' > .gitattributes
git status --short
git add .
git commit -m "Initial WSL smoke test"
git log -1 --oneline
```

```powershell
wsl -l -v
cd D:\Lab\Research\smoke-test
uv run python .\main.py
git status --short
```

```bash
python3 main.py
git status --short
git diff -- .gitattributes
git ls-files --eol .gitattributes
```

## 12. OS·복구 상태와 사용자 폴더

다음은 OS와 복구 상태를 조회하는 명령입니다. 당시 결과는 이미지로만 남아 있어 여기서는 상태 값을 옮기지 않았습니다. `manage-bde -status`는 BitLocker 상태, `dsregcmd /status`는 장비 등록 상태, `dism /online /Get-CurrentEdition`은 실행 중인 Windows 에디션 조회입니다. SoftwareLicensingService 속성 조회는 실제 제품 키를 표시할 수 있으므로 출력 값은 게시하지 않습니다. 사용자 폴더는 User Shell Folders 레지스트리에서 지정한 속성을 조회했습니다.

```powershell
where.exe reagentc.exe
Get-Command reagentc.exe
Test-Path C:\Windows\System32\reagentc.exe
C:\Windows\System32\reagentc.exe /info
manage-bde -status
dsregcmd /status
dism /online /Get-CurrentEdition
(Get-CimInstance -ClassName SoftwareLicensingService).OA3xOriginalProductKey
```

```powershell
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders' |
Select-Object Desktop, Personal, 'My Pictures', 'My Music', 'My Video', '{374DE290-123F-4565-9164-39C4925E467B}'
```

## 13. 기록 파일 검색과 줄바꿈 확인

development-*는 이름 접두사에 맞는 항목을 찾는 와일드카드입니다. 이 검색의 결과는 남아 있지 않습니다. WSL에서는 `cat`과 `git status`로 파일 내용과 변경 상태를 확인했습니다. text 블록은 당시 .gitattributes의 내용입니다. `* text=auto eol=lf`는 Git 속성 설정이지 셸 명령이 아닙니다.

```powershell
Get-ChildItem D:\Lab\OfflineLab\manifests\development-*
```

```bash
cd ~/research/wsl-smoke-test
cat .gitattributes
git status --short
```

```text
* text=auto eol=lf
```

## 14. Linux 도구·프로젝트·확장 구성

설치 명령은 이후 확인한 버전·설정과 함께 정리했습니다. JSON 설정을 읽고 가상환경을 활성화한 명령도 포함했습니다. `mkdir -p`는 필요한 상위 경로를 포함해 디렉터리를 만들고 기존 디렉터리를 허용합니다. `uv init --python 3.12`는 프로젝트 Python 조건, `uv add`의 ==는 버전 고정, >=는 최소 버전입니다. `--index 이름=URL`은 패키지 소스를 지정합니다. `sudo apt update`는 패키지 목록 갱신, `apt install -y`는 설치 질문에 자동 동의입니다. `@버전`은 확장 버전, `--force`는 강제 설치 요청입니다. `source`는 현재 Bash에 가상환경 활성화 코드를 읽습니다. `kernelspec list`로 커널 목록을 조회할 수 있습니다. 당시 조회 결과는 남아 있지 않습니다.

```bash
cd ~/research
mkdir -p transformers-smoke-test
cd transformers-smoke-test
uv init --python 3.12
uv add \
  "torch==2.14.0+cu132" \
  "torchvision==0.29.0+cu132" \
  --index pytorch=https://download.pytorch.org/whl/cu132
uv add \
  "transformers==5.17.0" \
  "accelerate==1.15.0" \
  "safetensors>=0.8.0"
uv run python -c "import torch, transformers, accelerate, safetensors; print('Python OK'); print('torch:', torch.__version__); print('transformers:', transformers.__version__); print('accelerate:', accelerate.__version__); print('CUDA:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0))"
cat pyproject.toml
```

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  cmake \
  ninja-build \
  pkg-config
echo "=== Build Toolchain ==="
gcc --version | head -1
g++ --version | head -1
make --version | head -1
cmake --version | head -1
ninja --version
pkg-config --version
```

```bash
cd ~/research
mkdir -p wsl-research-base
cd wsl-research-base
uv init --python 3.12
uv add jupyterlab ipython ipykernel
uv run python --version
uv run jupyter-lab --version
uv run python -c "import IPython, ipykernel; print('IPython:', IPython.__version__); print('ipykernel:', ipykernel.__version__)"
uv run jupyter kernelspec list
```

```bash
cat ~/.vscode-server/extensions/extensions.json
```

```bash
code \
  --install-extension ms-python.python@2026.4.0 \
  --install-extension ms-python.debugpy@2026.6.0 \
  --install-extension ms-python.vscode-python-envs@1.36.0 \
  --force
code --list-extensions --show-versions | sort
```

```bash
source /home/securityon/research/wsl-research-base/.venv/bin/activate
```

## 15. TensorFlow nightly 설치

다음은 당시 nightly 버전을 지정한 설치 명령입니다. 설치 명령 자체의 실행 출력은 남아 있지 않으며, 이후 연산 결과는 GPU 검증 스크립트 편에서 다룹니다. `[and-cuda]`는 추가 의존성 묶음, `==`는 특정 nightly 버전 고정입니다. stable TensorFlow를 통과한 기록으로 쓰지 않습니다.

```bash
cd ~/research
mkdir -p tensorflow-nightly-smoke-test
cd tensorflow-nightly-smoke-test
uv init --python 3.12
uv add "tf-nightly[and-cuda]==2.22.0.dev20260923"
uv run python -c "import tensorflow as tf; print(tf.__version__); print(tf.config.list_physical_devices('GPU'))"
```

## 16. cuDNN과 복원본 조회

cuDNN 패키지는 다음 명령으로 확인했습니다. `dpkg -l`은 패키지 목록, `grep -i`는 대소문자 무시 필터입니다. uv pip list는 프로젝트 패키지 목록입니다. HEAD 조회 묶음은 초기 복구에서 실패한 기록이며 fsck는 93839개 객체를 검사했습니다. 뒤의 명령은 복원본의 사용자·폴더·배포판을 확인하는 방법입니다. 이 조회들의 개별 결과는 남아 있지 않습니다. `id`는 사용자 정보, `whoami`는 현재 사용자, WSL `-u`는 실행 사용자 지정입니다.

```bash
dpkg -l | grep -i cudnn
cd ~/research/tensorflow-nightly-smoke-test
uv pip list | grep -i cudnn
```

```powershell
git rev-parse HEAD
git status --short
git fsck --full
git rev-list --count HEAD
```

```bash
id securityon
ls -ld /home/securityon
ls -ld /home/securityon/research
ls -d /home/securityon/research/*
```

```powershell
wsl -d Ubuntu-26.04-RestoreTest -u securityon
```

```bash
whoami
uv --version
python3 --version
code --list-extensions --show-versions | sort
```

## 옵션 설명의 참고 문서

설치·프로젝트 옵션은 [WinGet install](https://learn.microsoft.com/en-za/windows/package-manager/winget/install), [uv CLI](https://docs.astral.sh/uv/reference/cli/)를 참고했습니다. 이 문서는 명령 동작 설명을 보조하며 당시 실행 결과를 대신하지 않습니다.
