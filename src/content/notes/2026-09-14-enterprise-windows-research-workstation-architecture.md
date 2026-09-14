---
title: "기업 보안 환경에서의 윈도우 연구 워크스테이션 아키텍처 설계"
description: "개인 Apple 연구환경과 기업 보안 통제하의 Windows 환경을 함께 활용하기 위해 Windows Native, 선택적 WSL2, CUDA·Local LLM, 기업 네트워크 적응, Offline-ready 자산을 포함한 연구 워크스테이션 아키텍처를 설계합니다."
lang: ko
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

새로운 Windows 노트북을 준비하면서 프로그램을 하나씩 설치하기 전에 먼저 해야 할 일이 있다고 생각했습니다.

이 장비는 일반적인 개인 개발 PC와 사용 환경이 다릅니다. 회사에서 사용하기 때문에 Proxy, 방화벽, SSL/TLS Inspection, EDR, DLP, Application Control 등 다양한 보안 통제의 영향을 받을 수 있습니다. WSL2나 Hyper-V와 같은 가상화 기능 역시 언제나 사용할 수 있다고 가정하기 어렵습니다.

동시에 이 장비는 회사 업무뿐 아니라 대학원 공부와 AI·보안 연구에도 적극적으로 사용할 예정입니다.

따라서 이번에는 단순히 개발도구를 설치하는 것부터 시작하지 않고, **기업 보안 환경에서도 연구를 지속할 수 있는 Windows 연구 워크스테이션의 전체 아키텍처부터 설계**하기로 했습니다.

이 글에서는 실제 설치 명령보다는 환경의 역할, 제약, 설계 원칙과 구축 순서를 먼저 정리합니다.

## 시리즈 로드맵

이번 작업은 하나의 긴 설치 기록이 아니라 실제 구축 순서에 맞춰 여러 개의 노트로 나누어 기록할 예정입니다.

### Architecture & Design

1. **기업 보안 환경에서의 윈도우 연구 워크스테이션 아키텍처 설계**<br />
   현재 글

### Phase 1 — Pre-deployment Preparation

회사 환경에 들어가기 전에, 인터넷을 비교적 자유롭게 사용할 수 있는 환경에서 가능한 준비를 최대한 완료합니다.

2. **Windows 기본 연구환경 구축과 WSL2 사전 점검**<br />
   게시 예정

3. **RTX 5060 CUDA·PyTorch와 Local LLM 연구환경 구축**<br />
   게시 예정

4. **Offline-ready Research Assets와 복구 체계 구축**<br />
   게시 예정

### Phase 2 — Enterprise Environment Adaptation & Validation

회사 필수 보안 프로그램과 실제 기업 네트워크 정책이 적용된 이후, 사전에 준비한 환경이 어떻게 달라지는지 확인하고 필요한 적응 작업을 진행합니다.

5. **필수 보안 프로그램 적용 후 연구환경 영향 점검**<br />
   게시 예정

6. **기업 네트워크 적응: Proxy·CA·SSL/TLS Inspection과 개발도구 설정**<br />
   게시 예정

7. **기업 보안 통제 환경에서 End-to-End AI 연구환경 검증**<br />
   게시 예정

실제 구축 과정에서 새로운 제약이나 요구사항이 발견되면 이 로드맵 역시 조정할 예정입니다.

## 1. 하나가 아닌 두 개의 연구환경

현재 사용하는 주요 연구 장비는 크게 두 개입니다.

개인 연구환경은 다음의 MacBook입니다.

- MacBook Pro 14"
- Apple M5 Pro
- CPU 15-core
- GPU 16-core
- Unified Memory 24GB
- SSD 1TB

기업 환경에서 사용할 Windows 연구 워크스테이션은 다음과 같습니다.

- Intel Core Ultra 7 356H
- RAM 32GB
- NVIDIA GeForce RTX 5060 Laptop GPU
- VRAM 8GB GDDR7
- SSD 1TB
- Windows 11

두 장비 모두 개발과 AI 실험에 충분히 활용할 수 있지만, 실제 사용 환경의 성격은 상당히 다릅니다.

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

MacBook은 비교적 자유로운 **Personal Research Environment**, Windows 시스템은 기업의 보안 통제를 받는 **Enterprise Research Environment**로 정의했습니다.

어느 한쪽으로 모든 연구를 통합하는 것이 목적은 아닙니다.

MacBook은 자유로운 탐색, 자료 수집, 클라우드 활용과 Apple Silicon 기반 실험을 담당하고, Windows 시스템은 NVIDIA CUDA 기반 연구와 기업 보안 환경에서의 연구 지속성을 담당합니다.

두 환경을 서로 대체하기보다 상호보완적으로 활용하는 것이 전체 연구환경의 기본 방향입니다.

## 2. 문제는 완전한 오프라인 환경이 아니다

처음에는 Windows 장비를 단순한 '오프라인 AI 워크스테이션'으로 생각했습니다.

하지만 실제 기업 환경은 완전히 인터넷과 분리된 Air-Gapped 환경과는 다릅니다.

인터넷 연결 자체는 존재하더라도 Proxy, 방화벽, SSL/TLS Inspection, URL Filtering, Allowlist 등의 정책에 따라 접근 가능한 서비스와 통신 방식이 달라질 수 있습니다.

예를 들어 다음과 같은 상황이 가능합니다.

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

브라우저에서 웹사이트가 열린다고 해서 Python이나 Git 역시 동일하게 외부 서비스에 접근할 수 있다고 볼 수는 없습니다.

실행환경 역시 마찬가지입니다. 회사 필수 보안 프로그램이나 정책에 따라 다음과 같은 기능이 영향을 받을 가능성이 있습니다.

```text
WSL2
Hyper-V
Docker
Virtual Network Adapter
Local Server Process
특정 개발도구
특정 Driver
```

따라서 이번 시스템의 목표는 다음과 같이 정의했습니다.

> 인터넷이 전혀 없어도 사용할 수 있는 PC를 만드는 것이 아니라, 기업 보안정책에 의해 일부 네트워크 또는 실행 기능이 제한되더라도 연구를 계속할 수 있는 PC를 만든다.

즉 완전한 Offline 환경보다는 **Restricted-network resilience**와 **Offline readiness**를 확보하는 것이 핵심입니다.

## 3. 설계 원칙

이 목표를 위해 몇 가지 기본 원칙을 정했습니다.

### No Single Dependency

특정 기술 하나가 동작하지 않는다고 전체 연구환경을 사용할 수 없게 되어서는 안 됩니다.

WSL2가 대표적인 예입니다. Linux 기반 AI 개발환경을 구성하기에는 매우 유용하지만, 기업 보안 프로그램이 적용된 이후 WSL2나 관련 가상화 기능이 제한될 가능성을 배제할 수 없습니다.

따라서 WSL2를 전체 연구환경의 필수 전제로 두지 않습니다.

### Windows Native Baseline

핵심 연구 기능은 Windows Native 환경에서도 사용할 수 있도록 합니다.

최소한 다음 기능은 Windows 자체에서 동작하는 것을 목표로 합니다.

- Python
- PyTorch
- NVIDIA CUDA
- VS Code
- Ollama
- llama.cpp
- Hugging Face Transformers
- Embedding
- RAG

Windows Native 환경은 WSL2를 사용할 수 없는 상황에서도 연구를 지속할 수 있는 기본 경로입니다.

### WSL2 Optional / Preferred

WSL2를 정상적으로 사용할 수 있다면 Linux 기반 연구환경을 추가합니다.

```text
Scenario A
WSL2 사용 가능
→ Windows Native + WSL2 병행

Scenario B
WSL2 사용 불가
→ Windows Native 환경으로 연구 지속

Scenario C
연구상 WSL2가 반드시 필요
→ 정식 정책 예외 검토
```

중요한 것은 보안기능을 우회하는 것이 아니라 승인된 환경 안에서 연구 가능한 방법을 찾는 것입니다.

### Offline-ready

필요한 패키지나 모델 하나를 다운로드하지 못해 연구가 중단되는 상황을 줄입니다.

설치된 환경뿐 아니라 설치파일, Python package, 모델, 개발도구 확장, 문서, Repository 등의 자산도 함께 준비합니다.

### Policy-compliant

Proxy나 SSL/TLS 문제를 해결하기 위해 보안기능을 비활성화하는 것을 기본적인 해결방법으로 사용하지 않습니다.

예를 들어 다음과 같은 설정은 정상적인 해결방법으로 사용하지 않을 계획입니다.

```text
verify=False

GIT_SSL_NO_VERIFY=true

NODE_TLS_REJECT_UNAUTHORIZED=0
```

가능한 경우 기업에서 승인한 인증서, Proxy, Allowlist, 내부 Repository 또는 정식 정책 예외를 이용합니다.

### Reproducible & Recoverable

환경을 한 번 설치하는 것으로 끝내지 않습니다.

사용한 버전, 명령어, 설정, 오류와 해결방법을 기록하고, 환경이 손상되었을 때 다시 구축하거나 복구할 수 있는 방법까지 준비합니다.

## 4. Windows 연구 워크스테이션 아키텍처

현재 계획한 논리 구조는 다음과 같습니다.

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

이 구조의 핵심은 하나의 실행 경로에만 의존하지 않는 것입니다.

Windows Native를 기본 경로로 확보하고, WSL2가 허용되는 경우 Linux 기반 연구환경을 추가합니다.

## 5. 기업 네트워크 적응 계층

일반적인 개인 개발환경과 기업 연구환경의 가장 큰 차이 중 하나는 네트워크입니다.

운영체제 수준에서는 인터넷 연결이 가능하더라도 각 개발도구가 Proxy와 인증서를 처리하는 방식에 따라 실제 동작 여부가 달라질 수 있습니다.

따라서 연구 애플리케이션과 기업 네트워크 사이에 하나의 논리적인 적응 계층을 두기로 했습니다.

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

여기에서 특정 기업의 Proxy 주소나 내부 인증서 자체를 기록하려는 것은 아닙니다.

대신 일반적인 기업환경에서 연구·개발도구를 정상적으로 사용하는 데 필요한 원리와 설정 방식을 정리할 예정입니다.

## 6. SSL/TLS Inspection과 동적 인증서까지 고려하기

SSL/TLS Inspection이 적용된 환경에서는 HTTPS 연결이 기업 Proxy를 통해 중계될 수 있습니다.

이 경우 브라우저에서는 정상적으로 동작하지만 일부 개발도구에서는 인증서 검증이나 TLS 정책 차이로 문제가 발생할 수 있습니다.

예를 들어 다음과 같은 오류가 나타날 수 있습니다.

```text
CERTIFICATE_VERIFY_FAILED

unable to get local issuer certificate

self signed certificate in certificate chain
```

먼저 확인해야 할 것은 기업 Root CA와 Intermediate CA에 대한 신뢰 여부입니다.

하지만 인증서 신뢰 문제와 인증서 자체의 암호학적 조건은 서로 다른 문제입니다.

이번 환경에서는 SSL/TLS Inspection Proxy가 동적으로 생성하는 인증서가 **RSA 1024-bit key**를 사용하는 상황도 사전에 고려합니다.

```text
Case 1
인증서의 Issuer를 신뢰하지 못함
→ CA Trust 문제

Case 2
인증서 Chain은 신뢰하지만
Key Strength가 Client의 보안정책을 만족하지 못함
→ Cryptographic Policy 문제
```

두 번째 경우에는 기업 CA를 정상적으로 설치하더라도 사용하는 TLS stack과 보안정책에 따라 연결이 실패할 수 있습니다.

따라서 실제 기업환경에서는 다음 도구들을 각각 검증할 예정입니다.

- Windows / Schannel
- Web Browser
- Git
- Python
- pip
- curl
- Node.js
- Hugging Face 관련 도구

문제가 발생했을 때 SSL Verification 자체를 비활성화하는 것을 우선 해결책으로 사용하지 않습니다.

가능하다면 Proxy/PKI 측의 적절한 인증서 정책, Allowlist, SSL/TLS Inspection 예외 또는 정식 정책 예외와 같은 방법을 검토합니다.

이 문제의 실제 분석과 설정 과정은 회사 네트워크에 연결한 이후 별도의 노트에서 자세히 다룰 예정입니다.

## 7. Local AI 연구환경

Windows 장비에는 NVIDIA GeForce RTX 5060 Laptop GPU 8GB가 탑재되어 있습니다.

따라서 이 시스템에서는 NVIDIA CUDA 생태계를 중심으로 로컬 AI 연구환경을 구성할 예정입니다.

Local LLM 역시 하나의 실행도구에 종속시키지 않습니다.

```text
Ollama
│
└─ 빠른 Local LLM 실행 및 Local API

llama.cpp
│
└─ GGUF / Quantization / Inference 실험

Hugging Face Transformers
│
└─ 모델 직접 제어 / PyTorch / 연구 및 평가
```

향후 다음과 같은 연구 시나리오를 고려합니다.

- Local LLM inference
- PyTorch GPU computation
- NLP classification
- Embedding
- Reranking
- RAG
- Quantized model 비교
- LoRA / QLoRA
- Local document analysis
- Speech model
- Vision-Language model

RTX 5060 Laptop GPU의 8GB VRAM을 고려하면 초대형 모델을 직접 학습시키는 것이 목표는 아닙니다.

대신 SLM, 양자화된 3B~8B급 모델, Embedding, RAG, 분류 및 경량 Fine-tuning 등 실제 연구에서 활용 가능한 범위에 집중하려 합니다.

## 8. Offline-ready Research Assets

기업 네트워크에서 어떤 서비스가 제한될지는 실제 환경에 들어가기 전까지 완전히 알기 어렵습니다.

따라서 프로그램만 설치하는 것이 아니라 필요한 연구자산도 사전에 준비합니다.

현재 생각하는 구조는 다음과 같습니다.

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

중요한 것은 현재 환경에서 동작하는 파일만 보관하는 것이 아닙니다.

새로운 개발환경을 만들거나 기존 환경이 손상되었을 때 **외부 네트워크에 대한 의존도를 최소화하면서 재구축할 수 있는 자료**를 함께 준비합니다.

## 9. 실제 구축 순서

설계를 실제 작업 순서와 연결하면 다음과 같습니다.

### Phase 1 — Pre-deployment Preparation

먼저 회사 환경에 들어가기 전에 가능한 작업을 최대한 완료합니다.

```text
Windows Native Environment
        ↓
WSL2 사전 점검
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

이 단계에서는 인터넷을 자유롭게 사용할 수 있다는 장점을 적극적으로 활용합니다.

### Phase 2 — Enterprise Environment Adaptation & Validation

그 이후 실제 회사 보안환경으로 들어갑니다.

```text
Corporate Security Software
        ↓
실행환경 변화 확인
        ↓
Corporate Network
        ↓
Proxy / CA / SSL/TLS Inspection
        ↓
도구별 연결 검증
        ↓
필요한 정책 적응
        ↓
End-to-End Validation
```

즉 회사 안에 들어가서 필요한 구성요소를 하나씩 다운로드하려는 것이 아니라, **외부에서 최대한 완성된 환경을 만든 뒤 실제 보안 통제에 적응시키는 방식**입니다.

## 10. 성공 조건

최종적으로는 실제 기업 보안 프로그램과 네트워크 정책이 적용된 상태에서도 다음 연구 흐름이 유지되는 것을 목표로 합니다.

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

Windows Native 경로는 핵심 연구기능을 제공하는 기본 경로로 확보합니다.

WSL2를 사용할 수 있다면 Linux 기반 연구환경을 추가해 선택 가능한 연구 경로를 늘립니다.

외부 네트워크 접근이 제한되더라도 미리 준비한 Offline-ready Assets을 이용해 상당 부분의 연구를 지속할 수 있어야 합니다.

## 11. 기록과 공개의 원칙

이 시리즈에서는 성공한 설치 명령만 기록하지 않을 생각입니다.

왜 특정 기술을 선택했는지, 어떤 대안을 검토했는지, 실제로 어떤 문제가 발생했는지, 그리고 그것을 어떻게 해결했는지까지 함께 남기려고 합니다.

특히 기업 보안환경과 관련된 내용은 **특정 조직의 내부정보를 공개하지 않는 범위에서 일반화하여 기록**합니다.

실제 Proxy 주소, 내부 IP, 사내 도메인, 내부 CA 파일, 내부 Repository 주소, EDR/DLP 정책 상세, Allowlist 규칙이나 정책예외 세부내용 등 특정 조직의 보안구조를 추론하는 데 이용될 수 있는 정보는 공개하지 않습니다.

MacBook과 회사 Windows 환경 사이에서 자료를 이동해야 하는 경우 역시 승인된 저장소와 허용된 경로만 사용합니다.

이 시리즈의 목적은 특정 기업의 보안환경을 설명하는 것이 아닙니다.

**보안 통제가 존재하는 일반적인 기업환경에서 연구 워크스테이션을 구축하고 운영하면서 얻은 경험과 기술적 판단을 기록하는 것**이 목적입니다.

아직 실제 구축은 시작하지 않았습니다.

이번 글에서는 앞으로 만들 연구환경의 구조와 원칙을 먼저 정의했습니다.

다음 단계에서는 회사 환경에 들어가기 전에 Windows Native 개발·연구환경을 구성하고, WSL2를 사용할 수 있는 기본 조건도 함께 확인할 예정입니다.
