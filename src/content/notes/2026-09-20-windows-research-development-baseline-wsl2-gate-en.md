---
title: "Building the Windows Research Development Baseline and Validating the WSL2 Gate"
description: "Validating the Windows-native development environment and WSL2 through representative work, the chosen storage design, and post-reboot persistence before adding the GPU research layer."
lang: en
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

In “Building the Storage and Productivity Baseline”, I separated the lifecycles of the OS and data and established the D: structure that would hold research assets. The next task was to build the Windows-native development environment on that baseline and determine whether WSL2 could operate as the optional path envisaged in the architecture.

The first architecture Note grouped Windows development setup and the WSL2 pre-check into one relatively broad stage. Implementation divided that work into smaller validated layers: Clean Windows, Storage and Productivity, the Windows development baseline, and the WSL2 Gate. Rather than rewriting the original design, this Note records how the plan became more precise through implementation.

Installation alone was not enough for a `PASS`. A tool had to launch, complete a representative real task, work with the chosen storage model, and retain the required state after a reboot or restart where relevant.

## 1. Starting from an Empty Development Stack

The clean Windows system began this phase without a development stack. Git, VS Code, Python, the `py` launcher, uv, Jupyter, and WSL were all absent.

Running `python --version` triggered the Windows App Execution Alias and a Microsoft Store suggestion. It did not find a usable Python runtime. Distinguishing a resolvable command alias from an installed runtime was the first baseline check.

I also kept the scope deliberate. This phase would establish a Windows-native path capable of running Python projects and notebooks, then test whether WSL2 could provide a Linux-native path. CUDA, PyTorch GPU acceleration, and local LLM tooling would not yet be placed on top of it.

## 2. Building the Windows-native Baseline

The completed Windows baseline contained the following versions and states.

| Component              | Verified version or state                                  |
| ---------------------- | ---------------------------------------------------------- |
| Git                    | `2.55.0.windows.3`                                         |
| **Visual Studio Code** | `1.138.0`, x64, installed machine-wide under Program Files |
| uv                     | `0.12.17`                                                  |
| Python                 | uv-managed `3.12.14`                                       |
| JupyterLab             | `4.6.3`                                                    |

I selected Python 3.12 deliberately for the Windows research baseline. This was not a policy of following the latest Python release; it was a compatibility-conscious choice for the later CUDA and PyTorch layer.

uv manages the Python runtime, while the research projects belong on D:. The OS, applications, and uv-managed runtime remain on C:. Projects and their local `.venv` environments live under `D:\Lab\Research\`. The development stack therefore follows the storage roles established in the previous phase.

## 3. When C: and D: Separation Reached uv

Running `uv add requests` in the D: project produced this warning:

```text
Failed to hardlink files; falling back to full copy
```

The project and its `.venv` were on D:, while the uv cache initially lived at `C:\Users\<user>\AppData\Local\uv\cache`. A hardlink could not cross those volumes, so uv fell back to copying the files. Dependency installation still succeeded, and I did not treat the warning as an installation failure.

Rather than fixing only the visible warning by forcing copy mode, I used the user-level `UV_CACHE_DIR` to move the cache to:

```text
D:\Lab\OfflineLab\cache\uv
```

This aligned a potentially large package cache with the D: research-asset structure and allowed it to share a volume with the project virtual environments.

The uv cache is a performance cache, not the curated offline wheelhouse planned for reproducibility. `D:\Lab\OfflineLab\wheelhouse` remains a separate future asset.

## 4. A Real Windows Smoke Test

I created a small project at `D:\Lab\Research\smoke-test` to test the complete path rather than merely query installed versions.

```powershell
uv init smoke-test
uv add requests
```

`uv init` had already initialised a Git repository. A later `git init` therefore reported `Reinitialized existing Git repository`. This was not an error, but a useful discovery about the initial state created by uv.

The project used Python `3.12.14`, a project-local `.venv`, and `requests 2.34.2`. The actual Python smoke test reported:

```text
Python 3.12.14
requests 2.34.2
Windows research baseline OK
```

That single path verified uv's Python resolution, the project virtual environment, dependency installation and import, and Python execution from the D: research workspace.

## 5. Git Policy across Windows and WSL

The Windows Git global identity uses a public name and a GitHub noreply address. The actual email address is intentionally absent from this public record.

I combined global `core.autocrlf=input` with this repository-level `.gitattributes` policy:

```gitattributes
* text=auto eol=lf
```

During the first staging operation, Git warned that CRLF working-tree content would be normalised to LF. That was the intended policy taking effect, not an error. Repository recognition, staging, and the root commit all succeeded. I subsequently standardised new repositories on `init.defaultBranch=main`.

This phase tested local Git behaviour only. It did not validate remote GitHub authentication or a push workflow.

Later, inside WSL, I verified Git `2.53.0` at `/usr/bin/git` and configured the identity, `core.autocrlf=input`, and `init.defaultBranch=main` separately. Windows Git and WSL Git do not share a global configuration. A WSL-native repository used the same `.gitattributes` rule and completed its root commit successfully.

## 6. VS Code as a Normal-User Development Environment

The first `code .` launch came from an elevated Administrator PowerShell, which also opened VS Code as Administrator. Routine editor use did not require that privilege, so I corrected it deliberately.

The final baseline runs VS Code as a normal user. The local smoke-test folder initially opened in **Restricted Mode**; I trusted that specific folder because I had created it directly for this research environment. This is not a policy of trusting arbitrary folders.

I installed Microsoft's standard Python extension stack, including Python, Python Environments, debugpy, and Pylance. The selected workspace interpreter was:

```text
D:\Lab\Research\smoke-test\.venv\Scripts\python.exe
```

The VS Code integrated terminal confirmed Python `3.12.14` and `requests 2.34.2`. This validated the route from VS Code, through the workspace interpreter and project `.venv`, to the dependency environment created by uv.

## 7. Separating the Jupyter UI from the Project Kernel

I kept the Jupyter UI/runtime separate from each project's notebook kernel. **JupyterLab** is managed independently as a `uv tool`, while `ipykernel` is a development dependency inside the project `.venv`. The Jupyter extension supplies the notebook UI in VS Code.

After `uv tool install jupyterlab`, the exposed command was `jupyter-lab`, not the generic `jupyter` command. Consequently, `jupyter lab --version` failed while `jupyter-lab --version` reported `4.6.3`. The first command's failure did not mean that JupyterLab had failed to install.

For the real notebook smoke test, I selected the project `.venv` kernel. Python `3.12.14`, the `requests 2.34.2` import, cell execution, and writing a file to D: and reading it back all worked. The saved `baseline-test.ipynb` is a more useful validation artefact than the fact that a notebook interface opened.

## 8. Conflicting Virtualisation Signals

Before opening the WSL2 Gate, `Win32_Processor.VirtualizationFirmwareEnabled` returned `False`. In isolation, that suggested firmware virtualisation was disabled.

Other evidence disagreed.

| Source              | Observed state                          |
| ------------------- | --------------------------------------- |
| BIOS                | CPU VT (VT-x) `Supported`               |
| Task Manager        | **Virtualization: Enabled**             |
| `Get-ComputerInfo`  | `HyperVisorPresent = True`              |
| `Win32_DeviceGuard` | `VirtualizationBasedSecurityStatus = 2` |

VBS was already running, and a Microsoft hypervisor was present before WSL was installed. I therefore did not accept one WMI property as the sole source of truth; I cross-checked the BIOS, Windows UI, hypervisor, and Device Guard state.

I did not establish why `Win32_Processor.VirtualizationFirmwareEnabled` returned `False`. Recording the conflicting observation and the later operational test is more accurate than assigning it an unverified cause.

## 9. Validating the WSL2 Platform

Initially, both `VirtualMachinePlatform` and `Microsoft-Windows-Subsystem-Linux` were `Disabled`; neither a WSL engine nor a distribution was installed. I prepared the platform without immediately adding a distribution:

```powershell
wsl --install --no-distribution
```

The installed WSL version was `2.7.14.0`, with kernel `6.18.33.2-2`. At one point during configuration, `VirtualMachinePlatform` and `HypervisorPlatform` were `Enabled` while `Microsoft-Windows-Subsystem-Linux` appeared `Disabled`. `hvservice` and `wslservice` were running, and `vmcompute` was available as a manual service.

An earlier message claiming that virtualisation was not enabled eventually disappeared after the Windows virtualisation stack reached its final verified state. I did not isolate one precise change as the definitive fix.

Optional Feature labels were therefore not the final Gate. The deciding evidence was whether a WSL2 distribution could start and perform Linux-native work.

## 10. Why Ubuntu 26.04 LTS

Ubuntu 24.04 LTS was the initial candidate because of its mature ecosystem, extensive documentation, and conservative compatibility profile. The final choice was `Ubuntu-26.04`. The installed release was Ubuntu `26.04.1 LTS`, codename `Resolute Raccoon`, with kernel `6.18.33.2-microsoft-standard-WSL2`.

This was not a simple assumption that newer is better. I expect the workstation to support research for at least a year, and the resulting research work will probably be produced well after the initial setup date. The environment's useful lifetime therefore mattered alongside immediate ecosystem maturity.

Ubuntu 26.04 is itself an LTS release, and contemporary CUDA support includes Ubuntu 26.04.1. I was also willing to treat compatibility friction in a newer environment as useful Research Journey evidence rather than only as an inconvenience.

The choice combined a long-term research lifecycle, LTS status, current CUDA support, and a willingness to learn from compatibility issues.

## 11. Keeping WSL Storage on D:

I explicitly installed the `Ubuntu-26.04` distribution at:

```text
D:\Lab\WSL\Ubuntu-26.04
```

The actual `ext4.vhdx` was present under that D: location. The storage architecture prepared in the previous Note was therefore used by the real WSL asset rather than remaining only a directory plan.

This does not mean that WSL-native projects should normally live under `/mnt/d`. Windows-native projects belong under `D:\Lab\Research\...`, while WSL-native projects live under `/home/<user>/research/...`. They receive Linux-native filesystem behaviour inside WSL's ext4 filesystem, while the virtual disk itself remains physically stored on D:.

I created the Linux user during first provisioning and do not record its password. Canonical platform metrics were also presented. For this enterprise-oriented baseline, I prefer to avoid unnecessary telemetry where practical, but I do not claim that the metrics choice materially affected functionality.

## 12. Different Python Baselines by Design

The Ubuntu baseline contained Ubuntu `26.04.1 LTS`, Python `3.14.4`, and Git `2.53.0`. The Linux home directory worked, `/mnt/d/Lab` mounted correctly, WSL-to-Windows D: read/write succeeded, and both network and HTTPS connectivity were available.

I created the native Linux project at `~/research/wsl-smoke-test`, not under `/mnt/d`. Its smoke test printed Python `3.14.4`, a current path beneath `/home/.../research/wsl-smoke-test`, and:

```text
WSL native Python baseline OK
```

The Windows baseline uses uv-managed Python `3.12.14`, while the Ubuntu base OS supplies Python `3.14.4` at `/usr/bin/python3`. I intentionally did not force them to match in this phase. The objective was to validate each environment's baseline separately, not yet reproduce one identical research project across Windows and WSL.

If a future project requires an identical interpreter version, uv can also be introduced inside WSL. The current version difference is a deliberate boundary, not an error.

## 13. Validating VS Code Remote WSL

The first VS Code Remote WSL attempt also began from an elevated context, so VS Code appeared as Administrator. I corrected this to the same normal-user baseline used for Windows-native development.

The final configuration displayed **WSL: Ubuntu-26.04** and opened only `~/research/wsl-smoke-test`, which I trusted as the dedicated test folder. I did not broadly trust the entire Linux home directory. After VS Code Server was installed inside WSL, Python execution from VS Code worked successfully.

This connected the Windows editor UI, the WSL remote session, the Linux-native folder, and the Linux Python runtime as a practical development path.

## 14. Reboot and Restart Persistence

After a full Windows reboot, Git `2.55.0.windows.3`, VS Code `1.138.0`, uv `0.12.17`, and Python `3.12.14` were still present. `Ubuntu-26.04` remained the default WSL distribution and the WSL default version remained `2`.

The Windows smoke test succeeded again. I restarted the WSL distribution and reran its native Python smoke test successfully. The baseline had therefore survived a reboot rather than working only in the initial installation session.

One unexpected working-tree state appeared when `.gitattributes` seemed empty after a validation step. I did not establish the exact cause. I restored the file from Git, ran `wsl --shutdown`, and restarted the distribution. The file still contained the intended rule and the working tree was clean:

```gitattributes
* text=auto eol=lf
```

I have kept this as a concise persistence observation without attributing it to an unverified cause.

## 15. Capturing the Development Baseline

I recorded the development state in four files under `D:\Lab\OfflineLab\manifests\`.

| File                                | Recorded scope                        |
| ----------------------------------- | ------------------------------------- |
| `development-windows-baseline.txt`  | Windows tool and runtime versions     |
| `development-wsl-baseline.txt`      | WSL, distribution, and Linux baseline |
| `development-vscode-extensions.txt` | VS Code extension inventory           |
| `development-git-config.txt`        | Windows and WSL Git baseline settings |

These complement the productivity and storage manifests from the previous phase. They are evidence for later comparison and rebuilding decisions, not a complete backup or an automatic restore mechanism.

## 16. Baseline Reached and the Next Layer

The final assessment for this phase is:

| Gate                                | Result | Evidence required                                                                  |
| ----------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| Windows Native Development Baseline | `PASS` | Project creation, dependency import, and real VS Code and notebook execution       |
| WSL2 Gate                           | `PASS` | WSL2 startup, Linux-native project, storage, network, HTTPS, and Remote WSL checks |
| Reboot / Restart Persistence        | `PASS` | Windows and WSL smoke tests repeated after reboot or restart                       |

Here, `PASS` means more than finding a tool in an installed-programme list. It means launch, representative use, integration with the selected storage model, and persistence after restart were verified.

The NVIDIA CUDA Toolkit, PyTorch GPU acceleration, CUDA validation, a GPU benchmark, Ollama, llama.cpp, a local LLM runtime, and local model deployment have not yet been configured. They belong to the next research layer above this development baseline and WSL2 Gate.

Windows Native and WSL2 now provide two working execution paths. The next Note will preserve this baseline while validating CUDA, PyTorch, and local LLM tooling on the RTX 5060.
