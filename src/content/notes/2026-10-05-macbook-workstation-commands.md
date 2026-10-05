---
title: "MacBook 연구환경 구축 명령어와 검증 스크립트"
description: "MacBook 구축에 사용한 명령과 검증 소스를 모으고, 실행 위치·예상 결과·보존 범위를 설명하는 참고 기록입니다."
lang: ko
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

MacBook 구축 일곱 편에서는 도구를 선택한 이유와 실행 결과를 단계별로 기록했습니다. 이 글은 그 과정에서 사용한 명령과 검증 스크립트를 다시 찾기 위한 참고 편입니다. 환경 점검부터 홈페이지 관리, Python·Jupyter, GPU 계산과 로컬 LLM까지 실행 위치와 확인할 결과를 함께 모았습니다.

기준은 Apple M5 Pro·메모리 24GB의 MacBook Pro, macOS 26.6.2와 `arm64`입니다. 아래 명령은 구축 당시의 버전과 파일을 기준으로 합니다. 최초 설치 때 새 패키지를 선택하는 작업과 이미 기록된 버전으로 환경을 다시 만드는 작업은 구분했습니다. 모든 단계를 한 번에 실행하는 설치 스크립트로 묶지는 않았습니다.

## 1. 소스 묶음과 실행 전 준비

[검증 소스 묶음 ZIP](/downloads/macbook-verification-sources-2026-10-05.zip)에는 세 테스트 프로젝트의 Python 코드, 실행용 셸 스크립트, `.python-version`, `pyproject.toml`, `uv.lock`을 넣었습니다. Python 노트북은 코드 셀을 유지하고 실행 출력만 비웠습니다. 로컬 LLM에는 공개 노트 발췌문과 모델 파일 목록도 포함했습니다. 가상환경·모델 가중치·캐시·실행 결과·인증 정보는 넣지 않았습니다.

ZIP의 크기는 101,458바이트이며 SHA-256은 다음과 같습니다. 내려받은 파일을 `shasum -a 256`으로 검사하면 같은 값인지 비교할 수 있습니다.

```text
da5ef21999f0241334c14f8d05db07ce474c41587c91c3223f492418e8b6f26b
```

묶음 안의 `manifest.json`에는 프로젝트 파일별 크기와 해시가 있습니다. 파일 내용과 압축 사본의 일치, Python 구문과 셸 구문을 확인했습니다. 묶음에서 Python 프로젝트를 별도 폴더에 풀어 새 가상환경을 만들었습니다. 1부터 5까지의 제곱값을 계산하는 시험이며, 예상 합계 55·평균 11.0과 일치했습니다. 이때 기존 패키지 캐시는 재사용했습니다. GPU 계산과 모델 추론을 새로 실행한 것은 아닙니다. 앞선 글의 실제 실행 결과를 기준으로 설명합니다.

압축을 풀면 `research-python-baseline`, `research-apple-silicon-ai`, `research-local-llm` 폴더가 나옵니다. 기존 작업이 없는 경우에만 이 세 폴더를 `~/Developer` 아래에 두면 뒤의 경로와 맞습니다. 같은 이름의 폴더가 이미 있으면 덮어쓰지 않고 기존 파일과 비교합니다. 셸 스크립트는 `~/.zprofile`을 읽어 uv 경로를 가져오므로 도구 설치와 경로 설정이 먼저 필요합니다.

반복 실행은 같은 이름의 JSON·로그·그림을 덮어쓸 수 있습니다. 남겨야 할 이전 결과는 먼저 `~/Research/Experiments`의 날짜별 폴더에 복사합니다. 세 프로젝트는 환경 확인용 테스트였으며 별도의 GitHub 저장소는 만들지 않았습니다. 다운로드 묶음으로 확인 코드를 함께 남깁니다.

## 2. macOS와 개발도구 점검

Mac의 로그인 터미널에서 다음 명령으로 운영체제와 실행 아키텍처, 저장공간을 확인했습니다.

```sh
sw_vers
uname -m
df -h / /System/Volumes/Data
fdesetup status
xcode-select -p
pkgutil --pkg-info com.apple.pkg.CLTools_Executables
```

`sw_vers`는 macOS 버전과 빌드를, `uname -m`은 이번 환경에서 `arm64`를 표시했습니다. `df`의 루트와 Data 볼륨은 같은 저장공간을 공유하므로 전체·가용 용량을 두 번 더하지 않습니다. FileVault는 초기 점검에서 꺼짐을 확인했고 사용하지 않기로 했습니다. 제한된 실행 환경에서 상태 조회가 실패한 경우에는 켜짐이나 꺼짐으로 해석하지 않았습니다.

초기 하드웨어 점검에는 `system_profiler SPHardwareDataType`을 사용했습니다. 공유할 때 일련번호·UUID·사용자 경로를 가리기 위한 처리가 소스 묶음의 `audit.sh`에 들어 있습니다. 이 파일은 최초 점검에 사용한 명령 모음이며, 오류가 있어도 다음 항목을 계속 출력합니다. 결과 파일이 생겼다는 사실만으로 모든 항목이 확인된 것은 아닙니다. 개발도구가 없는 Mac에서는 일부 명령이 설치 창을 띄울 수 있습니다.

Command Line Tools가 없을 때 실행한 설치 요청은 다음 명령입니다. 설치 창을 완료한 뒤 경로와 실제 명령 실행을 다시 확인했습니다.

```sh
xcode-select --install
xcode-select -p
git --version
clang --version
```

확인된 활성 경로는 `/Library/Developer/CommandLineTools`, Git은 2.50.1, Apple clang은 21.0.0입니다. 설치 요청 메시지만으로 설치 완료라고 판단하지 않았습니다. 시작 상태와 자료 관리 결정은 [macOS와 연구자료의 기준 상태](/notes/ko/macos-research-materials-baseline/)에 정리했습니다.

## 3. GitHub 인증과 홈페이지 관리

이미 등록한 SSH 키를 다시 에이전트에 불러올 때는 다음 명령을 사용했습니다. 키의 암호는 터미널에서 입력하며 공개 기록에 남기지 않습니다.

```sh
/usr/bin/ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

최초에는 이 Mac 전용 Ed25519 키를 만들고 공개키를 GitHub에 등록했습니다. 기존 키를 덮어쓸 수 있는 키 생성 명령은 반복 실행 목록에서 제외했습니다. GitHub 서버 키의 지문을 확인한 뒤 인증을 시험했으며, 계정 인증과 실제 저장소 읽기 권한은 홈페이지 clone으로 나눠 확인했습니다. 커밋 작성자 이름과 이메일은 기존 홈페이지 관리에 쓰던 값으로 설정했습니다.

홈페이지의 작업 위치는 `~/Developer/securityon-journey`입니다. Node.js 24.21.0과 pnpm 11.3.0을 설치했고 Astro·TypeScript·Tailwind CSS·Prettier는 저장소 의존성으로 사용했습니다. 이 구성에는 Homebrew를 설치하지 않았습니다.

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

`pnpm-lock.yaml`은 함께 설치할 패키지의 정확한 버전을 기록한 파일입니다. `--frozen-lockfile`은 설치할 때 이 기록을 바꾸지 않도록 합니다. lint는 코드 규칙을, format 검사는 서식을 확인하며 빌드는 페이지를 생성합니다. 각 명령의 성공 여부는 따로 확인합니다. 마지막 preview 명령은 서버를 계속 실행하므로 다른 명령은 별도 터미널에서 실행하거나 `Control+C`로 서버를 끝낸 뒤 실행합니다. 주소는 `http://127.0.0.1:4321/`입니다.

당시 pnpm은 다음처럼 Node.js의 로컬 도구 폴더에 버전을 지정해 설치했습니다. 이미 같은 버전이 있는 환경에서는 반복 설치할 필요가 없습니다.

```sh
npm install --global pnpm@11.3.0 \
  --prefix "$HOME/Developer/.tools/node" \
  --cache "$HOME/Developer/.tools/npm-cache" \
  --no-audit --no-fund
```

Node.js의 배포 파일·해시 대조, 로컬 설치 경로와 VS Code 구성은 [MacBook에서 홈페이지를 관리하는 환경](/notes/ko/macbook-website-management/)에 남겼습니다. VS Code는 편집기이며 실제 빌드에는 저장소에 설치된 도구가 사용됩니다.

## 4. Python 환경과 Jupyter

uv 0.12.23과 관리형 Python 3.13.16을 설치했습니다. `~/.zprofile`에 기록한 도구 경로와 uv의 저장 위치는 다음과 같습니다. 기존 설정을 지우거나 같은 줄을 반복 추가하지 않고 필요한 항목만 비교합니다.

```sh
export PATH="$HOME/Developer/.tools/bin:$HOME/Developer/.tools/node/bin:$PATH"
export UV_PYTHON_INSTALL_DIR="$HOME/Developer/.tools/uv-python"
export UV_PYTHON_BIN_DIR="$HOME/Developer/.tools/bin"
export UV_CACHE_DIR="$HOME/Developer/.tools/uv-cache"
```

관리형 Python을 처음 준비할 때 실행한 명령은 `uv python install 3.13`입니다. 당시 설치된 3.13.16을 각 프로젝트에 기록했고 시스템 Python은 바꾸지 않았습니다. uv 배포 파일의 확보와 해시 대조는 [Python과 Jupyter 연구환경 구축](/notes/ko/macbook-python-jupyter/)의 설치 기록을 참고합니다.

프로젝트의 `.python-version`은 Python 3.13.16을 선택하고 `uv.lock`은 패키지 버전 조합을 기록합니다. `pyproject.toml`의 `>=3.13.16,<3.14`는 Python 3.13.16 이상이면서 3.14 미만인 범위를 뜻합니다. 소스 묶음에서 환경을 구성할 때는 다시 `uv add`로 버전을 선택하기보다 기록된 파일로 설치합니다.

```sh
cd ~/Developer/research-python-baseline
uv sync --locked
uv run --locked research-python-baseline
```

검증 코드는 1부터 5까지를 제곱해 `1, 4, 9, 16, 25`를 만듭니다. 예상 합계는 55, 평균은 `55 ÷ 5 = 11.0`입니다. 계산이 이 값과 일치하는지, 실행한 Python이 프로젝트의 `.venv`인지, 아키텍처가 `arm64`인지 검사합니다. 통과하면 `results/terminal` 아래에 CSV·PNG·환경 JSON을 남깁니다.

Jupyter 노트북도 같은 계산을 합니다. 명령행에서는 프로젝트 안에 설정·실행 파일 위치를 지정한 뒤 실행했습니다. 다음은 새 환경 재구성 때 사용한 설정과 실행 옵션을 프로젝트 작업 위치 기준으로 모은 형태입니다.

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

VS Code에서는 `.venv/bin/python`을 인터프리터와 노트북 커널로 선택했습니다. 재시동 후 스크립트·VS Code·노트북 실행도 확인했습니다. 묶음의 `verify-python-after-reboot.sh`는 기존 환경과 캐시를 사용해 오프라인 반복 실행을 확인한 스크립트입니다. 환경을 처음 만드는 명령과는 용도가 다릅니다. 자세한 실행 기록은 [Python과 Jupyter 연구환경 구축](/notes/ko/macbook-python-jupyter/)에 있습니다.

## 5. PyTorch·MLX의 GPU 계산과 정밀도

GPU 검증은 Metal에 접근할 수 있는 Mac의 일반 로그인 터미널에서 실행했습니다. 먼저 프로젝트 의존성을 설치합니다.

```sh
cd ~/Developer/research-apple-silicon-ai
uv sync --locked
```

`verify_ai.py`는 PyTorch의 MPS와 MLX의 GPU를 구분해 검사합니다. 작은 행렬 곱의 정답은 `[[19, 22], [43, 50]]`입니다. 이어 같은 입력으로 만든 128×128 행렬 곱을 NumPy의 CPU 기준값과 비교하고, `y = 2x + 1`을 학습해 계수가 2와 1에 가까워지는지 확인합니다.

최초에 사용한 `run-verification.sh`는 PyTorch 뒤에 MLX 기본 설정을 실행합니다. 이번 Mac에서는 MLX 기본 float32 검사에서 오차 기준을 넘겨 중단됐습니다. 따라서 이 파일을 실행하면 두 도구가 모두 성공할 것이라고 기대해서는 안 됩니다. 최종 확인은 PyTorch와 MLX 정밀도 비교를 다음처럼 나눠 읽습니다.

```sh
unset PYTORCH_ENABLE_MPS_FALLBACK
uv run --locked python verify_ai.py torch
/bin/zsh ~/Developer/research-apple-silicon-ai/run-mlx-comparison.sh
```

`PYTORCH_ENABLE_MPS_FALLBACK`을 해제하는 것은 GPU가 처리하지 못하는 연산을 CPU로 조용히 넘기지 않도록 하기 위해서입니다. 비교 스크립트는 기본 설정에서 허용 오차 위반을 기록하는 실행과, `MLX_ENABLE_TF32=0`을 적용한 별도 프로세스를 순서대로 실행합니다. 패키지를 내려받지 않는 `--offline` 옵션을 사용하므로 `uv sync --locked`가 먼저 완료돼 있어야 합니다. JSON은 `results/torch-verification.json`, `mlx-default-verification.json`, `mlx-full-fp32-verification.json`으로 구분됩니다.

float32 비교는 절대·상대 허용 오차 모두 `0.0001`을 사용했습니다. float16은 상대 `0.005`, 절대 `0.02`입니다. 두 값은 작은 반올림 차이를 허용하되 큰 차이는 잡기 위한 이번 입력의 실험 기준이며 모든 연구에 적용할 보증값은 아닙니다. 오차의 뜻과 실제 실패·통과 결과는 [Apple Silicon AI 환경 검증](/notes/ko/macbook-apple-silicon-ai/)에 설명했습니다. 이 검사는 처리 속도 경쟁이나 대형 모델 수용량 측정이 아닙니다.

## 6. 로컬 모델 준비와 답변 검증

로컬 LLM은 MLX-LM 0.32.0과 MLX 0.32.3을 사용했습니다. 소스 묶음의 기록된 의존성을 설치한 뒤 모델을 내려받습니다.

```sh
cd ~/Developer/research-local-llm
uv sync --locked
uv run --locked download_model.py
```

`download_model.py`는 Qwen3-1.7B-MLX-4bit의 특정 리비전 `21457c6f51ed54a7c16e988c0844db973815c137`을 선택합니다. 모델 파일은 약 0.93GB이며 의존성 설치 공간은 별도입니다. 다운로드에는 인터넷 연결이 필요합니다. 파일 크기와 SHA-256을 `model-manifest.json`에 기록하고, 서버 메타데이터에 예상 해시가 있는 두 LFS 파일은 그 값과 대조합니다. 모든 파일의 해시를 독립적으로 검증한 것은 아닙니다.

모델 준비 후 실행한 명령은 다음과 같습니다.

```sh
/bin/zsh ~/Developer/research-local-llm/run-verification.sh
```

스크립트는 로컬 가중치, Hugging Face 오프라인 설정과 `uv --offline`을 사용합니다. 이때 Wi-Fi를 끄고 시험한 것은 아닙니다. `MLX_ENABLE_TF32=0`, 최대 새 토큰 256개, 입력 한도 2,048토큰을 지정했습니다. 원래 모델의 대화 템플릿이 비사고 모드 옵션을 반영하지 않아, 확인한 최종 코드에는 비어 있는 완료된 사고 구간을 입력에 붙였습니다. 내려받은 모델 파일은 수정하지 않았습니다.

짧은 계산 응답과 공개 노트 발췌문 기반 질문을 합해 다섯 사례를 실행했습니다. 결과는 `results/verification.json`과 `results/terminal.log`에 남습니다. `complete: true`는 실행이 끝났다는 표시입니다. 실제 결과에는 맞는 답변 내용과 잘못된 출처 인용이 함께 있었으므로 정답 판정으로 읽으면 안 됩니다. [MacBook의 로컬 LLM과 연구 기록](/notes/ko/macbook-local-llm/)의 비교 결과를 함께 확인합니다.

묶음의 `corpus.json`만으로 같은 발췌문을 사용할 수 있습니다. `prepare_corpus.py`는 홈페이지 저장소의 노트에서 자료를 다시 뽑을 때만 필요하며, 홈페이지가 `~/Developer/securityon-journey`에 있어야 합니다. 검색 순위만 보는 `verify_llm.py --retrieval-only` 경로는 모델 추론과 구분됩니다.

## 7. 재구성과 결과 보존

환경을 다시 만들 때 핵심은 소스·Python 버전·의존성 기록을 남기는 것입니다. 설치된 `.venv`와 캐시는 재생성 대상입니다. 실제 연구자료·원고·실험 결과는 따로 보존합니다.

| 대상            | 남길 내용                                            | 위치와 방법                                    |
| --------------- | ---------------------------------------------------- | ---------------------------------------------- |
| 홈페이지        | 소스, `pnpm-lock.yaml`, Git 이력                     | 로컬 Developer와 기존 GitHub 저장소            |
| 테스트 프로젝트 | 소스, `.python-version`, `pyproject.toml`, `uv.lock` | 소스 묶음과 Research의 날짜별 사본             |
| 로컬 모델       | 모델 저장소·리비전·파일 목록과 해시                  | `model-manifest.json`; 가중치는 묶음에서 제외  |
| 실행 결과       | 로그·JSON·CSV·그림·실행된 노트북                     | `~/Research/Experiments`의 날짜별 사본         |
| 연구자료·원고   | 다시 만들기 어려운 원본과 작업본                     | `~/Research`와 Google Drive 컴퓨터 폴더 동기화 |

Google Drive는 화면에서 로컬 Research 폴더의 동기화를 설정했습니다. 내 드라이브 전체를 미러링하는 설정은 유지하지 않았습니다. 파일을 변경하거나 삭제하면 클라우드에도 전달될 수 있어 동기화 상태와 이전 버전의 보존·복구를 따로 확인했습니다.

재구성 시험에서는 홈페이지를 GitHub에서 별도로 clone해 빌드했고, Python 프로젝트는 원래 `.venv` 없이 새 환경을 만들어 스크립트와 노트북을 실행했습니다. 기존 uv 캐시는 재사용했습니다. GPU·LLM 전체를 새 환경에서 다시 실행한 시험이나 macOS 전체 복원은 포함하지 않았습니다. 시험 파일 하나의 클라우드 내용 일치와 이전 버전 복구까지 확인한 범위는 [MacBook 연구환경의 실제 구성](/notes/ko/macbook-workstation-configuration/)에 기록했습니다.

## 8. 이 기록을 다시 사용할 때

새 연구에서는 이 테스트 코드를 그대로 연구 결과로 삼기보다 환경의 출발점을 확인하는 데 사용하려고 합니다. Python의 55·11.0, 행렬 곱의 알려진 정답, 모델의 짧은 응답은 서로 다른 실행 경로를 확인하는 작은 기준입니다. 연구 데이터와 더 큰 실험에는 별도의 검증 조건이 필요합니다.

도구를 업데이트하면 이전 버전 기록을 남기고 같은 기준 계산을 다시 비교합니다. 결과 파일이 만들어졌는지뿐 아니라 실행한 환경, 계산의 기대값과 인용의 정확성을 함께 읽는 것이 이번 구축에서 정한 확인 방식입니다.
