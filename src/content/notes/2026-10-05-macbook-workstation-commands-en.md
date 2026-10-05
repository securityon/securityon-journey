---
title: "MacBook Setup Commands and Verification Scripts"
description: "A reference to the commands and verification source used during the MacBook setup, with working directories, expected results and preservation boundaries."
lang: en
translationKey: macbook-workstation-commands
pubDatetime: 2026-10-05T00:00:00+09:00
tags:
  - research-journey
  - macos
  - workstation
  - development
  - reproducibility
featured: false
draft: true
---

The seven MacBook setup Notes recorded tool choices and execution results in stages. This companion brings together the commands and verification scripts for later reference. It covers environment inspection, website maintenance, Python/Jupyter, GPU computation and local inference, with working directories and results to check.

The recorded machine is a MacBook Pro with an Apple M5 Pro and 24GB of memory, running macOS 26.6.2 on `arm64`. Commands refer to the versions and files used during that setup. Selecting new packages during initial installation is different from recreating an environment from recorded versions. I have not combined all stages into an automatic installer.

## 1. Source Bundle and Preparation

The [verification source ZIP](/downloads/macbook-verification-sources-2026-10-05.zip) contains the three test projects' Python code, shell scripts, `.python-version`, `pyproject.toml` and `uv.lock`. The Python Notebook retains its code cells with execution outputs cleared. The local-model project includes public Note excerpts and a model file manifest. Virtual environments, model weights, caches, execution results and credentials are excluded.

The ZIP is 101,458 bytes. Its SHA-256 is below; running `shasum -a 256` on the downloaded file allows a comparison.

```text
da5ef21999f0241334c14f8d05db07ce474c41587c91c3223f492418e8b6f26b
```

Inside, `manifest.json` records project file sizes and hashes. I checked archive contents against the exported files, and checked Python and shell syntax. I extracted the Python project into a separate directory and created a fresh environment, reusing the existing package cache. The test squares the integers 1–5; its sum of 55 and mean of 11.0 matched the expected values. I did not rerun GPU calculations or model inference. The results described here come from the earlier executions.

The bundle contains `research-python-baseline`, `research-apple-silicon-ai` and `research-local-llm`. Place these directories under `~/Developer` only where no existing work would be overwritten. If the names already exist, compare the files instead. Shell scripts read `~/.zprofile` to locate uv, so tool installation and path configuration come first.

Repeated runs can overwrite named JSON files, logs and figures. Preserve earlier results in dated folders under `~/Research/Experiments` first. These projects were environment checks, and I did not create separate GitHub repositories for them. The download preserves their verification code alongside this record.

## 2. Inspecting macOS and Developer Tools

I used the following commands in the Mac's login Terminal to inspect the operating system, architecture and storage.

```sh
sw_vers
uname -m
df -h / /System/Volumes/Data
fdesetup status
xcode-select -p
pkgutil --pkg-info com.apple.pkg.CLTools_Executables
```

`sw_vers` reports the macOS version and build; `uname -m` returned `arm64`. The root and Data volumes share storage, so their total and available capacities should not be added together. The initial inspection confirmed FileVault was off, and I chose to leave it disabled. Failed status queries in a restricted execution environment were not interpreted as an on/off state.

Hardware inspection used `system_profiler SPHardwareDataType`. The bundle's `audit.sh` contains the original inspection commands and filtering for serial numbers, UUIDs and user paths. It continues to the next item after an error. Producing a report does not mean every item was verified. Some commands can prompt for developer-tool installation on a Mac without those tools.

When Command Line Tools were absent, I requested installation with the first command below, completed the installation dialogue, then checked the path and actual command execution.

```sh
xcode-select --install
xcode-select -p
git --version
clang --version
```

The active path was `/Library/Developer/CommandLineTools`, with Git 2.50.1 and Apple clang 21.0.0. An installation-request message alone was insufficient confirmation. Starting conditions and material-management decisions are in [Establishing the macOS and Research Material Baseline](/notes/en/macos-research-materials-baseline/).

## 3. GitHub Authentication and Website Maintenance

To reload an already registered SSH key into the agent, I used:

```sh
/usr/bin/ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

The passphrase is entered in Terminal and kept out of the public record. Initially I created a Mac-specific Ed25519 key and registered its public key on GitHub. Key-generation commands are excluded from this repeat-run list because they can overwrite existing keys. I checked GitHub's server-key fingerprint before testing authentication, and distinguished account authentication from repository access through the website clone. Commit author details used the existing website-management identity.

The website directory is `~/Developer/securityon-journey`. I installed Node.js 24.21.0 and pnpm 11.3.0; Astro, TypeScript, Tailwind CSS and Prettier are repository dependencies. This setup did not require installing Homebrew.

```sh
cd ~/Developer/securityon-journey
node --version
pnpm --version
pnpm install --frozen-lockfile \
  --store-dir "$HOME/Developer/.tools/pnpm-store"
pnpm run lint
pnpm run format:check
pnpm run build
pnpm run preview --host 127.0.0.1 --port 4321
```

`pnpm-lock.yaml` records the exact package versions to install together. `--frozen-lockfile` prevents installation from rewriting that record. Lint checks code rules, the format check checks presentation, and the build generates pages. Check each command's result separately. The final preview command keeps a server running; use another Terminal for further commands or stop it with `Control+C`. The address is `http://127.0.0.1:4321/`.

I installed the pinned pnpm version into the local Node.js tool directory as follows. An environment already containing that version does not need repeated installation.

```sh
npm install --global pnpm@11.3.0 \
  --prefix "$HOME/Developer/.tools/node" \
  --cache "$HOME/Developer/.tools/npm-cache" \
  --no-audit --no-fund
```

Node.js download verification, local tool paths and VS Code configuration are recorded in [Managing the Website from a MacBook](/notes/en/macbook-website-management/). VS Code provides editing; the actual build uses tools installed in the repository.

## 4. Python and Jupyter

I installed uv 0.12.23 and managed Python 3.13.16. The tool paths and uv storage locations recorded in `~/.zprofile` are below. Compare with existing settings rather than replacing the file or repeatedly appending identical lines.

```sh
export PATH="$HOME/Developer/.tools/bin:$HOME/Developer/.tools/node/bin:$PATH"
export UV_PYTHON_INSTALL_DIR="$HOME/Developer/.tools/uv-python"
export UV_PYTHON_BIN_DIR="$HOME/Developer/.tools/bin"
export UV_CACHE_DIR="$HOME/Developer/.tools/uv-cache"
```

Initial managed-Python installation used `uv python install 3.13`, which installed 3.13.16 at that time. I recorded that version in each project without replacing system Python. Acquisition and hash verification of the uv distribution are in [Building a Python and Jupyter Research Environment](/notes/en/macbook-python-jupyter/).

`.python-version` selects Python 3.13.16, while `uv.lock` records package versions. The `pyproject.toml` range `>=3.13.16,<3.14` means Python 3.13.16 or later, but below 3.14. To recreate the bundled project, install from those records rather than selecting versions again with `uv add`.

```sh
cd ~/Developer/research-python-baseline
uv sync --locked
uv run --locked research-python-baseline
```

The code squares the integers 1–5 to produce `1, 4, 9, 16, 25`. The expected sum is 55 and mean is `55 ÷ 5 = 11.0`. It checks these values, the project's `.venv` interpreter and `arm64` architecture. A successful run writes CSV, PNG and environment JSON files under `results/terminal`.

The Notebook performs the same calculation. For command-line execution I placed configuration and runtime state inside the project. The following combines the settings and execution options used during reconstruction, expressed from the project working directory.

```sh
export JUPYTER_CONFIG_DIR="$PWD/.runtime/jupyter/config"
export JUPYTER_DATA_DIR="$PWD/.runtime/jupyter/data"
export JUPYTER_RUNTIME_DIR="$PWD/.runtime/jupyter/runtime"
export IPYTHONDIR="$PWD/.runtime/ipython"
uv run --locked jupyter nbconvert --to notebook --execute baseline.ipynb \
  --output baseline-executed --output-dir results/executed \
  --ExecutePreprocessor.kernel_name=python3 \
  --ExecutePreprocessor.timeout=120
```

In VS Code I selected `.venv/bin/python` as both interpreter and Notebook kernel. Script, VS Code and Notebook execution were also checked after restarting macOS. The bundled `verify-python-after-reboot.sh` checked offline repetition using the existing environment and cache; it is not an initial environment-creation script. See [Building a Python and Jupyter Research Environment](/notes/en/macbook-python-jupyter/) for the execution record.

## 5. PyTorch and MLX GPU Checks

GPU verification ran in a normal Mac login Terminal with Metal access. Install the project dependencies first.

```sh
cd ~/Developer/research-apple-silicon-ai
uv sync --locked
```

`verify_ai.py` checks PyTorch MPS and the MLX GPU separately. The known small matrix product is `[[19, 22], [43, 50]]`. It then compares a 128×128 matrix product with a NumPy CPU reference and trains `y = 2x + 1`, checking that its coefficients approach 2 and 1.

The original `run-verification.sh` runs PyTorch followed by MLX's default configuration. On this Mac the default MLX float32 check exceeded the error limits and stopped. Do not expect that original script to report success for both frameworks. Read the final PyTorch check and MLX precision comparison separately:

```sh
unset PYTORCH_ENABLE_MPS_FALLBACK
uv run --locked python verify_ai.py torch
/bin/zsh ~/Developer/research-apple-silicon-ai/run-mlx-comparison.sh
```

Unsetting `PYTORCH_ENABLE_MPS_FALLBACK` prevents unsupported GPU operations from silently falling back to the CPU. The comparison script records default-precision violations, then runs a separate process with `MLX_ENABLE_TF32=0`. It uses `--offline`, so `uv sync --locked` must have completed first. JSON files are distinguished as `results/torch-verification.json`, `mlx-default-verification.json` and `mlx-full-fp32-verification.json`.

The float32 check used both absolute and relative tolerances of `0.0001`. For float16 they were absolute `0.02` and relative `0.005`. These are experiment thresholds for this input, allowing small rounding differences while detecting larger discrepancies, rather than guarantees for every research task. [Verifying the Apple Silicon AI Environment](/notes/en/macbook-apple-silicon-ai/) explains the thresholds and observed failures and passes. This is not a throughput contest or a large-model capacity test.

## 6. Preparing and Checking a Local Model

The local-model project used MLX-LM 0.32.0 and MLX 0.32.3. Install the recorded dependencies before downloading the model.

```sh
cd ~/Developer/research-local-llm
uv sync --locked
uv run --locked download_model.py
```

`download_model.py` selects revision `21457c6f51ed54a7c16e988c0844db973815c137` of Qwen3-1.7B-MLX-4bit. Model files require approximately 0.93GB, in addition to dependencies. Downloading requires internet access. The script records file sizes and SHA-256 hashes in `model-manifest.json`, comparing the two LFS files with expected hashes supplied by repository metadata. Not every file hash was independently verified.

After preparing the model, I ran:

```sh
/bin/zsh ~/Developer/research-local-llm/run-verification.sh
```

The script uses local weights, Hugging Face offline settings and `uv --offline`. It was not tested with Wi-Fi disconnected. Settings include `MLX_ENABLE_TF32=0`, a maximum of 256 new tokens and a 2,048-token input limit. The original chat template ignored the non-thinking option, so the verified final code appends an empty completed reasoning block to the prompt. Downloaded model files remain unchanged.

Five cases combined a short arithmetic response with questions grounded in public Note excerpts. Outputs are `results/verification.json` and `results/terminal.log`. `complete: true` marks completion, not factual correctness. The observed run contained correct answer content alongside incorrect citations. Consult the comparison in [Local LLMs and Research Notes on MacBook](/notes/en/macbook-local-llm/) when interpreting the output.

The bundled `corpus.json` supplies the same excerpts. `prepare_corpus.py` is needed only to extract them again and expects the website repository at `~/Developer/securityon-journey`. The `verify_llm.py --retrieval-only` path checks retrieval ranking separately from inference.

## 7. Reconstruction and Result Preservation

Recreating an environment requires source, the Python version and dependency records. Installed `.venv` directories and caches can be generated again; genuine research material, manuscripts and results need separate preservation.

| Item                     | What to retain                                              | Location or method                                            |
| ------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Website                  | Source, `pnpm-lock.yaml`, Git history                       | Local Developer and the existing GitHub repository            |
| Test projects            | Source, `.python-version`, `pyproject.toml`, `uv.lock`      | Source bundle and dated Research copies                       |
| Local model              | Repository, revision, file list and hashes                  | `model-manifest.json`; weights excluded from the bundle       |
| Execution results        | Logs, JSON, CSV, figures and executed Notebooks             | Dated copies under `~/Research/Experiments`                   |
| Material and manuscripts | Originals and working copies that are difficult to recreate | `~/Research` and Google Drive computer-folder synchronisation |

I configured local Research synchronisation through Google Drive's interface rather than retaining whole-My-Drive mirroring. Changes and deletion can propagate to the cloud, so I checked synchronisation separately from previous-version preservation and recovery.

Reconstruction included a separate website clone from GitHub and a fresh Python environment without the original `.venv`, followed by script and Notebook execution. The existing uv cache was reused. It did not include fresh-environment GPU/LLM reconstruction or macOS restoration. [The MacBook Research Configuration](/notes/en/macbook-workstation-configuration/) records these boundaries and the cloud content and earlier-version recovery check for one test file.

## 8. Reusing This Record

For new research I intend to use these checks as an environment starting point. Python's 55 and 11.0, a known matrix product and a short model response check different execution paths. Research data and larger experiments need their own validation conditions.

When updating tools, retain the previous version records and compare the same baseline calculations again. The approach established here is to read the execution environment, expected calculations and citation accuracy alongside the existence of output files.
