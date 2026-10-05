---
title: "Workstation Scripts: Environment and GPU"
description: "PowerShell and Bash scripts for environment inventories and PyTorch and TensorFlow tests, with options and recorded results."
lang: en
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

Saving environment queries to files makes it easier to compare the Windows and WSL setup later. This note covers those inventories and the GPU tests for PyTorch and TensorFlow. “Workstation Command Record” covers individual installation and inspection commands; “Workstation Scripts: Offline Recovery” covers preservation and recovery.

The scripts retain their original options and arguments. Each section explains the checks and includes execution results where I have them.

## 1. Saving an environment record with PowerShell

The following script collects Windows development information in one file. I have no saved result from that run, so I describe how the file is created and what needs care. It assumes that `D:\Lab\OfflineLab\manifests` already exists and overwrites the output file if present.

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

| Command or syntax                          | Role in this script                                                                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `@(...)`                                   | Collects headings and command results into an array. Empty strings provide blank separators.                                 |
| `$(...)`                                   | Evaluates a command or expression inside a string and inserts its result.                                                    |
| `Get-Date -Format 'yyyy-MM-dd HH:mm:ss K'` | Formats the recording time as year, month, day, 24-hour time and a time-zone component.                                      |
| `(git --version)` and similar expressions  | Evaluate the enclosed commands and include their version output. `code --version` also reports a commit ID and architecture. |
| `uv cache dir`                             | Queries the uv cache directory. `dir` is a lookup subcommand, not a directory creation operation.                            |
| `where.exe python`                         | Finds matching Python files in the current directory and PATH.                                                               |
| `wsl --version`                            | Reports versions of WSL and related components.                                                                              |
| `wsl --status`                             | Reports WSL configuration information, including the default distribution.                                                   |
| `wsl -l -v`                                | `-l` lists distributions; `-v` adds details, including state and WSL 1/2 version.                                            |
| `\| Out-File`                              | Sends the collected results to a text file. The following path is the output-file argument.                                  |
| `-Encoding utf8`                           | Selects UTF-8 output. This does not imply identical UTF-8 BOM handling across all PowerShell versions.                       |

The backtick at a line ending continues the PowerShell command. Trailing spaces after it can break that continuation when copying. This collection script does not automatically judge each command's success or merge every error stream into the file. Creating the file alone is not a successful environment test.

See the [Out-File reference](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/out-file) and [WSL basic commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands) for output behaviour and WSL options.

## 2. Saving an extension inventory with PowerShell

The following command can save the extension list to a separate file. A separate file makes it easier to compare extensions without searching the full environment record.

```powershell
code --list-extensions --show-versions |
Out-File `
  D:\Lab\OfflineLab\manifests\development-vscode-extensions.txt `
  -Encoding utf8
```

| Command or option              | Explanation                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `code --list-extensions`       | Lists VS Code extension identifiers.                              |
| `--show-versions`              | Includes version information in the extension listing.            |
| `Out-File` and the output path | Save the listing to the named file, overwriting an existing file. |
| `-Encoding utf8`               | Selects the text encoding.                                        |

This command is for Windows PowerShell; I have no saved result from that run. WSL remote extensions were checked separately inside WSL; the two lists should not be treated as one installation state. The options are documented in the [VS Code CLI reference](https://code.visualstudio.com/docs/configure/command-line).

## 3. Checking Linux build tools in Bash

The following commands and their subsequent output were recorded in WSL Bash.

```bash
echo "=== Build Toolchain ==="

gcc --version | head -1
g++ --version | head -1
make --version | head -1
cmake --version | head -1
ninja --version
pkg-config --version
```

| Command or option                               | Explanation                                                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `echo` and its string argument                  | Print a heading for the result group.                                                                       |
| `--version` on `gcc`, `g++`, `make` and `cmake` | Request each build tool's version information.                                                              |
| `\| head -1`                                    | Passes standard output to `head` and displays its first line. `-1` is the original one-line form used here. |
| `ninja --version`, `pkg-config --version`       | Query the two tool versions without a following `head` command.                                             |

The recorded results were GCC and G++ `15.2.0`, GNU Make `4.4.1`, CMake `4.2.3`, Ninja `1.13.2` and pkg-config `2.5.1`. These queries showed that the tools ran and returned versions. Compilation and linking tests belong to separate records.

## 4. Selecting directory names in Bash

The following queries can inspect research projects and VS Code Server directories in the restored environment. They target different paths; I have no individual query results from that time.

```bash
find ~/research -maxdepth 1 -mindepth 1 -type d -printf '%f\n' | sort
find ~/.vscode-server/bin -maxdepth 1 -mindepth 1 -type d -printf '%f\n'
```

| Argument or option                   | Explanation                                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `~/research`, `~/.vscode-server/bin` | Starting paths. Bash expands `~` to the user's home directory.                                                  |
| `-maxdepth 1`                        | Limits traversal to the immediate level beneath the starting directory.                                         |
| `-mindepth 1`                        | Excludes the starting directory itself from the results.                                                        |
| `-type d`                            | Selects directories only.                                                                                       |
| `-printf '%f\n'`                     | Prints the final path component, followed by a newline, rather than the full path. This is GNU find formatting. |
| `\| sort`                            | Sorts the first command's result lines. The second original command has no sorting stage.                       |

The first query was intended to list project names; the second inspected server directory names at that location. Directory presence and functional operation still require separate checks.

## 5. Exporting installation and storage inventories

I exported the installation inventory with WinGet. The later file and registry queries show how to inspect the result; I have no individual results for those queries. `winget export -o` selects a JSON file and `--include-versions` includes versions. Warnings reported packages or versions unavailable from configured sources. `Get-Item` reads file information, `Get-Content` reads contents, and `Get-ItemProperty` reads registry properties. The two HKLM paths query installation entries; `Where-Object DisplayName` keeps entries with a name. `Format-Table -AutoSize` adjusts display columns, not structured export. The Known Folder GUID is a folder identifier from the original command, not a personal identifier.

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

## 6. Saving Windows and WSL baselines

These scripts save Windows and WSL baselines to files. The earlier development-baseline Note records saving the baseline files. I did not retain the immediate output of each script, so this section describes the saving method and what to check. Git configuration queries without a value read the setting. Output can contain personal email and user paths, so inspect files before publication. Bash `{ ...; }` groups commands in the current shell; `>` saves standard output. `date --iso-8601=seconds` requests a timestamp to seconds, and `ls -ld` reports details of the directory itself.

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

## 7. WSL GPU and post-reboot tests

I checked the output of the first PyTorch computation. I also recorded the post-Windows-reboot checks as passing at the time, but did not retain output for every item. `python -c` executes string code; `python -` reads code from standard input. `<<'PY'` passes a here-document without shell expansion. Matrices are allocated on CUDA and synchronise waits for completion. Model tests select float16, local files only and non-sampling token selection (`do_sample=False`); `max_new_tokens=32` limits new tokens. `grep -E` uses extended regular expressions, `uname -r` reports the kernel release, `test -e` checks path existence, and `&&` runs the next command after success. These are separate from the later physically disconnected tests.

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

## 8. TensorFlow execution, memory and XLA

The first block checks a basic matrix computation; I have no result for it. For the subsequent memory-growth and XLA tests, I kept both the commands and their output. Memory growth is configured before GPU initialisation; `jit_compile=True` requests XLA compilation. Reading c.numpy() materialises the result. PTX JIT and AutoGraph source-discovery warnings also occurred beyond these excerpts. Nightly success remains separate from stable adoption.

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

Environment inventories provide a comparison point; GPU tests record what ran under the conditions stated above. The nightly TensorFlow result remains separate from the stable path awaiting a retest.
