---
title: "스크립트: 오프라인 보존과 복구"
description: "Git 번들, WSL 스냅샷, 해시 목록과 오프라인 실행 스크립트를 실패·수정 과정 및 시험 조건과 함께 기록합니다."
lang: ko
translationKey: workstation-scripts-offline-recovery
pubDatetime: 2026-09-28T02:00:00+09:00
tags:
  - research-journey
  - windows
  - workstation
  - development
  - wsl
featured: false
draft: false
---

연구환경을 준비한 뒤에는 보관한 파일로 외부 다운로드 없이 실행과 복구를 이어갈 수 있는지 시험했습니다. 이 글은 Git 번들, WSL 스냅샷, 해시 목록과 오프라인 실행 스크립트를 모읍니다. 앞선 환경 목록 저장과 GPU 시험은 「스크립트: 환경 기록과 GPU 검증」에서 다룹니다.

실패한 명령과 점검 방법을 수정 과정 및 관찰 결과와 함께 정리했습니다. WSL 가져오기는 네트워크 분리 전에 수행했고, 수정 번들의 최종 클론은 재연결 후 진행했습니다. 복구 결과는 이 조건과 함께 읽어야 합니다.

## 1. Git 번들 진단과 수정 복구

먼저 Git 객체와 참조를 조회해 실패 원인을 살폈습니다. 뒤의 블록은 번들을 다시 만드는 절차이며, 복구 뒤 확인한 결과를 함께 적었습니다. `replace -l`은 replace 목록, `cat-file -p/-t`는 객체 내용/유형, `merge-base --is-ancestor`는 조상 관계를 종료 코드로 확인합니다. `$LASTEXITCODE`는 직전 외부 명령 코드입니다. `rev-list --objects --all`은 모든 refs에서 도달하는 객체, `--no-replace-objects`는 replace 적용 제외입니다. `Measure-Object -Line`은 줄 수입니다. tag를 지정해 bundle create를 했고, 빈 bare 저장소에서 verify한 뒤 `clone --branch b10964`로 tag를 선택했습니다. Remove-Item은 시험 폴더 삭제이므로 경로·데이터 확인 없이 재실행하지 않습니다. 최종 clone은 재연결 뒤였으며 exact HEAD와 fsck 결과가 있습니다.

```powershell
cd D:\Lab\Research\llama.cpp
git replace -l
if (Test-Path .git\info\grafts) {
    Write-Host "=== GRAFTS ==="
    Get-Content .git\info\grafts
} else {
    Write-Host "No .git/info/grafts"
}
git cat-file -p b29c606e28a01b1bc8c1351026a0fa6e616bf6c4 |
    Select-String "^parent "
git cat-file -t d9e03f1074dbd2979126d91dce1b5d304ec8394e
git merge-base --is-ancestor `
  d9e03f1074dbd2979126d91dce1b5d304ec8394e `
  b29c606e28a01b1bc8c1351026a0fa6e616bf6c4
$LASTEXITCODE
$normalCount = (git rev-list --objects --all | Measure-Object -Line).Lines
$rawCount = (git --no-replace-objects rev-list --objects --all | Measure-Object -Line).Lines
[PSCustomObject]@{
    NormalObjects = $normalCount
    RawObjects    = $rawCount
}
```

```powershell
cd D:\Lab\Research\llama.cpp
$bundleDir = "D:\Lab\OfflineLab\repos\llama.cpp\b29c606"
Rename-Item `
  "$bundleDir\llama.cpp-b29c606.bundle" `
  "llama.cpp-b29c606-failed-restore.bundle"
git rev-parse refs/tags/b10964
git rev-parse HEAD
$newBundle = "$bundleDir\llama.cpp-b29c606-full.bundle"
git bundle create `
  $newBundle `
  refs/tags/b10964
Get-Item $newBundle |
  Select-Object Name,
    @{N="SizeMB";E={[math]::Round($_.Length/1MB,2)}},
    LastWriteTime
git bundle list-heads $newBundle
$emptyRepo = "D:\Lab\Research\llama-bundle-empty-verify.git"
Remove-Item $emptyRepo -Recurse -Force -ErrorAction SilentlyContinue
git init --bare $emptyRepo
git -C $emptyRepo bundle verify $newBundle
$restore = "D:\Lab\Research\llama.cpp-offline-restore"
Remove-Item $restore -Recurse -Force -ErrorAction SilentlyContinue
git clone $newBundle $restore
```

```powershell
cd D:\Lab\Research
Remove-Item `
  "D:\Lab\Research\llama.cpp-offline-restore" `
  -Recurse -Force -ErrorAction SilentlyContinue
git clone `
  --branch b10964 `
  "$newBundle" `
  "D:\Lab\Research\llama.cpp-offline-restore"
cd D:\Lab\Research\llama.cpp-offline-restore
git rev-parse HEAD
git status --short
git fsck --full
```

## 2. WSL 스냅샷과 현재 해시 목록

WSL 내보내기와 가져오기 명령을 생성 파일 및 복원 결과와 함께 정리했습니다. `--export`는 배포판을 TAR로 보존, `--import`의 인자는 새 이름·설치 경로·TAR입니다. import는 네트워크 분리 전에 실행됐습니다. `$restoreRoot` 대입보다 New-Item을 먼저 실행해 null 경로 오류가 난 기록도 있습니다. `Get-FileHash -Algorithm SHA256`은 현재 해시 생성, `-Recurse -File`은 하위 파일, Sort-Object는 순서 정리, ForEach-Object는 파일별 처리입니다. `.Count`는 항목 수, Length는 파일 크기, Round는 표시용 반올림입니다. Set-Content는 파일 쓰기, Add-Content는 추가입니다. 이 생성 절차는 과거 기대값 대조와 다릅니다. $baseline에는 기존 최종 기준 기록 경로가 필요합니다.

```powershell
wsl -l -v
New-Item -ItemType Directory -Force `
  "D:\Lab\OfflineLab\backups\wsl" |
  Out-Null
wsl --shutdown
wsl --export `
  Ubuntu-26.04 `
  "D:\Lab\OfflineLab\backups\wsl\Ubuntu-26.04-research-baseline-20260924.tar"
Get-Item `
  "D:\Lab\OfflineLab\backups\wsl\Ubuntu-26.04-research-baseline-20260924.tar" |
  Select-Object Name,
    @{N="SizeGB";E={[math]::Round($_.Length/1GB,3)}},
    LastWriteTime
Get-FileHash `
  "D:\Lab\OfflineLab\backups\wsl\Ubuntu-26.04-research-baseline-20260924.tar" `
  -Algorithm SHA256 |
  Format-List Path, Algorithm, Hash
```

```powershell
$restoreRoot = "D:\Lab\WSL-Restore-Test"
New-Item -ItemType Directory -Force $restoreRoot | Out-Null
wsl --import `
  Ubuntu-26.04-RestoreTest `
  $restoreRoot `
  "D:\Lab\OfflineLab\backups\wsl\Ubuntu-26.04-research-baseline-20260924.tar"
wsl -l -v
wsl -d Ubuntu-26.04-RestoreTest
```

```powershell
Get-Item `
  $currentHashManifest,
  $modelHashManifest,
  $baseline |
  Select-Object Name, Length, LastWriteTime
```

```powershell
$currentHashManifest = `
    "D:\Lab\OfflineLab\manifests\offline-assets-sha256-20260925.txt"
$assetRoots = @(
    "D:\Lab\OfflineLab\installers",
    "D:\Lab\OfflineLab\wheelhouse",
    "D:\Lab\OfflineLab\vscode-extensions",
    "D:\Lab\OfflineLab\repos",
    "D:\Lab\OfflineLab\docs",
    "D:\Lab\OfflineLab\backups"
)
$hashLines = foreach ($root in $assetRoots) {
    Get-ChildItem $root -File -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName |
        ForEach-Object {
            $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
            "$hash  $($_.FullName)"
        }
}
$hashLines |
    Set-Content $currentHashManifest -Encoding utf8
[PSCustomObject]@{
    Manifest = $currentHashManifest
    Entries  = $hashLines.Count
    SizeKB   = [math]::Round(
        (Get-Item $currentHashManifest).Length / 1KB,
        1
    )
}
$modelHashManifest = `
    "D:\Lab\OfflineLab\manifests\model-assets-sha256-20260925.txt"
$modelHashLines = Get-ChildItem "D:\Lab\Models" `
    -File -Recurse -ErrorAction SilentlyContinue |
    Sort-Object FullName |
    ForEach-Object {
        $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
        "$hash  $($_.FullName)"
    }
$modelHashLines |
    Set-Content $modelHashManifest -Encoding utf8
[PSCustomObject]@{
    Manifest = $modelHashManifest
    Entries  = $modelHashLines.Count
    SizeGB   = [math]::Round(
        (Get-ChildItem D:\Lab\Models -File -Recurse |
            Measure-Object Length -Sum).Sum / 1GB,
        3
    )
}
```

```powershell
$manifestCount = `
    (Get-ChildItem D:\Lab\OfflineLab\manifests -File).Count
Add-Content `
    $baseline `
    "`r`nManifest_Files_Current=$manifestCount" `
    -Encoding utf8
$manifestCount
Get-Content $baseline
```

## 3. 물리적 오프라인 준비와 상태 점검

아래 명령으로 외부 연결과 시험 환경을 점검할 수 있습니다. 당시 Wi-Fi·유선·VPN 중 어떤 방식으로 연결을 끊었는지는 기록에 남아 있지 않습니다. `Test-NetConnection -Port 443`은 지정 TCP 포트, curl `-I`는 헤더 요청, `--max-time 5`는 최대 5초입니다. `2>&1`은 표준 오류를 표준 출력 대상으로 합칩니다. `find`는 깊이와 디렉터리 유형을 제한하고 `%f\n`으로 이름만 표시합니다. `--only-installed`는 uv Python 목록을 설치된 것에 한정합니다. 무조건 출력하는 PASS 문자열은 자동 성공 판정이 아닙니다.

```powershell
wsl -l -v
$testRoot = "D:\Lab\OfflineLab\manifests\offline-validation-20260925"
New-Item -ItemType Directory -Force $testRoot | Out-Null
Test-NetConnection www.microsoft.com -Port 443
Test-NetConnection www.microsoft.com -Port 443 |
  Out-File "$testRoot\01-windows-network-isolation.txt"
wsl -d Ubuntu-26.04-RestoreTest -u securityon
```

```bash
curl -I --max-time 5 https://pypi.org
curl -I --max-time 5 https://huggingface.co
{
  echo "=== PyPI ==="
  curl -I --max-time 5 https://pypi.org
  echo
  echo "=== Hugging Face ==="
  curl -I --max-time 5 https://huggingface.co
} > /mnt/d/Lab/OfflineLab/manifests/offline-validation-20260925/02-wsl-network-isolation.txt 2>&1
```

```bash
cd ~
echo "=== USER ==="
whoami
echo "HOME=$HOME"
echo
echo "=== OS ==="
grep PRETTY_NAME /etc/os-release
uname -r
echo
echo "=== RESEARCH ==="
ls -ld ~/research
ls -ld /mnt/d/Lab
echo
echo "=== PROJECTS ==="
find ~/research -maxdepth 1 -mindepth 1 -type d -printf '%f\n' | sort
echo "=== BUILD TOOLCHAIN ==="
gcc --version | head -1
g++ --version | head -1
make --version | head -1
cmake --version | head -1
ninja --version
pkg-config --version
echo "=== PYTHON / UV ==="
python3 --version
uv --version
uv python list --only-installed
echo
echo "=== JUPYTER ==="
cd ~/research/wsl-research-base
uv run --offline python --version
uv run --offline jupyter-lab --version
uv run --offline python -c "import IPython, ipykernel; print('IPython:', IPython.__version__); print('ipykernel:', ipykernel.__version__)"
echo "PHYSICAL OFFLINE WSL PYTHON/JUPYTER PASS"
echo "=== WSL GPU ==="
test -e /dev/dxg && echo "/dev/dxg: PASS"
/usr/lib/wsl/lib/nvidia-smi | head -15
```

## 4. 물리적 오프라인 Python·모델 시험

전체 시험을 마친 당시에는 Git 번들 복구를 제외한 항목이 통과한 것으로 보았습니다. 다만 명령별 출력을 모두 남기지는 못했습니다. `uv run --offline`은 uv의 네트워크 접근 제한, HF_HUB_OFFLINE·TRANSFORMERS_OFFLINE과 local_files_only는 모델 조회 제한입니다. 이를 실제 네트워크 단절의 대체 증거로 쓰지 않습니다. CUDA에 텐서와 모델을 배치하고 행렬 연산·생성을 실행합니다. VS Code `code .`의 점은 현재 프로젝트, Python 셀의 sys.executable은 실제 커널 경로입니다.

```bash
cd ~/research/pytorch-smoke-test
uv run --offline python - <<'PY'
import torch

print("PyTorch:", torch.__version__)
print("CUDA runtime:", torch.version.cuda)
print("CUDA available:", torch.cuda.is_available())
print("GPU:", torch.cuda.get_device_name(0))

a = torch.randn((2048, 2048), device="cuda")
b = torch.randn((2048, 2048), device="cuda")
c = a @ b
torch.cuda.synchronize()

print("Shape:", c.shape)
print("Device:", c.device)
print("PHYSICAL OFFLINE WSL PyTorch CUDA PASS")
PY
```

```bash
cd ~/research/transformers-smoke-test
HF_HUB_CACHE=/mnt/d/Lab/Models/HuggingFace \
HF_HUB_OFFLINE=1 \
TRANSFORMERS_OFFLINE=1 \
uv run --offline python - <<'PY'
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
    "Say hello in one short sentence.",
    return_tensors="pt",
).to("cuda")

with torch.inference_mode():
    outputs = model.generate(
        **inputs,
        max_new_tokens=16,
        do_sample=False,
    )

print("Device:", next(model.parameters()).device)
print("PHYSICAL OFFLINE WSL Transformers CUDA PASS")
PY
```

```bash
cd ~/research/tensorflow-nightly-smoke-test
uv run --offline python - <<'PY'
import tensorflow as tf

gpus = tf.config.list_physical_devices("GPU")

print("TensorFlow:", tf.__version__)
print("GPUs:", gpus)

for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

with tf.device("/GPU:0"):
    a = tf.random.normal((2048, 2048))
    b = tf.random.normal((2048, 2048))
    c = tf.matmul(a, b)
    _ = c.numpy()

print("Shape:", c.shape)
print("Device:", c.device)
print("PHYSICAL OFFLINE TensorFlow Nightly GPU PASS")
PY
```

```bash
uv run --offline python - <<'PY'
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
print("PHYSICAL OFFLINE TensorFlow Nightly XLA PASS")
PY
```

```bash
cd ~/research/wsl-research-base
code .
whoami
python --version
which python
code --list-extensions --show-versions | sort
```

```python
import sys
import platform

print(sys.executable)
print(platform.platform())
print("PHYSICAL OFFLINE VS Code WSL Jupyter PASS")
```

## 5. 로컬 모델·API와 새 wheelhouse 환경

다음은 로컬 모델과 API를 호출하고 wheelhouse로 새 환경을 구성하는 시험 코드입니다. 각 블록의 실행 여부를 확인할 개별 출력은 모두 남아 있지 않습니다. `ollama run`은 모델 이름과 프롬프트를 받습니다. ConvertTo-Json으로 요청 본문을 만들고 Invoke-RestMethod의 Uri·Method Post·ContentType·Body로 localhost API를 호출합니다. Get-ChildItem의 Filter·File·Recurse와 Select-Object -First 1 -ExpandProperty FullName은 첫 일치 파일 경로를 고릅니다. llama.cpp의 `-m`은 모델, `-ngl all`은 GPU offload 요청, `-p`는 프롬프트, `-n 64`는 생성 토큰 수입니다. wheelhouse의 `--python`은 대상 인터프리터, `--no-index`는 인덱스 조회 금지, `--find-links`는 로컬 패키지 위치, `-r`은 요구사항 파일입니다. Remove-Item은 기존 시험 경로를 삭제합니다. PowerShell here-string을 python -에 전달합니다. Transformers 시험 출력에서는 `cuda:0`와 성공 표식을 확인했습니다.

```powershell
ollama --version
ollama list
ollama run qwen3.5:4b "Explain CUDA in one short sentence."
$body = @{
  model  = "qwen3.5:4b"
  prompt = "Say hello in one short sentence."
  stream = $false
} | ConvertTo-Json
Invoke-RestMethod `
  -Uri "http://localhost:11434/api/generate" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
$llamaExe = Get-ChildItem `
  "D:\Lab\Research\llama.cpp" `
  -Filter llama-cli.exe `
  -File `
  -Recurse |
  Select-Object -First 1 -ExpandProperty FullName
$llamaExe
$gguf = Get-ChildItem `
  "D:\Lab\Models\llama.cpp" `
  -Filter *.gguf `
  -File `
  -Recurse |
  Select-Object -First 1 -ExpandProperty FullName
$gguf
& $llamaExe `
  -m $gguf `
  -ngl all `
  -p "Explain CUDA in one short sentence." `
  -n 64
```

```powershell
$torchWheelhouse = "D:\Lab\OfflineLab\wheelhouse\pytorch-cu132-py312"
$testDir = "D:\Lab\Research\pytorch-physical-offline-test"
Remove-Item $testDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $testDir | Out-Null
cd $testDir
uv venv --python 3.12
uv pip install `
  --python "$testDir\.venv\Scripts\python.exe" `
  --no-index `
  --find-links "$torchWheelhouse" `
  -r "$torchWheelhouse\requirements-download.txt"
& "$testDir\.venv\Scripts\python.exe" -c "import torch; print(torch.__version__); print(torch.version.cuda); print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0))"
& "$testDir\.venv\Scripts\python.exe" -c "import torch; a=torch.randn(2048,2048,device='cuda'); b=torch.randn(2048,2048,device='cuda'); c=a@b; torch.cuda.synchronize(); print(c.shape,c.device); print('PHYSICAL OFFLINE PYTORCH WHEELHOUSE PASS')"
```

```powershell
$tfmWheelhouse = "D:\Lab\OfflineLab\wheelhouse\transformers-py312"
$testDir = "D:\Lab\Research\transformers-physical-offline-test"
Remove-Item $testDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $testDir | Out-Null
cd $testDir
uv venv --python 3.12
uv pip install `
  --python "$testDir\.venv\Scripts\python.exe" `
  --no-index `
  --find-links "$tfmWheelhouse" `
  -r "$tfmWheelhouse\requirements-download.txt"
& "$testDir\.venv\Scripts\python.exe" -c "import torch,transformers,accelerate; print(torch.__version__); print(transformers.__version__); print(accelerate.__version__); print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0))"
$env:HF_HUB_CACHE = "D:\Lab\Models\HuggingFace"
$env:HF_HUB_OFFLINE = "1"
$env:TRANSFORMERS_OFFLINE = "1"
@'
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
    "Say hello in one short sentence.",
    return_tensors="pt",
).to("cuda")

with torch.inference_mode():
    outputs = model.generate(
        **inputs,
        max_new_tokens=16,
        do_sample=False,
    )

print("Device:", next(model.parameters()).device)
print("PHYSICAL OFFLINE TRANSFORMERS WHEELHOUSE PASS")
'@ | & "$testDir\.venv\Scripts\python.exe" -
```

## 6. 첫 번들 실패·해시 대조·WSL 재시작

첫 clone은 실제로 실패했고 후속 cd와 Git 조회도 실패했습니다. 아래 해시 대조 코드는 기대값과 현재 파일을 비교하는 방법입니다. 당시 검사 수와 개별 결과는 남아 있지 않습니다. `-match`로 64자리 해시와 경로를 나눠 `$matches`로 읽고 현재 해시와 `-ne` 비교합니다. 정규식에 맞지 않는 행이나 오류·빈 입력을 완전히 검증하지 않는 원문 한계도 남깁니다. 마지막은 wsl --shutdown 후 재실행이며 Windows 재부팅이 아닙니다. 원래 REBOOT 성공 문자열은 변경하지 않습니다.

```powershell
$bundle = "D:\Lab\OfflineLab\repos\llama.cpp\b29c606\llama.cpp-b29c606.bundle"
$restore = "D:\Lab\Research\llama.cpp-offline-restore"
Remove-Item $restore -Recurse -Force -ErrorAction SilentlyContinue
git clone $bundle $restore
cd $restore
git rev-parse HEAD
git status --short
```

```powershell
$manifest = "D:\Lab\OfflineLab\manifests\offline-assets-sha256.txt"
$failures = foreach ($line in Get-Content $manifest) {
    if ($line -match '^([A-Fa-f0-9]{64})\s+(.+)$') {
        $expected = $matches[1]
        $path = $matches[2]

        if (-not (Test-Path $path)) {
            [PSCustomObject]@{
                Path = $path
                Result = "MISSING"
            }
            continue
        }

        $actual = (Get-FileHash $path -Algorithm SHA256).Hash

        if ($actual -ne $expected) {
            [PSCustomObject]@{
                Path = $path
                Result = "HASH_MISMATCH"
            }
        }
    }
}

if ($failures) {
    $failures | Format-Table -AutoSize
} else {
    "OFFLINE ASSET SHA256 VERIFICATION PASS"
}
```

```powershell
wsl --shutdown
wsl -d Ubuntu-26.04-RestoreTest -u securityon
```

```bash
cd ~/research/pytorch-smoke-test
uv run --offline python - <<'PY'
import torch

print("CUDA:", torch.cuda.is_available())
print("GPU:", torch.cuda.get_device_name(0))

a = torch.randn((1024, 1024), device="cuda")
b = torch.randn((1024, 1024), device="cuda")
c = a @ b
torch.cuda.synchronize()

print("PHYSICAL OFFLINE REBOOT PERSISTENCE PASS")
PY
```

## 옵션 설명의 참고 문서

내보내기·번들·패키지·검색 옵션은 [WinGet export](https://learn.microsoft.com/windows/package-manager/winget/export), [Git bundle](https://git-scm.com/docs/git-bundle), [uv CLI](https://docs.astral.sh/uv/reference/cli/), [GNU find의 깊이 제한](https://www.gnu.org/software/findutils/manual/html_node/find_html/Directories.html)을 참고했습니다. 설명을 위해 읽은 문서이며 당시 수행한 시험의 증거와는 구분합니다.
