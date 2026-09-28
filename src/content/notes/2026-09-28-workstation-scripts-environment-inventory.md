---
title: "스크립트: 환경 기록과 GPU 검증"
description: "환경 목록 저장과 PyTorch·TensorFlow 시험에 사용한 PowerShell·Bash 스크립트의 옵션과 결과를 정리합니다."
lang: ko
translationKey: workstation-scripts-environment-inventory
pubDatetime: 2026-09-28T01:00:00+09:00
tags:
  - research-journey
  - windows
  - workstation
  - development
  - wsl
featured: false
draft: false
---

Windows와 WSL 환경을 나중에 비교할 수 있도록 조회 결과를 파일로 모았습니다. 이 글에는 환경 목록을 남기는 스크립트와 PyTorch·TensorFlow GPU 시험을 정리합니다. 개별 설치·조회 명령은 「워크스테이션 구축 명령어 기록」에서, 보존과 복구는 「스크립트: 오프라인 보존과 복구」에서 다룹니다.

각 스크립트의 옵션과 인자는 당시 값을 유지했습니다. 제안된 점검과 실행 결과가 남은 시험은 해당 절에서 구분합니다.

## 1. PowerShell에서 환경 기록을 파일로 저장하기

다음은 Windows 개발환경의 정보를 한 파일로 모으도록 당시 대화에서 제안된 원문입니다. 각 줄의 실행 출력까지 확보한 것은 아닙니다. `D:\Lab\OfflineLab\manifests`가 이미 존재하는 구성을 전제로 하며, 같은 출력 파일이 있으면 덮어씁니다.

```powershell
@(
  "=== Windows Research Development Baseline ==="
  "Recorded: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
  ""
  "=== Git ==="
  (git --version)
  ""
  "=== VS Code ==="
  (code --version)
  ""
  "=== uv ==="
  (uv --version)
  "uv cache: $(uv cache dir)"
  ""
  "=== Python ==="
  (python --version)
  "Python path:"
  (where.exe python)
  ""
  "=== JupyterLab ==="
  "JupyterLab $(jupyter-lab --version)"
  ""
  "=== WSL ==="
  (wsl --version)
  ""
  (wsl --status)
  ""
  (wsl -l -v)
) | Out-File `
  D:\Lab\OfflineLab\manifests\development-windows-baseline.txt `
  -Encoding utf8
```

| 명령·구문                                  | 이 스크립트에서의 역할                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `@(...)`                                   | 제목 문자열과 명령 결과를 배열로 모읍니다. 빈 문자열은 구분용 빈 줄입니다.                                  |
| `$(...)`                                   | 문자열 안에서 명령이나 식을 평가하고 그 결과를 넣습니다.                                                    |
| `Get-Date -Format 'yyyy-MM-dd HH:mm:ss K'` | 기록 시각의 표시 형식을 지정합니다. 연·월·일, 24시간제 시·분·초와 시간대 정보를 나타내는 형식 문자열입니다. |
| `(git --version)` 등                       | 괄호 안의 명령을 평가해 버전 출력을 배열에 넣습니다. `code --version`은 commit ID와 아키텍처도 출력합니다.  |
| `uv cache dir`                             | uv 캐시 디렉터리를 조회합니다. `dir`은 조회 하위 명령이며 디렉터리를 생성하지 않습니다.                     |
| `where.exe python`                         | 현재 디렉터리와 PATH에서 Python 이름과 일치하는 파일을 찾습니다.                                            |
| `wsl --version`                            | WSL과 관련 구성요소의 버전 정보를 조회합니다.                                                               |
| `wsl --status`                             | 기본 배포판 등 WSL 구성 상태를 조회합니다.                                                                  |
| `wsl -l -v`                                | `-l`은 배포판 목록, `-v`는 상세 표시입니다. 배포판별 실행 상태와 WSL 1/2 버전을 확인하는 데 씁니다.         |
| `\| Out-File`                              | 모은 결과를 텍스트 파일로 보냅니다. 뒤의 경로는 출력 파일 인자입니다.                                       |
| `-Encoding utf8`                           | 출력 인코딩을 UTF-8로 지정합니다. UTF-8 BOM 처리까지 모든 PowerShell 버전에서 같다고 가정하지 않습니다.     |

줄 끝의 백틱은 PowerShell 줄 연결 문자입니다. 복사하면서 백틱 뒤에 공백이 붙지 않도록 주의해야 합니다. 이 스크립트는 결과를 모으는 용도라 개별 명령 실패를 자동 판정하거나 모든 오류 출력을 파일에 합치는 처리는 없습니다. 파일이 생겼다는 사실만으로 환경 전체가 정상이라고 판단하지 않습니다.

출력 동작과 WSL 옵션은 [Out-File 문서](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/out-file)와 [WSL 기본 명령 문서](https://learn.microsoft.com/en-us/windows/wsl/basic-commands)를 참고했습니다.

## 2. PowerShell에서 확장 목록 저장하기

같은 대화에서 별도로 제안된 확장 목록 저장 명령입니다. 환경 기록과 파일을 나눠 두면 확장만 비교할 때 찾아보기 쉽습니다.

```powershell
code --list-extensions --show-versions |
Out-File `
  D:\Lab\OfflineLab\manifests\development-vscode-extensions.txt `
  -Encoding utf8
```

| 명령·옵션                | 설명                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| `code --list-extensions` | VS Code 확장 식별자를 나열합니다.                                 |
| `--show-versions`        | 확장 목록에 버전 정보를 함께 표시합니다.                          |
| `Out-File`와 출력 경로   | 목록을 지정한 파일에 저장합니다. 여기서도 기존 파일은 덮어씁니다. |
| `-Encoding utf8`         | 텍스트 인코딩을 지정합니다.                                       |

이 블록은 Windows PowerShell에서의 목록 저장 제안입니다. WSL remote 확장의 상태는 WSL 쪽에서 별도로 확인했습니다. 두 목록을 하나의 설치 상태로 합치지 않습니다. 옵션 설명은 [VS Code CLI 문서](https://code.visualstudio.com/docs/configure/command-line)를 참고했습니다.

## 3. Bash에서 Linux 빌드 도구 확인하기

아래는 WSL Bash에서 실행한 명령과 후속 출력이 남은 구간입니다.

```bash
echo "=== Build Toolchain ==="

gcc --version | head -1
g++ --version | head -1
make --version | head -1
cmake --version | head -1
ninja --version
pkg-config --version
```

| 명령·옵션                                   | 설명                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `echo`와 뒤의 문자열                        | 결과 묶음의 제목을 출력합니다.                                                              |
| `gcc`, `g++`, `make`, `cmake`의 `--version` | 각 빌드 도구의 버전 정보를 출력합니다.                                                      |
| `\| head -1`                                | 앞 명령의 표준 출력을 받아 첫 줄만 표시합니다. `-1`은 당시 사용한 첫 한 줄 지정 형식입니다. |
| `ninja --version`, `pkg-config --version`   | 두 도구의 버전을 조회합니다. 이 두 줄에는 `head`를 연결하지 않았습니다.                     |

당시 결과는 GCC·G++ `15.2.0`, GNU Make `4.4.1`, CMake `4.2.3`, Ninja `1.13.2`, pkg-config `2.5.1`이었습니다. 이 조회는 도구가 실행되고 버전을 반환하는지 확인한 기록입니다. 소스를 컴파일하거나 링크한 시험은 별도 기록에서 다룹니다.

## 4. Bash에서 디렉터리 이름만 추리기

복원된 연구 프로젝트와 VS Code Server 디렉터리를 확인할 때는 다음 조회가 제안됐습니다. 각각의 시험 문맥에서 가져온 두 명령이며, 개별 실행 출력은 아직 모두 확보하지 못했습니다.

```bash
find ~/research -maxdepth 1 -mindepth 1 -type d -printf '%f\n' | sort
find ~/.vscode-server/bin -maxdepth 1 -mindepth 1 -type d -printf '%f\n'
```

| 인자·옵션                            | 설명                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| `~/research`, `~/.vscode-server/bin` | 검색 시작 경로입니다. Bash의 `~`는 사용자 홈 디렉터리를 나타냅니다.                       |
| `-maxdepth 1`                        | 시작 디렉터리의 바로 아래 단계까지만 탐색합니다.                                          |
| `-mindepth 1`                        | 시작 디렉터리 자체를 결과에서 제외합니다.                                                 |
| `-type d`                            | 디렉터리만 고릅니다.                                                                      |
| `-printf '%f\n'`                     | 전체 경로 대신 마지막 경로 요소인 이름과 줄바꿈을 출력합니다. GNU find의 형식 지정입니다. |
| `\| sort`                            | 첫 명령의 결과 줄을 정렬합니다. 두 번째 원문에는 이 단계가 없습니다.                      |

첫 명령으로는 연구 프로젝트 이름을, 두 번째로는 해당 위치의 서버 디렉터리 이름을 살피려 했습니다. 디렉터리가 존재하는지와 그 안의 환경이 실제로 동작하는지는 이후 실행 시험으로 구분해야 합니다.

## 5. 설치·스토리지 목록 내보내기

첫 블록은 실행 출력이 있으며 나머지는 보완 제안입니다. `winget export -o`는 JSON 대상 파일, `--include-versions`는 버전 포함입니다. 일부 설치 패키지나 버전을 원본에서 찾을 수 없다는 경고가 있었습니다. `Get-Item`은 파일 정보, `Get-Content`는 내용, `Get-ItemProperty`는 레지스트리 속성을 읽습니다. HKLM 두 경로는 설치 항목을 조회하고 `Where-Object DisplayName`으로 이름이 있는 항목을 추립니다. `Format-Table -AutoSize`는 열 너비를 조정하는 표시 형식이며 구조화된 데이터 내보내기가 아닙니다. Known Folder GUID는 개인 식별자가 아닌 원문 속 폴더 식별자입니다.

```powershell
winget list | Out-File `
  D:\Lab\OfflineLab\manifests\winget-list-productivity-baseline.txt `
  -Encoding utf8
winget export `
  -o D:\Lab\OfflineLab\manifests\winget-productivity-baseline.json `
  --include-versions
```

```powershell
Get-Item D:\Lab\OfflineLab\manifests\winget-productivity-baseline.json
Get-Content D:\Lab\OfflineLab\manifests\winget-productivity-baseline.json
Get-AppxPackage |
Select-Object Name, Version, PackageFullName |
Sort-Object Name |
Out-File `
  D:\Lab\OfflineLab\manifests\appx-productivity-baseline.txt `
  -Encoding utf8
Get-ItemProperty `
  HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*, `
  HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* `
  -ErrorAction SilentlyContinue |
Where-Object DisplayName |
Select-Object DisplayName, DisplayVersion, Publisher |
Sort-Object DisplayName |
Out-File `
  D:\Lab\OfflineLab\manifests\installed-programs-productivity-baseline.txt `
  -Encoding utf8
```

```powershell
Get-ComputerInfo | Out-File `
  D:\Lab\OfflineLab\manifests\system-baseline.txt `
  -Encoding utf8
Get-Volume | Format-Table DriveLetter,FileSystemLabel,FileSystem,Size,SizeRemaining -AutoSize |
Out-File D:\Lab\OfflineLab\manifests\storage-baseline.txt -Encoding utf8
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders' |
Select-Object Desktop, Personal, 'My Pictures', 'My Music', 'My Video', '{374DE290-123F-4565-9164-39C4925E467B}' |
Out-File D:\Lab\OfflineLab\manifests\known-folders-baseline.txt -Encoding utf8
```

## 6. Windows·WSL 기준 상태 저장

모두 제안 원문입니다. 앞 절과 동일한 블록은 재수록하지 않습니다. Git 설정 조회에 값을 넘기지 않으면 현재 값을 읽습니다. 실제 이메일·사용자 경로가 결과에 들어갈 수 있어 결과 파일 공개 전 확인이 필요합니다. Bash `{ ...; }` 묶음은 같은 셸에서 실행하며 `>`로 표준 출력을 저장합니다. `date --iso-8601=seconds`는 초 단위 시각 형식, `ls -ld`는 디렉터리 자체의 상세 정보입니다.

```powershell
@(
  "=== Windows Git Baseline ==="
  "Recorded: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
  ""
  "user.name=$(git config --global user.name)"
  "user.email=$(git config --global user.email)"
  "core.autocrlf=$(git config --global core.autocrlf)"
  "init.defaultBranch=$(git config --global init.defaultBranch)"
) | Out-File `
  D:\Lab\OfflineLab\manifests\development-git-config.txt `
  -Encoding utf8
```

```bash
{
  echo "=== WSL Research Development Baseline ==="
  echo "Recorded: $(date --iso-8601=seconds)"
  echo
  echo "=== OS ==="
  cat /etc/os-release
  echo
  echo "=== Kernel ==="
  uname -a
  echo
  echo "=== Python ==="
  python3 --version
  which python3
  echo
  echo "=== Git ==="
  git --version
  which git
  echo
  echo "user.name=$(git config --global user.name)"
  echo "user.email=$(git config --global user.email)"
  echo "core.autocrlf=$(git config --global core.autocrlf)"
  echo "init.defaultBranch=$(git config --global init.defaultBranch)"
  echo
  echo "=== Filesystem ==="
  echo "HOME=$HOME"
  echo "PWD=$PWD"
  echo
  echo "=== D: mount ==="
  ls -ld /mnt/d/Lab
} > /mnt/d/Lab/OfflineLab/manifests/development-wsl-baseline.txt
```

## 7. WSL GPU와 재부팅 후 시험

첫 블록에는 실제 출력이 있고 나머지는 Windows 재부팅 후 점검 제안과 사용자 통과 보고입니다. `python -c`는 문자열 코드를 실행하고 `python -`는 표준 입력 코드를 실행합니다. `<<'PY'`는 셸 확장 없이 Python 본문을 전달하는 here-document입니다. 행렬을 cuda에 만들고 synchronize로 완료를 기다립니다. 모델 시험은 float16, 로컬 파일만 사용, 결정적 토큰 선택(do_sample=False)을 지정했습니다. `max_new_tokens=32`는 추가 생성 길이입니다. `grep -E`는 확장 정규식, `uname -r`은 커널 릴리스, `test -e`는 경로 존재, `&&`는 앞 명령 성공 시 후속 실행입니다. 이 블록은 뒤의 물리적 오프라인 시험과 별개입니다.

```bash
python --version
which python
python -c "import torch; print('PyTorch:', torch.__version__); print('CUDA runtime:', torch.version.cuda); print('CUDA available:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0))"
python - <<'PY'
import torch

a = torch.randn((2048, 2048), device="cuda")
b = torch.randn((2048, 2048), device="cuda")
c = a @ b
torch.cuda.synchronize()

print("Shape:", c.shape)
print("Device:", c.device)
print("VS Code WSL PyTorch CUDA PASS")
PY
```

```bash
echo "=== OS / Kernel ==="
grep -E '^(PRETTY_NAME|VERSION_ID|VERSION_CODENAME)=' /etc/os-release
uname -r
echo
echo "=== Build Toolchain ==="
gcc --version | head -1
g++ --version | head -1
make --version | head -1
cmake --version | head -1
ninja --version
pkg-config --version
echo
echo "=== Python / uv ==="
python3 --version
uv --version
uv python list --only-installed
echo
echo "=== Jupyter Base ==="
cd ~/research/wsl-research-base
uv run jupyter-lab --version
uv run python -c "import IPython, ipykernel; print('IPython:', IPython.__version__); print('ipykernel:', ipykernel.__version__)"
echo
echo "=== GPU ==="
test -e /dev/dxg && echo "/dev/dxg: PASS"
/usr/lib/wsl/lib/nvidia-smi | head -15
echo
echo "=== VS Code Server ==="
find ~/.vscode-server/bin -maxdepth 1 -mindepth 1 -type d -printf '%f\n'
echo
echo "=== Remote Extensions ==="
code --list-extensions --show-versions | sort
```

```bash
cd ~/research/pytorch-smoke-test
uv run python - <<'PY'
import torch

print("PyTorch:", torch.__version__)
print("CUDA runtime:", torch.version.cuda)
print("CUDA available:", torch.cuda.is_available())
print("GPU:", torch.cuda.get_device_name(0))

a = torch.randn((2048, 2048), device="cuda")
b = torch.randn((2048, 2048), device="cuda")
c = a @ b
torch.cuda.synchronize()

print("Device:", c.device)
print("WSL PyTorch persistence PASS")
PY
```

```bash
cd ~/research/transformers-smoke-test
HF_HUB_CACHE=/mnt/d/Lab/Models/HuggingFace \
HF_HUB_OFFLINE=1 \
TRANSFORMERS_OFFLINE=1 \
uv run python - <<'PY'
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "Qwen/Qwen3-0.6B"

tokenizer = AutoTokenizer.from_pretrained(
    model_id,
    local_files_only=True,
)

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    dtype=torch.float16,
    local_files_only=True,
).to("cuda")

inputs = tokenizer(
    "Explain CUDA in one short sentence.",
    return_tensors="pt",
).to("cuda")

with torch.inference_mode():
    outputs = model.generate(
        **inputs,
        max_new_tokens=32,
        do_sample=False,
    )

print("Device:", next(model.parameters()).device)
print("WSL Transformers persistence PASS")
PY
```

## 8. TensorFlow 연산·메모리·XLA

첫 연산은 제안이며 memory growth·XLA 블록에는 사용자 명령과 출력이 있습니다. 메모리 증가 설정은 GPU 초기화 전 적용하며 `jit_compile=True`는 XLA 컴파일 요청입니다. c.numpy()로 결과를 읽어 실행 완료를 확인합니다. 출력 발췌 외에 PTX JIT 경고와 AutoGraph 소스 탐색 경고도 있었습니다. nightly 성공은 stable 채택과 구분합니다.

```bash
uv run python - <<'PY'
import tensorflow as tf

print("TensorFlow:", tf.__version__)
print("GPUs:", tf.config.list_physical_devices("GPU"))

with tf.device("/GPU:0"):
    a = tf.random.normal((2048, 2048))
    b = tf.random.normal((2048, 2048))
    c = tf.matmul(a, b)
    _ = c.numpy()

print("Shape:", c.shape)
print("Device:", c.device)
print("TensorFlow Nightly GPU execution PASS")
PY
```

```bash
uv run python - <<'PY'
import tensorflow as tf

gpus = tf.config.list_physical_devices("GPU")
print("TensorFlow:", tf.__version__)
print("GPUs:", gpus)

for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

print("Memory growth:",
      tf.config.experimental.get_memory_growth(gpus[0]))

with tf.device("/GPU:0"):
    a = tf.random.normal((2048, 2048))
    b = tf.random.normal((2048, 2048))
    c = tf.matmul(a, b)
    _ = c.numpy()

print("Shape:", c.shape)
print("Device:", c.device)
print("TensorFlow Nightly memory-growth GPU PASS")
PY
```

```text
TensorFlow: 2.22.0-dev20260923
GPUs: [PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]
Memory growth: True
Shape: (2048, 2048)
Device: /job:localhost/replica:0/task:0/device:GPU:0
TensorFlow Nightly memory-growth GPU PASS
```

```bash
uv run python - <<'PY'
import tensorflow as tf

gpus = tf.config.list_physical_devices("GPU")
for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

@tf.function(jit_compile=True)
def gpu_matmul(a, b):
    return tf.matmul(a, b)

with tf.device("/GPU:0"):
    a = tf.random.normal((1024, 1024))
    b = tf.random.normal((1024, 1024))
    c = gpu_matmul(a, b)
    _ = c.numpy()

print("TensorFlow:", tf.__version__)
print("Shape:", c.shape)
print("Device:", c.device)
print("TensorFlow Nightly XLA GPU PASS")
PY
```

```text
TensorFlow: 2.22.0-dev20260923
Shape: (1024, 1024)
Device: /job:localhost/replica:0/task:0/device:GPU:0
TensorFlow Nightly XLA GPU PASS
```

환경 목록은 이후 비교할 기준을 남기고, GPU 시험은 위 조건에서 실행된 범위를 기록합니다. TensorFlow nightly의 결과와 재시험을 기다리는 stable 경로의 상태는 구분해 둡니다.
