---
title: "Workstation Scripts: Offline Recovery"
description: "Git bundles, WSL snapshots, hash manifests and offline execution scripts, including failures, corrections and test conditions."
lang: en
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

After preparing the research environment, I tested how the preserved files could support execution and recovery without external downloads. This note collects the Git bundle, WSL snapshot, hash and offline execution scripts. “Workstation Scripts: Environment and GPU” covers the preceding environment inventories and GPU tests.

I have kept the failed commands and inspection methods alongside the corrections and observed results. WSL import took place before network isolation, and the corrected bundle was finally cloned after reconnection. Those conditions matter when interpreting the recovery results.

## 1. Git bundle diagnosis and corrected recovery

I first inspected Git objects and references to investigate the failure. The later blocks describe how to rebuild the bundle, alongside the results checked after recovery. `replace -l` lists replacements; `cat-file -p/-t` prints object content/type. `merge-base --is-ancestor` reports ancestry through its exit code; `$LASTEXITCODE` reads the last native-command status. `rev-list --objects --all` walks objects reachable from all refs; `--no-replace-objects` disables replacements. `Measure-Object -Line` counts lines. A tag-scoped bundle was created, verified in an empty bare repository, then cloned with `--branch b10964` to select the tag. Remove-Item deletes test directories: verify paths and data before reuse. Final cloning occurred after reconnection and produced the recorded exact HEAD and fsck result.

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

## 2. WSL snapshots and current hash manifests

I have kept the WSL export and import commands alongside the resulting files and restoration results. `--export` preserves a distribution as TAR; `--import` takes a new name, installation path and TAR. Import preceded network isolation. Running New-Item before assigning `$restoreRoot` produced a null-path error. `Get-FileHash -Algorithm SHA256` computes current hashes, `-Recurse -File` traverses files, Sort-Object orders results and ForEach-Object processes each file. `.Count` counts items, Length is file size and Round rounds for display. Set-Content writes; Add-Content appends. Generation differs from comparison against expected hashes. $baseline requires the existing final baseline file path.

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

## 3. Preparing and inspecting physical offline tests

The following commands can check external connectivity and the test environment. My notes do not record which Wi-Fi, cable or VPN disconnection method I used. `Test-NetConnection -Port 443` tests that TCP port; curl `-I` requests headers and `--max-time 5` limits the request to five seconds. `2>&1` merges standard error into the standard-output destination. find limits depth/type and prints names using `%f\n`. `--only-installed` restricts the uv Python listing. Unconditional PASS text is not automatic validation.

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

## 4. Physical offline Python and model tests

After the full test, my assessment was that everything except the Git bundle recovery appeared to pass. I did not retain output for every command. `uv run --offline` restricts uv network access; HF_HUB_OFFLINE, TRANSFORMERS_OFFLINE and local_files_only restrict model lookup. They do not replace evidence of physical disconnection. Tensors/models are placed on CUDA for computation/generation. The dot in `code .` selects the current project; sys.executable in the Python cell reports the actual kernel path.

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

## 5. Local models, API and fresh wheelhouse environments

The following code tests local models and APIs and creates fresh environments from wheelhouses. I do not have individual output confirming execution of every block. ollama run takes a model name and prompt. ConvertTo-Json creates a request; Invoke-RestMethod supplies Uri, Method Post, ContentType and Body to the localhost API. Get-ChildItem Filter/File/Recurse plus Select-Object -First 1 -ExpandProperty FullName selects the first matching file path. llama.cpp uses `-m` for the model, `-ngl all` to request GPU offload, `-p` for the prompt and `-n 64` for generation length. For wheelhouses, `--python` selects the interpreter, `--no-index` disables index lookup, `--find-links` supplies the local package location and `-r` reads requirements. Remove-Item deletes the existing test path. A PowerShell here-string is passed to python -. In the Transformers test output, I confirmed `cuda:0` and the success marker.

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

## 6. First bundle failure, hash comparison and WSL restart

The initial clone actually failed, followed by failed cd and Git queries. The hash-comparison code below shows how to compare expected hashes with current files. I have no checked-entry count or individual results from that time. `-match` splits a 64-character hash and path into `$matches`; `-ne` compares the current hash. The original script does not fully validate malformed lines, errors or empty input. The last test shuts down and restarts WSL, not Windows. Its original REBOOT success string is retained.

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

## References for option behaviour

Export, bundle, package and search options were checked against [WinGet export](https://learn.microsoft.com/windows/package-manager/winget/export), [Git bundle](https://git-scm.com/docs/git-bundle), the [uv CLI](https://docs.astral.sh/uv/reference/cli/) and [GNU find depth controls](https://www.gnu.org/software/findutils/manual/html_node/find_html/Directories.html). These references explain behaviour; they are separate from evidence of the original tests.
