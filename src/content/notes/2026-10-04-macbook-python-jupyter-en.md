---
title: "Building a Python and Jupyter Research Environment"
description: "Configuring uv and a project-specific Python environment on a MacBook, then checking the same environment and computation in the terminal, VS Code and Jupyter."
lang: en
translationKey: macbook-python-jupyter
pubDatetime: 2026-10-04T23:00:00+09:00
tags:
  - research-journey
  - macos
  - workstation
  - development
  - python
featured: false
draft: false
---

In “Managing the Website from a MacBook”, I established an environment for editing, building and publishing Notes. This time I configured a Python research project separately from the website's Node.js environment. The aim was to connect the previously installed Python and Jupyter extensions in VS Code to a real interpreter and kernel, and to run the same code in the terminal and a notebook.

I used a small project producing numerical results, a table and a plot as the baseline. Before installing complex models, I wanted to check how the Python executable, packages and result files fit together. AI computation and model execution will be checked in the next stage.

## 1. Separating System Python from Research Python

During the initial inspection, `/usr/bin/python3` reported Python 3.9.6. I left that executable in place and installed a separate Python managed by **uv**. This provides a way to choose a project interpreter, record dependencies and create its virtual environment.

I chose the Python 3.13 series. Before installation, I checked PyPI distribution metadata for the Python requirements and Python 3.13 distributions of NumPy, ipykernel, JupyterLab, and PyTorch and MLX for later consideration. This was a check of installation candidates, not a computation test with PyTorch or MLX. The exact interpreter installed by uv was CPython 3.13.16 for `macos-aarch64`.

I obtained uv through the GitHub release method described in its [official installation guidance](https://docs.astral.sh/uv/getting-started/installation/). I downloaded `uv-aarch64-apple-darwin.tar.gz` for version 0.12.23 and confirmed that its SHA256 matched the digest in the GitHub release API. I installed it in `~/Developer/.tools/uv-0.12.23` and created links for `uv` and `uvx` under `.tools/bin`.

I also specified locations for managed Python installations and the cache, adding the following to the existing `~/.zprofile`.

```sh
export PATH="$HOME/Developer/.tools/bin:$PATH"
export UV_PYTHON_INSTALL_DIR="$HOME/Developer/.tools/uv-python"
export UV_PYTHON_BIN_DIR="$HOME/Developer/.tools/bin"
export UV_CACHE_DIR="$HOME/Developer/.tools/uv-cache"
```

I then ran `uv python install 3.13` in a login shell. As explained in [uv's Python management guide](https://docs.astral.sh/uv/guides/install-python/), managed Python uses Astral's python-build-standalone distributions. That was the source of this installation; I did not use the macOS installer from python.org.

## 2. A Project Environment and Lockfile

I created the baseline project at `~/Developer/research-python-baseline`, outside cloud synchronisation.

```sh
uv init --vcs none --python 3.13.16 \
  "$HOME/Developer/research-python-baseline"
cd "$HOME/Developer/research-python-baseline"
uv add numpy pandas matplotlib
uv add --dev ipykernel jupyterlab nbconvert
```

I did not create a Git repository or remote for this project. It is a local project focused on configuring and checking Python execution. `.python-version` records `3.13.16`, and the Python requirement in `pyproject.toml` is `>=3.13.16,<3.14`. This keeps the environment within the selected series rather than extending automatically to the next one.

NumPy, pandas and Matplotlib are project dependencies; ipykernel, JupyterLab and nbconvert are development dependencies. The installed versions were:

| Component  | Version | Role in this stage                                         |
| ---------- | ------- | ---------------------------------------------------------- |
| Python     | 3.13.16 | Project interpreter                                        |
| uv         | 0.12.23 | Managing Python, dependencies and environments             |
| NumPy      | 2.5.3   | Arrays and numerical computation                           |
| pandas     | 3.0.6   | Tables and CSV output                                      |
| Matplotlib | 3.11.2  | Plot files                                                 |
| ipykernel  | 7.4.0   | Python notebook kernel                                     |
| JupyterLab | 4.6.4   | Installed notebook tool                                    |
| nbconvert  | 7.17.1  | Running notebooks and saving outputs from the command line |

The environment was created in the project's `.venv`, with dependencies recorded in `uv.lock`. I added `.venv`, `.runtime` for caches and temporary state, and `results` for generated output to `.gitignore`. These define boundaries for future source control; they do not establish a separate result-preservation procedure.

## 3. Checking the Execution Path with a Small Computation

The verification code creates an array of integers from 1 to 5 and calculates their squares. The expected values are `1, 4, 9, 16, 25`. Their sum is `1 + 4 + 9 + 16 + 25 = 55`, and the mean of these five values is `55 ÷ 5 = 11.0`. Matching these expected results shows that a small computation with known inputs and answers runs correctly in the new environment. The code also writes a CSV, a PNG and a JSON environment record alongside the numerical result.

The code checks that `sys.prefix` is the project's `.venv`, the architecture is `arm64` and Python belongs to the 3.13 series. It also records `sys.executable` and package versions. This identifies the interpreter and dependencies used for the calculation, beyond observing that a command ran.

```sh
uv sync
uv run --locked research-python-baseline
```

The terminal result reported Python 3.13.16, `arm64`, the project's `.venv/bin/python` executable and `.venv` prefix. The computed sum of 55 and mean of 11.0 matched those expected values; the table, plot and JSON were written under `results/terminal`. Matplotlib saved the plot through its `Agg` backend without opening a graphical window. This was not a GPU computation or performance measurement.

## 4. Running Jupyter from the Command Line and VS Code

`baseline.ipynb` imports and runs the same project code. I first executed the whole notebook from the command line and saved a separate notebook containing its outputs.

```sh
uv run --locked jupyter nbconvert \
  --to notebook --execute baseline.ipynb \
  --output baseline-executed --output-dir results/executed \
  --ExecutePreprocessor.timeout=120
```

For this execution, I directed IPython and Jupyter configuration and temporary paths into the project's `.runtime` directory. The executed notebook contained no cell errors and retained JSON and plot outputs. The terminal and notebook kernel agreed on the Python version, executable, environment path, package versions and numerical results.

A permission restriction in the command-execution environment nevertheless prevented `psutil` from listing child processes during kernel shutdown. The log recorded an `Operation not permitted` error involving `sysctl()`; nbconvert wrote the output notebook and returned exit code 0. I distinguished the successful computation from the shutdown diagnostic rather than treating every part of execution and cleanup as error-free.

In VS Code, I granted trust only to the new research project directory, then selected `.venv/bin/python` through **Python: Select Interpreter**. In the notebook, I chose the same environment through **Select Kernel → Python Environments**. This follows the project ipykernel and environment-selection approach in [uv's VS Code integration guidance](https://docs.astral.sh/uv/guides/integration/jupyter/).

I ran the cells with **Notebook: Run All** and observed the success indicator, environment JSON and plot output. I then ran the verification script through **Python: Run Python File in Terminal**. The editor used the selected `.venv/bin/python` and wrote the same numerical results under `results/vscode-terminal`.

| Execution path                  | Observed result                                                      |
| ------------------------------- | -------------------------------------------------------------------- |
| Terminal `uv run --locked`      | Python 3.13.16, project `.venv`, sum 55 and mean 11.0                |
| Command-line notebook execution | Same environment and result, with JSON and plot output               |
| VS Code notebook kernel         | Actual cell execution in the same `.venv`, with JSON and plot output |
| VS Code Python script           | Same interpreter and generated result files                          |

JupyterLab is installed, but the interactive notebook work checked in this stage took place in VS Code. I have not checked running JupyterLab's browser server.

## 5. Repeated Execution and Remaining Checks

I checked `uv --version` and `python3.13 --version` in a fresh login zsh. After restarting macOS, both commands reported the same versions, and the following commands succeeded in the same project.

```sh
uv sync --locked --offline
uv run --locked --offline research-python-baseline
```

After the restart, VS Code retained the same `.venv` interpreter and notebook kernel selections. I reran the Python script and the whole notebook, confirming the sum of 55, mean of 11.0 and generated result files.

This repeated execution used the existing `.venv` and cache. It confirmed work without requesting new packages through `--offline`; it did not validate the whole computer with its network disconnected or recovery into a clean environment.

Rebuilding an environment from the lockfile in a separate project copy, and preserving selected results in Google Drive with content comparisons, are also follow-up work.

This stage established research Python separate from system Python, recorded project dependencies, and checked execution paths in the terminal, editor and notebook. Next I intend to use a separate small AI project to test actual PyTorch MPS and MLX computation. Availability of installation candidates for the same Python series and successful computation on Apple Silicon will be checked separately in that stage.
