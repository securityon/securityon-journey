---
title: "Designing a Windows Research Workstation Architecture for a Corporate Security Environment"
description: "A design for a Windows research workstation combining a Windows-native baseline, optional WSL2, CUDA and local LLM tooling, enterprise network adaptation, and offline-ready assets alongside a personal Apple research environment."
lang: en
translationKey: enterprise-windows-research-workstation-architecture
pubDatetime: 2026-09-14T18:30:00+09:00
tags:
  - research-journey
  - windows
  - ai
  - security
  - local-llm
  - workstation
featured: false
draft: false
---

Before installing development tools on a new Windows laptop, I decided that there was something more important to do first: design the environment itself.

This machine will not operate like an ordinary personal development PC. It will be used in a corporate environment where network access and local execution may be affected by controls such as proxies, firewalls, SSL/TLS inspection, EDR, DLP, and application control. Features such as WSL2 and Hyper-V also cannot be assumed to remain available under every security policy.

At the same time, I intend to use this machine extensively for graduate study and AI and security research.

Instead of starting with individual software installations, I therefore decided to first design a **Windows research workstation architecture that can remain useful under corporate security constraints**.

This first note focuses on roles, constraints, design principles, and the implementation sequence rather than detailed installation commands.

## Series Roadmap

Rather than writing one very long setup guide, I plan to document the project as a series that follows the actual implementation sequence.

### Architecture & Design

1. **Designing a Windows Research Workstation Architecture for a Corporate Security Environment**<br />
   Current note

### Phase 1 — Pre-deployment Preparation

Before moving the machine into the corporate environment, I will prepare as much as possible while comparatively unrestricted Internet access is still available.

2. **Building the Windows Research Baseline and Pre-checking WSL2**<br />
   Planned

3. **Building the RTX 5060 CUDA, PyTorch, and Local LLM Environment**<br />
   Planned

4. **Building Offline-ready Research Assets and Recovery Capability**<br />
   Planned

### Phase 2 — Enterprise Environment Adaptation & Validation

After mandatory corporate security software and network policies are applied, I will examine what changes and adapt the environment accordingly.

5. **Assessing the Impact of Mandatory Corporate Security Software**<br />
   Planned

6. **Adapting Development Tools to Corporate Proxy, CA, and SSL/TLS Inspection**<br />
   Planned

7. **End-to-End Validation under Corporate Security Controls**<br />
   Planned

The roadmap may change as new constraints and requirements emerge during implementation.

## 1. Two Research Environments, Not One

My research environment consists primarily of two systems.

The personal environment is a MacBook with the following specifications:

- MacBook Pro 14"
- Apple M5 Pro
- 15-core CPU
- 16-core GPU
- 24GB unified memory
- 1TB SSD

The Windows workstation intended for the corporate environment has:

- Intel Core Ultra 7 356H
- 32GB RAM
- NVIDIA GeForce RTX 5060 Laptop GPU
- 8GB GDDR7 VRAM
- 1TB SSD
- Windows 11

Both systems are capable development and AI machines, but they operate under very different constraints.

```text
Research Environment
│
├─ Apple / macOS
│  └─ Personal Research Environment
│     │
│     ├─ Open Internet / Cloud Access
│     ├─ Papers / Technical Research
│     ├─ GitHub / Hugging Face
│     ├─ Cloud AI
│     ├─ Apple Silicon Local AI
│     └─ Development / Research Preparation
│
└─ Windows
   └─ Enterprise Research Environment
      │
      ├─ Security Constraints
      │  ├─ Proxy / Firewall
      │  ├─ SSL/TLS Inspection
      │  └─ EDR / DLP / Application Control
      │
      ├─ Research Stack
      │  ├─ NVIDIA CUDA / PyTorch
      │  ├─ Windows Native AI Stack
      │  ├─ Optional WSL2
      │  └─ Local LLM / RAG
      │
      └─ Resilience
         └─ Offline-ready Research Assets
```

I define the MacBook as a relatively open **Personal Research Environment** and the Windows system as an **Enterprise Research Environment** subject to corporate security controls.

The goal is not to consolidate everything onto one platform.

The MacBook will be used for unrestricted exploration, collecting papers and models, cloud access, and Apple Silicon experiments. The Windows workstation will focus on NVIDIA CUDA workloads and maintaining research capability within the corporate security environment.

The two systems are intended to complement one another.

## 2. This Is Not a Fully Offline Environment

At first, I described the Windows system as an offline AI workstation.

That description is not entirely accurate.

A corporate environment is not necessarily air-gapped. Internet connectivity may exist, while access to individual services and protocols is restricted through proxies, firewalls, SSL/TLS inspection, URL filtering, and allowlist policies.

A realistic situation may look like this:

```text
Browser          OK
GitHub Web       OK
git clone        FAIL
pip install      FAIL
npm install      FAIL
Hugging Face     BLOCKED
curl             TLS ERROR
Python HTTPS     TLS ERROR
```

A website being accessible from a browser does not mean that Git, Python, or other development tools will be able to reach the same service.

Local execution may also be constrained. Corporate security software or policy may affect technologies such as:

```text
WSL2
Hyper-V
Docker
Virtual Network Adapter
Local Server Process
Specific Development Tools
Specific Drivers
```

The goal of this workstation is therefore not simply to operate with no Internet connection.

> The goal is to continue supporting research even when some network paths or execution capabilities are restricted by corporate security policy.

The key design goals are therefore **restricted-network resilience** and **offline readiness**.

## 3. Design Principles

Several principles guide the architecture.

### No Single Dependency

The entire research environment should not fail because one technology becomes unavailable.

WSL2 is a good example. It is highly useful for Linux-oriented AI development, but I cannot assume that WSL2 and its related virtualisation features will remain available after corporate security controls are applied.

WSL2 is therefore not a mandatory dependency.

### Windows-native Baseline

Core research capabilities should remain available directly on Windows.

At minimum, I want the Windows-native environment to support:

- Python
- PyTorch
- NVIDIA CUDA
- VS Code
- Ollama
- llama.cpp
- Hugging Face Transformers
- Embeddings
- RAG

The Windows-native stack is the baseline that allows research to continue even if WSL2 is unavailable.

### WSL2 Optional / Preferred

If WSL2 remains available, I will add a Linux-based research environment.

```text
Scenario A
WSL2 available
→ Windows Native + WSL2

Scenario B
WSL2 unavailable
→ Continue with the Windows-native stack

Scenario C
WSL2 required for a specific research task
→ Consider a formal policy exception
```

The goal is not to bypass security controls, but to find an approved way to conduct research within them.

### Offline-ready

A single unavailable package or model should not stop research.

Installers, Python packages, models, development extensions, documentation, and source repositories will therefore be prepared in advance where appropriate.

### Policy-compliant

Disabling security controls will not be treated as the default solution to proxy or TLS problems.

For example, I do not intend to use settings such as the following as normal fixes:

```text
verify=False

GIT_SSL_NO_VERIFY=true

NODE_TLS_REJECT_UNAUTHORIZED=0
```

Whenever possible, the environment should use approved enterprise certificates, proxy configuration, allowlists, internal repositories, or formally approved exceptions.

### Reproducible & Recoverable

The environment should be documented well enough to rebuild.

Versions, commands, configuration changes, failures, and solutions will be recorded, and recovery assets will be maintained so that the environment can be restored when necessary.

## 4. Windows Research Workstation Architecture

The planned logical architecture is:

```text
Windows 11
│
├─ Windows Native Research Stack
│  │
│  ├─ VS Code
│  ├─ Git
│  ├─ Python / uv
│  ├─ Jupyter
│  ├─ PyTorch
│  ├─ NVIDIA CUDA
│  ├─ Ollama
│  ├─ llama.cpp
│  └─ Transformers / RAG / ML
│
├─ Optional WSL2 Research Stack
│  │
│  ├─ Ubuntu
│  ├─ Python / uv
│  ├─ PyTorch / CUDA
│  ├─ Transformers
│  ├─ llama.cpp
│  └─ Linux-based Research Tools
│
├─ Enterprise Network Adaptation
│  │
│  ├─ HTTP_PROXY
│  ├─ HTTPS_PROXY
│  ├─ NO_PROXY
│  ├─ Enterprise Root CA
│  ├─ Intermediate CA
│  ├─ SSL/TLS Inspection
│  ├─ Allowlist
│  └─ Internal Repository / Mirror
│
└─ Offline-ready Research Assets
   │
   ├─ installers
   ├─ wheelhouse
   ├─ models
   ├─ datasets
   ├─ vscode-extensions
   ├─ repos
   ├─ docs
   └─ backups
```

The important point is that the architecture does not rely on a single execution path.

Windows Native remains the baseline, while WSL2 adds a Linux-oriented research path when permitted.

## 5. Enterprise Network Adaptation

One of the major differences between a personal development environment and a corporate research environment is networking.

Even when Windows itself has Internet access, individual development tools may behave differently depending on how they handle proxies and certificate stores.

I therefore treat enterprise network adaptation as a separate logical layer.

```text
Research Applications
│
├─ Git
├─ Python / pip
├─ Node / npm
├─ VS Code
├─ Hugging Face
└─ Other Research Tools
         │
         ▼
Enterprise Network Adaptation
│
├─ HTTP / HTTPS Proxy
├─ NO_PROXY
├─ Enterprise Root CA
├─ Intermediate CA
├─ SSL/TLS Inspection
├─ Allowlist
└─ Internal Package Mirror
         │
         ▼
Corporate Network
```

The purpose is not to document any particular organisation's internal proxy or certificate infrastructure.

Instead, I intend to document general techniques for making common development and research tools work correctly in enterprise environments.

## 6. Considering SSL/TLS Inspection and Dynamically Issued Certificates

In an environment with SSL/TLS inspection, HTTPS connections may be intercepted and re-established by an enterprise proxy.

A browser may work normally while development tools produce certificate or TLS errors such as:

```text
CERTIFICATE_VERIFY_FAILED

unable to get local issuer certificate

self signed certificate in certificate chain
```

The first issue to examine is trust in the enterprise Root CA and Intermediate CA.

However, certificate trust and cryptographic policy are not the same problem.

I also want the design to account for environments where an SSL/TLS inspection proxy dynamically issues certificates using **1024-bit RSA keys**.

```text
Case 1
The certificate issuer is not trusted
→ CA trust problem

Case 2
The certificate chain is trusted,
but its key strength does not satisfy the client's policy
→ Cryptographic policy problem
```

In the second case, installing the enterprise CA may not be sufficient. Different TLS stacks and security policies may still produce different results.

I therefore plan to validate at least the following separately:

- Windows / Schannel
- Web browsers
- Git
- Python
- pip
- curl
- Node.js
- Hugging Face tooling

Disabling SSL verification will not be the preferred response.

Where possible, the solution should involve appropriate proxy or PKI configuration, stronger certificates, allowlisting, SSL/TLS inspection exceptions, or formally approved policy exceptions.

The practical investigation of these issues will be documented later, after the workstation is connected to the actual corporate network.

## 7. Local AI Research Stack

The Windows workstation includes an NVIDIA GeForce RTX 5060 Laptop GPU with 8GB of VRAM.

The local AI stack will therefore make extensive use of the NVIDIA CUDA ecosystem.

I also do not want the local LLM environment to depend on a single runtime.

```text
Ollama
│
└─ Fast local LLM execution and local APIs

llama.cpp
│
└─ GGUF / Quantisation / Inference experiments

Hugging Face Transformers
│
└─ Direct model control / PyTorch / research and evaluation
```

Possible research scenarios include:

- Local LLM inference
- PyTorch GPU computation
- NLP classification
- Embeddings
- Reranking
- RAG
- Quantised model comparison
- LoRA / QLoRA
- Local document analysis
- Speech models
- Vision-language models

With 8GB of VRAM, the objective is not to train very large models from scratch.

The practical focus will instead be on SLMs, quantised 3B–8B models, embeddings, RAG, classification, and lightweight fine-tuning.

## 8. Offline-ready Research Assets

It is impossible to know in advance exactly which external services will be restricted in the corporate environment.

For that reason, I plan to prepare research assets in addition to the installed software itself.

```text
C:\OfflineLab\
│
├─ installers\
│
├─ wheelhouse\
│  ├─ windows\
│  └─ linux\
│
├─ models\
│  ├─ gguf\
│  ├─ huggingface\
│  ├─ embeddings\
│  └─ speech\
│
├─ datasets\
├─ vscode-extensions\
├─ docker-images\
├─ repos\
├─ docs\
├─ manifests\
└─ backups\
```

The purpose is not simply to archive what currently works.

The repository should contain enough material to recreate important parts of the environment while minimising dependence on external networks.

## 9. Implementation Sequence

The architecture maps to two implementation phases.

### Phase 1 — Pre-deployment Preparation

Before the machine enters the corporate environment:

```text
Windows Native Environment
        ↓
WSL2 Pre-check
        ↓
NVIDIA / CUDA / PyTorch
        ↓
Local LLM
        ↓
Embedding / RAG
        ↓
Offline-ready Assets
        ↓
Backup / Recovery
```

This stage takes advantage of comparatively unrestricted Internet access while it is available.

### Phase 2 — Enterprise Environment Adaptation & Validation

After the machine enters the actual corporate environment:

```text
Corporate Security Software
        ↓
Assess Runtime Changes
        ↓
Corporate Network
        ↓
Proxy / CA / SSL/TLS Inspection
        ↓
Tool-by-tool Connectivity Validation
        ↓
Required Policy Adaptation
        ↓
End-to-End Validation
```

The idea is to avoid entering the corporate environment with a partially prepared system.

Instead, the workstation should be as complete as possible beforehand and then adapted to the real security controls.

## 10. Success Criteria

The final objective is to preserve the following research workflow under the actual enterprise security environment:

```text
VS Code
   ↓
Python
   ↓
PyTorch
   ↓
RTX 5060 / CUDA
   ↓
Local LLM
   ↓
Embedding
   ↓
Local Documents
   ↓
RAG
```

The Windows-native path should provide the baseline research capability.

If WSL2 is available, a Linux-oriented research path will be added as another option.

If external network access becomes restricted, the prepared offline-ready assets should allow a substantial portion of the research workflow to continue.

## 11. Documentation and Disclosure Principles

This series will not document only successful commands.

I also want to record why a technology was selected, which alternatives were considered, what failed, why it failed, and how the problem was resolved.

Corporate security information will be generalised so that no organisation-specific internal details are disclosed.

Actual proxy addresses, internal IP ranges, corporate domains, private CA files, internal repository URLs, detailed EDR or DLP policy, allowlist rules, or exception details will not be published.

Any transfer of research material between the personal MacBook environment and the corporate Windows environment will also be assumed to use approved storage locations and permitted transfer paths.

The purpose of this series is not to describe one company's security architecture.

It is to document the engineering decisions and lessons learned while building a research workstation that can operate effectively **within a generally security-controlled enterprise environment**.

The implementation has not started yet.

This first note defines the architecture and operating principles.

The next step is to build the Windows-native development and research baseline before the machine enters the corporate environment, while also checking the prerequisites for WSL2.
