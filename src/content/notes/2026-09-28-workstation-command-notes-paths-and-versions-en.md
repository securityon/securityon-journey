---
title: "Workstation Command Record"
description: "Workstation commands for installation, configuration, inspection and WSL, with their arguments and historical results."
lang: en
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

During the Windows research workstation setup, I used inspection commands as often as installation commands. I repeatedly checked whether a tool would run, where its executable was found, and whether a project used the intended Python interpreter. The implementation journal records the results and decisions; keeping the commands and their arguments makes those checks easier to revisit.

This note collects installation, configuration and inspection commands from the workstation setup. Versions refer to the setup at that time. The blocks are grouped by purpose and do not form an installation script to run from top to bottom. I describe the checks alongside their results and identify items for which no result remains.

## 1. Checking versions alongside paths

After installing Git, **Visual Studio Code** and uv, I used these commands in Windows PowerShell.

```powershell
git --version
where.exe git
code --version
where.exe code
uv --version
where.exe uv
```

| Tool    | Recorded version   | Location reported by the path query            |
| ------- | ------------------ | ---------------------------------------------- |
| Git     | `2.55.0.windows.3` | `C:\Program Files\Git\cmd\git.exe`             |
| VS Code | `1.138.0`          | Under `C:\Program Files\Microsoft VS Code\bin` |
| uv      | `0.12.17`          | Under my account's WinGet Links directory      |

Keeping versions and paths together gave me a reference for later encounters with another installation or execution alias. The VS Code query reported a location under `Program Files`. Whether the separately preserved User Installer was the file used for the original installation remains unverified.

I wrote `where.exe` explicitly when searching for executables in PowerShell. `where` is also an alias for `Where-Object`, so treating the two names as interchangeable can lead to a misleading reading of the result. Microsoft's [Where-Object documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/where-object) lists this alias.

The commands and arguments serve the following purposes.

| Command or argument                               | Explanation                                                                                                                                                                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git --version`, `uv --version`                   | Print the Git and uv versions respectively. `--version` requests version information.                                                                                                                                   |
| `code --version`                                  | Prints the VS Code version, commit ID and architecture. The results table above retains only the version.                                                                                                               |
| `where.exe git`, `where.exe code`, `where.exe uv` | Each name is a search argument. With no additional search options, these calls find matching files in the current directory and PATH directories. When an extension is omitted, PATHEXT supplies the extensions to try. |

These calls did not search the entire disk. See the [Windows where reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/where) and [VS Code CLI documentation](https://code.visualstudio.com/docs/configure/command-line).

## 2. Installing and locating Python

I installed Python through uv. These commands appear in the execution record.

```powershell
uv python install 3.12
uv python list
python --version
python3.12 --version
where.exe python
uv python find 3.12
```

The request for `3.12` installed `3.12.14`. The command did not pin that patch version, so the observed result belongs alongside the installation command.

Installation produced a warning that my account's `.local\bin` was absent from PATH. A subsequent `where.exe python` result included both `.local\bin` and WindowsApps paths. My notes do not record exactly how PATH was changed.

I compared the Python installations shown by `uv python list` with the interpreter reached by `python --version`. I also used `uv python find 3.12` to locate the executable matching that request through uv. The search behaviour is described in [uv's Python versions documentation](https://docs.astral.sh/uv/concepts/python-versions/).

| Command or argument      | Explanation                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `uv python install 3.12` | `python` is the Python management command group and `install` its installation subcommand. `3.12` is a version request argument, not an option; it does not specify a patch version. |
| `uv python list`         | Lists installed and available Python versions. This call has no option restricting the list to installed interpreters.                                                               |
| `python --version`       | Prints the version of the interpreter reached as `python` in the current shell.                                                                                                      |
| `python3.12 --version`   | Requests the version through the command named `python3.12`. The `3.12` in that name is not a separate option.                                                                       |
| `where.exe python`       | Searches for matching file paths. Multiple candidates need to be read alongside the version check.                                                                                   |
| `uv python find 3.12`    | `find` locates an interpreter matching the `3.12` version request. This is a lookup, not a Python installation command.                                                              |

The subcommands and default listing scope are documented in the [uv CLI reference](https://docs.astral.sh/uv/reference/cli/#uv-python).

## 3. When the Jupyter command was not found

This version check failed during the Jupyter setup.

```powershell
jupyter lab --version
```

The shell could not find the command. I then inspected the commands exposed by the installed tool.

```powershell
uv tool list
jupyter-lab --version
where.exe jupyter-lab
```

`uv tool list` showed `jupyter-lab`, `jupyter-labextension` and `jupyter-labhub`; `jupyter-lab --version` returned `4.6.3`. In that environment, the distinction between `jupyter lab` and `jupyter-lab` changed the outcome. Checking the exposed command names before reinstalling was the useful part of this investigation.

| Command or argument     | Explanation                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jupyter lab --version` | Passes the `lab` subcommand and version option through the `jupyter` entry point. In this attempt, the entry point was not found, so the version check was never reached. |
| `uv tool list`          | Lists tools installed through uv and their exposed commands. It does not enumerate all Python dependencies in a project. No additional options were used.                 |
| `jupyter-lab --version` | Requests version information from `jupyter-lab`. The hyphen is part of the command name, not an option separator.                                                         |
| `where.exe jupyter-lab` | Looks up executable paths matching the name `jupyter-lab`.                                                                                                                |

See the [uv tool list reference](https://docs.astral.sh/uv/reference/cli/#uv-tool-list) for the scope of that listing.

## 4. Separating file existence from command discovery

Command discovery also arose while examining the Windows recovery environment. The following commands show how to locate `reagentc.exe`. I have no execution results for this group, so this section describes the lookup method.

```powershell
where.exe reagentc.exe
Get-Command reagentc.exe
Test-Path C:\Windows\System32\reagentc.exe
```

If `Test-Path` returns `True`, the executable can be called by its full path as follows.

```powershell
C:\Windows\System32\reagentc.exe /info
```

The useful reminder is to avoid concluding that a file is absent solely from an empty command search. Executable discovery, existence at a known path and actual execution are separate checks. This command list alone does not establish the WinRE state at the time.

| Command or argument                          | Explanation                                                                                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `where.exe reagentc.exe`                     | Searches the current directory and PATH for the name including its `.exe` extension.                                                                           |
| `Get-Command reagentc.exe`                   | Looks up the command by name in PowerShell and returns command information. The name is an argument; this does not execute the program.                        |
| `Test-Path C:\Windows\System32\reagentc.exe` | Returns `True` or `False` for existence at the given full path. The path is a positional argument; this call does not test whether the file runs successfully. |
| `C:\Windows\System32\reagentc.exe /info`     | Runs the program by its full path. `/info` displays Windows RE status and recovery information.                                                                |

These explanations follow the official [Get-Command](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/get-command), [Test-Path](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/test-path) and [REAgentC](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/reagentc-command-line-options) references.

## 5. Reducing a package list to the relevant field

For an app package inventory, I selected and sorted the names. Both this command and its listing appear in the execution record.

```powershell
Get-AppxPackage |
Select-Object Name |
Sort-Object Name
```

The purpose was to inspect package names, so I retained only `Name`. This is neither a record of their versions and installation paths nor a complete inventory of conventional desktop programs.

| Command or syntax    | Explanation                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Get-AppxPackage`    | Queries app packages installed in the current user profile. No option selecting another user or all users was supplied.     |
| `\|`                 | Passes result objects from one PowerShell command to the next. Here, package objects are passed on for property selection.  |
| `Select-Object Name` | Selects only the `Name` property from each object. `Name` is a positional argument for `-Property`, not a new package name. |
| `Sort-Object Name`   | Sorts the incoming objects by `Name` in the default ascending order. `Name` is again a positional property argument.        |

See [Get-AppxPackage](https://learn.microsoft.com/en-us/powershell/module/appx/get-appxpackage) and [Select-Object](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/select-object) for the query scope and property selection.

Reviewing the setup reminded me that even short inspection commands answered different questions: which version was present, which path was found, or which command a tool exposed. For future work, I want to keep those questions and the relevant output alongside the commands themselves.

## 6. Windows installation and package queries

These commands install and query packages through WinGet. I have no individual execution results for them. `install` installs; `list` queries packages. `--id` selects a package ID, `-e` requests an exact match, and `--scope machine` requests installation for all users. Firefox and Chrome strings are listing queries. These commands do not preserve installer files.

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

## 7. Original queries and extension installation

The preceding sections explain version and path queries. The original command groups are shown together here. `--install-extension` takes an extension ID; `uv add --dev ipykernel` adds a development dependency. The group includes the failed `jupyter lab --version` call and the successful `jupyter-lab --version` call.

```powershell
code --install-extension ms-python.python
uv add --dev ipykernel
code --install-extension ms-toolsai.jupyter
jupyter lab --version
uv tool list
jupyter-lab --version
where.exe jupyter-lab
```

## 8. uv dependencies and cache

Execution output exists for the first group. `uv add` adds a dependency; `uv run` runs a command in the project environment. `New-Item -ItemType Directory -Force` prepares a directory and tolerates an existing directory. Installation completed after a hardlink warning and copy fallback. The earlier development-baseline Note records moving the cache to D:, and the offline-assets check confirmed the uv cache at that location. The environment-variable command below selects that path. `User` selects user scope; the changed path needs to be checked in a new shell.

```powershell
uv add requests
uv cache dir
New-Item -ItemType Directory -Force D:\Lab\OfflineLab\cache\uv
uv run python .\main.py
```

```powershell
[Environment]::SetEnvironmentVariable("UV_CACHE_DIR", "D:\Lab\OfflineLab\cache\uv", "User")
```

## 9. Virtualisation and service diagnostics

`-Property` selects properties, `-Online` targets the running Windows installation, and `-Match` filters with a regular expression. The `|` within the pattern means alternatives, not a pipeline. Comma-separated service names select services. `findstr /i` ignores case. `-ErrorAction SilentlyContinue` suppresses error display, so an empty result is not a success verdict. `-ClassName` and `-Namespace` select the CIM query target. Early vmcompute and hcsdiag queries failed; later states differed. I have kept the Device Guard query alongside the property values checked afterwards.

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

## 10. WSL installation and shared paths

These groups have recorded execution output. `--list --online` lists available distributions; `--distribution` selects one, `--location` sets its storage location, and `--no-launch` avoids launching it after installation. `-d` selects a distribution to run. In Bash, `cd ~` changes to home, `pwd` prints the working directory, `cat` reads a file, and `uname -a` reports system information. `>` creates or overwrites a file. The record includes ext4.vhdx, WSL 2 and output from the shared-path test file.

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

## 11. Git configuration and change checks

The Windows working directory was D:\Lab\Research\smoke-test; WSL used ~/research/wsl-smoke-test. `--global` selects user configuration; `input` was the core.autocrlf value. `init` initialises, `add .` stages changes under the current path, and `commit -m` supplies a commit message. `branch -m` renames a branch; `--show-current` reports it. `status --short` gives compact status and `log -1 --oneline` shows one recent commit. `diff --` separates paths from options; `ls-files --eol` reports index/worktree line endings. Email is generalised as `<email>`. The initial Windows commit used master; the cause of the .gitattributes change remains unknown.

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

## 12. OS, recovery state and user folders

The following commands query OS and recovery state. The results remain only as images, so I have not transcribed state values here. `manage-bde -status` queries BitLocker status, `dsregcmd /status` device registration, and `dism /online /Get-CurrentEdition` the running Windows edition. Querying the SoftwareLicensingService property can display an actual product key; no key value is published. I checked user folders by selecting the relevant properties from the User Shell Folders registry key.

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

## 13. Finding records and checking line endings

development-* is a wildcard for names with that prefix; no result remains for this search. In WSL, I used `cat` and `git status` to check file contents and changes. The text block shows .gitattributes as it was then. `* text=auto eol=lf` is Git attributes syntax, not a shell command.

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

## 14. Linux tools, projects and extensions

I have kept the installation commands alongside the versions and configuration checked afterwards, including the commands I used to read the JSON settings and activate the environment. `mkdir -p` creates required parent paths and tolerates existing directories. `uv init --python 3.12` sets the project Python request; `==` pins a dependency and `>=` sets a minimum. `--index name=URL` specifies a package source. `sudo apt update` refreshes package lists; `apt install -y` automatically accepts installation prompts. `@version` specifies an extension version and `--force` requests forced installation. `source` reads activation code into the current Bash shell. `kernelspec list` can list the kernels. I have no result for that query.

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

## 15. Installing TensorFlow nightly

This installation command specifies the nightly version from that time. I have no output from the installation command itself; the later computation results appear in the environment and GPU script note. `[and-cuda]` requests an extra dependency group; `==` pins the nightly version. This does not establish a stable TensorFlow pass.

```bash
cd ~/research
mkdir -p tensorflow-nightly-smoke-test
cd tensorflow-nightly-smoke-test
uv init --python 3.12
uv add "tf-nightly[and-cuda]==2.22.0.dev20260923"
uv run python -c "import tensorflow as tf; print(tf.__version__); print(tf.config.list_physical_devices('GPU'))"
```

## 16. cuDNN and restored-environment queries

I checked the cuDNN packages with the following commands. `dpkg -l` lists packages; `grep -i` filters without case sensitivity. uv pip list lists environment packages. The HEAD-query group records an initial restoration failure while fsck checked 93839 objects. The later commands show how to check users, directories and distributions in the restored environment. I have no individual results for those queries. `id` reports user information, `whoami` the current user, and WSL `-u` selects a user.

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

## References for option behaviour

The installation and project options were checked against [WinGet install](https://learn.microsoft.com/en-za/windows/package-manager/winget/install) and the [uv CLI reference](https://docs.astral.sh/uv/reference/cli/). These support command explanations, not historical execution results.
