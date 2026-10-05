---
title: "The MacBook Research Configuration"
description: "Recording code, material and result preservation boundaries, and rebuilding representative workflows in separate folders and a fresh virtual environment."
lang: en
translationKey: macbook-workstation-configuration
pubDatetime: 2026-10-05T00:00:00+09:00
sortOrder: 7
tags:
  - research-journey
  - macos
  - workstation
  - development
  - reproducibility
featured: false
draft: false
---

I configured the MacBook research workstation through small execution checks rather than installing every tool at once. The work moved from the macOS baseline through website management, Python and Jupyter, Apple Silicon GPU computation and a local LLM. In this final stage I checked where code and results remain, and whether representative work can run without its original working folder.

Copying an installed virtual environment may be convenient, but obscures which files are needed to recreate it. I cloned the website again from GitHub and copied only source and dependency records for a representative Python project before creating a fresh environment. For synchronisation, I used a harmless test file to compare cloud contents and check recovery of an earlier version.

## 1. Tools and Their Roles

The experiments used a MacBook Pro with an Apple M5 Pro and 24GB of memory, as recorded in the initial hardware inspection. This inventory rechecked macOS 26.6.2, build 25G83 and `arm64`.

| Component                | Recorded state                                                | Role                                      |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------- |
| Command Line Tools / Git | Active path `/Library/Developer/CommandLineTools`, Git 2.50.1 | Command-line tools and source management  |
| Node.js / pnpm           | 24.21.0 / 11.3.0                                              | Website dependencies and builds           |
| VS Code                  | 1.140.0                                                       | Code editing and Python/Jupyter work      |
| uv / project Python      | 0.12.23 / 3.13.16                                             | Project environments and dependencies     |
| PyTorch / MLX            | 2.14.1 / 0.32.3 used in the earlier GPU experiment            | GPU calculations and small training tasks |
| MLX-LM                   | 0.32.0 used in the earlier local-model experiment             | Local model loading and generation        |
| Google Drive desktop app | 131.0                                                         | Research folder synchronisation           |

Astro and Prettier are dependencies of the website repository, without requiring duplicate global installations. Research packages live in project `.venv` directories; I did not replace system Python with the research interpreter.

I retained the decision to leave FileVault disabled. Rechecking `fdesetup status` in the restricted execution environment failed with a volume-identification error, so I do not treat that as a newly verified state. Time Machine and full-system restoration were outside the required scope of this setup.

## 2. Boundaries Between Code, Material and Results

`~/Developer` holds working code and `~/Research` holds material and results worth preserving. `.venv` contains the installed Python environment and can be recreated from source and dependency records. The Python projects' `uv.lock` and the website's `pnpm-lock.yaml` record the exact package versions to install together, helping preserve that combination during reinstallation.

| Location or file                        | Content managed                                                   |
| --------------------------------------- | ----------------------------------------------------------------- |
| `~/Developer/securityon-journey`        | Website source and `pnpm-lock.yaml`                               |
| `~/Developer/research-python-baseline`  | Python/Jupyter baseline source and `uv.lock`                      |
| `~/Developer/research-apple-silicon-ai` | GPU computation and precision-comparison source with `uv.lock`    |
| `~/Developer/research-local-llm`        | Inference source, public Note excerpts, model revision and hashes |
| `~/Research/Materials`, `Manuscripts`   | Locations for research material and manuscripts                   |
| `~/Research/Experiments`                | Dated copies of execution results and verification records        |
| `~/Research/Backups`                    | Separately preserved material and source copies                   |

Creating folders does not complete the workflow by itself. Each project's `.gitignore` listed `results` for exclusion, but earlier outputs still remained inside their project folders. I copied actual results into dated Research locations, retained the originals and distinguished historical results from new executions.

I preserve the website on GitHub. The three research projects were environment checks, so I decided to retain local source and dated archives without creating separate GitHub repositories. When starting a real research project, I will choose its remote repository and result-preservation method separately.

## 3. Building a Separate Website Clone

The check used `~/Developer/research-workstation-check/website-clone`. I cloned from GitHub without copying the original website's `node_modules`. The source matched commit `9f152c0`, including the sixth Note.

```sh
pnpm install --frozen-lockfile \
  --store-dir ~/Developer/research-workstation-check/.runtime/pnpm-store
pnpm run build
```

`--frozen-lockfile` uses the dependency combination recorded in the repository without rewriting `pnpm-lock.yaml`. I also placed the package store under the verification directory. Installation, build and lint passed, and the clone's source working tree remained clean.

This established that I could retrieve the source and produce a local build. It was not a rebuild starting with a fresh macOS installation, nor a deployment test.

## 4. Python and Jupyter in a Fresh Environment

The Python check used `~/Developer/research-workstation-check/python-reconstructed`. I copied source, `pyproject.toml`, `uv.lock`, `.python-version` and the Notebook, without copying the original `.venv`, caches or results. SHA-256 comparisons confirmed that the key copied files matched their originals.

```sh
uv sync --locked \
  --project ~/Developer/research-workstation-check/python-reconstructed
uv run --locked \
  --project ~/Developer/research-workstation-check/python-reconstructed \
  research-python-baseline
```

A new `.venv` was created with Python 3.13.16 and the package versions used previously. The existing uv package cache was reused, so this was not an empty-cache download test. The recorded interpreter path pointed to `python-reconstructed/.venv`, rather than the original project.

The calculation squares the integers 1–5, producing `1, 4, 9, 16, 25`. Their expected sum is 55 and mean is `55 ÷ 5 = 11.0`. Both script and Notebook matched those values and generated CSV, PNG and JSON outputs.

The first Notebook execution tried to create the default `~/.jupyter` directory and was blocked by the restricted environment's write permissions. I then placed Jupyter and IPython configuration and runtime files under the verification project's `.runtime`. I specified the `python3` kernel and checked the new environment path in the Notebook output.

The reconstruction test used Python/Jupyter as its representative project. Earlier PyTorch, MLX and local-LLM outputs were preserved, but I did not rerun the complete GPU experiments in fresh environments.

## 5. Preserving Source and Results

I archived the three research projects' source and execution conditions under `~/Research/Backups/workstation-sources/2026-10-05`. The archives exclude virtual environments, caches, model weights and generated results. I compared each archived file with its source byte for byte and recorded the archives' SHA-256 hashes in a separate manifest.

For model weights, I recorded the repository, revision and file hashes rather than including the large binaries in the source archive. These records help identify the files, but do not provide long-term preservation if the provider later stops serving them.

I copied the earlier Python, GPU and LLM results and the new Python reconstruction outputs into `~/Research/Experiments/workstation-verification/2026-10-05`. Copies of JSON, logs, tables, figures and executed Notebooks were compared with their originals. Initial failures and incorrect model citations were retained.

These copies are still in Research on the same Mac. Verifying that another location holds them requires checking cloud contents separately. Because synchronisation can propagate changes and deletion, I distinguished dated copies and previous-version checks from the application's sync indicator.

## 6. Cloud Contents and Previous-Version Recovery

The test file is `~/Research/Experiments/workstation-verification/workstation-sync-recovery-check.txt`. Its first contents included `Revision: 1` and `Expected value: 55`, without private or genuine research data.

I inspected the uploaded file on the Google Drive website and downloaded it. Its SHA-256 matched the local original. I then changed the local file to `Revision: 2` and `Expected value: 11.0`, and confirmed that Drive's version manager listed the current and earlier versions separately.

The version manager required **Keep forever** before downloading the earlier version. I applied it to the 93-byte test revision. [Google's file-version guidance](https://support.google.com/drive/answer/2409045) describes automatic removal of older versions and the option to retain them. Checking the actual version list established the preservation state for this file.

I downloaded version 1 from the version manager and saved the 93-byte file, whose SHA-256 matched the initial record. I restored the local test file from that download and verified `Revision: 1`, `Expected value: 55` and the original hash.

This check concerns synchronisation and recovery of earlier contents for one test file. It does not establish recovery of every document, restoration after losing account access or full-system recovery.

## 7. From Design to the Working Configuration

The original separation between code and research material remains. In practice I used computer-folder synchronisation for Research instead of retaining whole-My-Drive mirroring. Code and virtual environments stay outside cloud file synchronisation, with selected results preserved as separate copies.

The MacBook supports research recording while travelling, code editing, Python/Jupyter and GPU or local-model experiments suitable for Apple Silicon. I record it separately from the Windows research workstation's GPU environment. The PC previously used to manage the website is also distinct from that Windows research role. These seven Notes contain no measured comparison claiming that one computer is faster.

The series established a path from website maintenance to small research executions, together with their records. I separated environments that can be recreated from data requiring preservation, and retained limitations such as unreliable local-model citations. Future research will add tools according to the material and experiment size, while preserving outputs alongside their execution conditions.
