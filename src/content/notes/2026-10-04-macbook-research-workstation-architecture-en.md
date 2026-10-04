---
title: "Designing a MacBook Research Workstation"
description: "A MacBook research environment planned around website management, Python, Apple Silicon AI and cloud storage, drawing on my Windows setup experience."
lang: en
translationKey: macbook-research-workstation-architecture
pubDatetime: 2026-10-04T17:05:00+09:00
tags:
  - research-journey
  - macos
  - workstation
  - development
  - ai
  - local-llm
featured: false
draft: false
---

Following the Chuseok holiday, I intend to use this holiday break to continue organising my research environment. The experience recorded while preparing the Windows research workstation gives me a starting point for planning the research and development environment on my MacBook.

In “Designing a Windows Research Workstation Architecture for a Corporate Security Environment”, I considered the roles of a personal Apple environment and a Windows laptop intended for corporate use. I subsequently configured development and GPU environments on Windows and WSL2, tested research tools with the network disconnected, and rebuilt parts of the environment from preserved assets. Follow-up work, including adaptation and validation under actual corporate security controls, remains unfinished.

For the MacBook, I will work on the assumption that internet and cloud access are available. I plan to build an environment for managing the website, reading papers and research material, and running Python and Apple Silicon AI experiments. This Note records the roles, storage decisions and implementation sequence before setup begins. Later Notes will document the actual configuration and execution results.

## 1. The Roles of the Two Environments

The target laptop is a 14-inch MacBook Pro with an M5 Pro and 24GB of unified memory. At the start of setup, I will record the macOS version, existing development tools and available storage as the initial baseline.

| Environment                  | Primary intended use                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Windows research workstation | CUDA research, Windows and WSL development, adaptation to corporate security controls and restricted networks |
| MacBook research workstation | Portable development, website management, papers and research material, Apple Silicon AI experiments          |

I will retain the complementary roles considered in the original Windows design. Where a project is used on both systems, I intend to share the code and configuration needed for the research while configuring the execution environment for each laptop.

I will judge their suitability through the work I actually need to perform. Tasks requiring NVIDIA CUDA will start on Windows; experiments with Apple Silicon execution and unified memory will start on the Mac. I will also record which environment is more convenient for development and research material as I use them.

## 2. What the Windows Setup Taught Me to Check

There was still much to check after installing the Windows tools. Execution paths, the Python selected by a project and the kernel selected in Jupyter all affected how the work ran. GPU discovery and successful computation also needed separate checks.

In “Validating the Offline Research Environment”, a llama.cpp bundle that passed `git bundle verify` failed to restore into an independent repository. After replacing it, I checked cloning into a separate location, the expected commit and repository integrity. That experience showed why preserving a file or producing an inventory was insufficient evidence that it could be used again.

On the Mac, I will check versions and execution paths alongside actual project work. Python will be checked in scripts and notebooks, AI through device checks and computation, and the website through both local builds and public deployment. I will also distinguish work repeated after a reboot from work repeated in a newly created project environment.

I intend to retain commands and output while doing the work. When compiling the separate Windows command Notes, I had to recover some original commands and options later. This time, I will preserve important commands, errors, reasons for changes and results together as evidence for the implementation record.

## 3. Starting from the Existing Environment

I will inspect the MacBook's current state before adding or changing components. This includes macOS updates, FileVault status, login and background items, cloud usage and existing development tools. I will assess the role of applications and settings already in use before deciding what to retain.

A reset or a broad cleanup will not be the starting procedure. Where a configuration obstructs the work or is unnecessary, I will adjust it and record the reason. I also intend to retain the default internal SSD configuration without adding a research partition.

Folders and management practices will define the storage roles. Code and execution environments will live in local development directories; material and results to retain will go to cloud storage. I will choose the actual paths after inspecting the current file structure. Finder, power and battery settings will be reviewed according to portable use and the work I expect to do.

## 4. Securing the Website Workflow First

The first goal is to carry out the complete **SecurityOn Research Journey** workflow on the MacBook. I want to edit, check and publish Notes without depending on the Windows PC currently used to manage the website.

I will first configure Git and GitHub authentication, **Visual Studio Code**, Node.js, pnpm and the project dependencies. Any shared tools needed, such as Xcode Command Line Tools and **Homebrew**, will be set up at this stage and reused for the Python environment later.

I will choose Node.js and pnpm after checking the repository requirements and CI configuration. Astro and the other dependencies will be installed on the Mac using the project's lockfile. Git working directories will remain outside Google Drive and iCloud Drive sync locations.

The workflow to check is:

```text
Edit the website
    → Check locally
    → lint · format:check · build
    → Preview the built output
    → commit · push
    → Confirm public deployment
```

I will also check Korean and English Notes, language switching, search, fonts and dynamically generated OG images. A completed local build and the corresponding change appearing on the public site will be recorded separately. This stage will be complete when I have checked the deployment route, authentication and required configuration, then carried out one publication cycle from the Mac.

## 5. Preserving Material and Rebuilding Tools

For Windows, I collected installers, packages and models in advance because network access might later be restricted. On the MacBook, downloading tools and public assets when needed will be the default route.

Preservation will centre on research material and the work I produce. I plan to keep papers, study material, manuscripts and experimental results in **Google Drive**, and manage website and research code through **GitHub**. iCloud will handle the Apple ecosystem data I choose to sync.

| Item                                              | Management approach                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| Website and research code                         | Work locally, then commit and push to GitHub                            |
| Papers, study material and manuscripts            | Store in Google Drive and confirm upload completion                     |
| Experimental results and data I produce           | Preserve in Google Drive with the settings and logs for each experiment |
| Applications, development tools and public models | Obtain again when needed; record configuration and sources              |
| Development environment                           | Keep a Brewfile, project lockfiles and necessary settings               |
| Apple ecosystem data                              | Use the required iCloud sync options                                    |

Experiments may write output locally, but I will preserve the results I need in Google Drive and confirm their upload when finishing the work. I will also commit and push code in meaningful increments so that changes do not remain solely in the local working directory. Important results will be separated by date and experiment rather than repeatedly overwriting earlier records.

Public models and the results I produce need different treatment. Trained weights and processed data will be retained as outputs, while public models will be identified by name, revision, format and settings. These records should make it clear which assets were used when repeating an experiment.

I have decided to leave Time Machine and full Mac restoration tests outside the required scope of this setup. Instead, I will document enough of the tool inventory and project files to restart research work. Towards the end, I will clone a representative project into a separate location and run it in a fresh virtual environment to check for missing settings or path dependencies.

## 6. From Python to Apple Silicon AI

Once the website workflow is available, I will configure uv, project-specific Python environments and Jupyter. I will check that the interpreter selected in the terminal and editor, and the actual notebook kernel, use the intended environment. The Python version will be chosen after reviewing support for the frameworks I plan to use.

For AI computation, I am considering small, separate projects to check PyTorch's MPS path and MLX. Device discovery will be followed by computation and result checks, with precision, input size, versions and limitations recorded. Success on one path will remain specific to that environment.

The local LLM candidates are **Ollama**, llama.cpp with Metal, MLX-LM and Hugging Face Transformers. I will first establish one basic path for the work I need, adding alternatives when direct control over inference settings or comparison between execution methods becomes useful. Installing every candidate will not be a completion requirement.

I also intend to observe which models and tasks can run with 24GB of unified memory under actual usage conditions. Model format and quantisation, context length, generation settings, power conditions and measurement methods will provide the basis for interpreting the results. Memory capacity alone will not establish a comparison with the Windows laptop's 8GB of VRAM, and generation speeds from different models will not be used to rank the laptops.

Once the environment is ready, I will consider search and question answering over a small document collection as the first research workflow. I intend to begin with a scope in which document processing, embeddings, retrieval results and the evidence behind answers can be checked in sequence. Specific tools and models will be chosen during setup; broader research questions and evaluation will follow in later records.

## 7. Implementation and the Note Sequence

The planned Note sequence is below. This first entry records the design; the scope and order of later entries will follow the actual work.

| Order | Note topic                                            | Record to retain                                                              |
| ----- | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1     | Designing a MacBook research workstation              | This Note: roles, management principles and setup order                       |
| 2     | Establishing the macOS and research material baseline | Existing state, actual changes and storage practices                          |
| 3     | Managing Research Journey from the MacBook            | The workflow from development tool setup to publication                       |
| 4     | Building the Python and Jupyter environment           | Project environments, editor and kernel configuration, execution after reboot |
| 5     | Validating Apple Silicon AI                           | MPS and MLX computation and observed limitations                              |
| 6     | Local LLMs and research work                          | Runtime selection, model execution and a representative task                  |
| 7     | The MacBook research environment as built             | Design changes, project reconstruction and the roles of both laptops          |

The number of Notes is provisional. Short tasks may be combined, while significant problems may warrant their own record. I will organise commands and results at the end of each stage. The final Note will revisit how the implementation differed from the initial plan, what was verified and what remains unfinished.

During this holiday break, I intend to begin by inspecting the MacBook's current state and configuring what is needed for website management. The checking practices learnt from Windows will help me build a research environment that I can use, one stage at a time.
