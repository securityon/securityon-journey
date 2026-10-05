---
title: "Python과 Jupyter 연구환경 구축"
description: "MacBook에 uv와 프로젝트별 Python 환경을 구성하고 터미널, VS Code, Jupyter에서 같은 가상환경과 계산 결과를 확인한 기록입니다."
lang: ko
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

「MacBook에서 홈페이지를 관리하는 환경」에서 글을 편집하고 빌드해 게시할 수 있는 작업 환경을 마련했습니다. 이번에는 홈페이지의 Node.js 환경과 별개로 Python 연구 프로젝트를 구성했습니다. 앞서 설치한 VS Code의 Python·Jupyter 확장을 실제 인터프리터와 커널에 연결하고, 터미널과 노트북에서 같은 코드를 실행하는 것이 목표였습니다.

작은 수치 계산과 표, 그림을 만드는 프로젝트를 기준으로 삼았습니다. 복잡한 모델부터 설치하기보다 Python의 실행 경로와 패키지, 결과 파일이 연결되는 과정을 먼저 확인하려 했습니다. AI 연산과 모델 실행은 다음 단계에서 이 기반을 이용해 검증할 생각입니다.

## 1. 시스템 Python과 연구용 Python 구분

초기 점검에서 `/usr/bin/python3`는 Python 3.9.6을 반환했습니다. 이번에는 그 실행파일을 교체하지 않고 **uv**로 관리하는 Python을 별도로 설치했습니다. 프로젝트에서 사용할 Python을 지정하고 의존성을 기록하며 가상환경을 구성하기 위한 선택입니다.

Python은 3.13 계열을 선택했습니다. 설치 전 PyPI 배포 정보에서 NumPy, ipykernel, JupyterLab과 이후 검토할 PyTorch·MLX의 Python 요구 및 Python 3.13용 배포 파일을 확인했습니다. 이는 설치 후보의 호환성을 살펴본 결과이며, PyTorch나 MLX를 설치해 연산을 시험한 결과는 아닙니다. uv가 이번에 설치한 정확한 버전은 CPython 3.13.16, 플랫폼은 `macos-aarch64`였습니다.

uv는 [공식 설치 안내](https://docs.astral.sh/uv/getting-started/installation/)에 있는 GitHub 배포 방식으로 확보했습니다. 버전 0.12.23의 `uv-aarch64-apple-darwin.tar.gz`를 내려받고, GitHub release API의 SHA256 digest와 실제 파일의 해시를 대조해 일치를 확인했습니다. 설치 위치는 `~/Developer/.tools/uv-0.12.23`이며 `.tools/bin`에서 `uv`와 `uvx`를 실행하도록 링크를 만들었습니다.

관리형 Python과 캐시의 위치도 지정했습니다. 기존 `~/.zprofile` 내용에 다음 항목을 추가했습니다.

```sh
export PATH="$HOME/Developer/.tools/bin:$PATH"
export UV_PYTHON_INSTALL_DIR="$HOME/Developer/.tools/uv-python"
export UV_PYTHON_BIN_DIR="$HOME/Developer/.tools/bin"
export UV_CACHE_DIR="$HOME/Developer/.tools/uv-cache"
```

이후 로그인 셸에서 `uv python install 3.13`을 실행했습니다. [uv의 Python 관리 설명](https://docs.astral.sh/uv/guides/install-python/)에 따르면 관리형 Python은 Astral의 python-build-standalone 배포를 사용합니다. 이번에 설치한 Python도 그 경로이며 python.org의 macOS 설치 패키지를 사용한 것은 아닙니다.

## 2. 프로젝트별 가상환경과 의존성 기록

기준 프로젝트는 클라우드 동기화 밖의 `~/Developer/research-python-baseline`에 만들었습니다.

```sh
uv init --vcs none --python 3.13.16 \
  "$HOME/Developer/research-python-baseline"
cd "$HOME/Developer/research-python-baseline"
uv add numpy pandas matplotlib
uv add --dev ipykernel jupyterlab nbconvert
```

이 프로젝트에는 Git 저장소나 원격을 생성하지 않았습니다. Python 환경과 실행 검증에 집중하기 위한 로컬 프로젝트입니다. `.python-version`에는 `3.13.16`을 기록했고, `pyproject.toml`의 Python 요구 범위는 `>=3.13.16,<3.14`로 정했습니다. 다음 계열로 자동 확장하기보다 이번에 선택한 계열 안에서 환경을 유지하려는 범위입니다.

NumPy·pandas·Matplotlib은 프로젝트 의존성에, ipykernel·JupyterLab·nbconvert는 개발 의존성에 두었습니다. 실제 설치 버전은 다음과 같습니다.

| 항목       | 버전    | 이번 단계의 역할                 |
| ---------- | ------- | -------------------------------- |
| Python     | 3.13.16 | 프로젝트 인터프리터              |
| uv         | 0.12.23 | Python·의존성·가상환경 관리      |
| NumPy      | 2.5.3   | 배열과 수치 계산                 |
| pandas     | 3.0.6   | 표와 CSV 생성                    |
| Matplotlib | 3.11.2  | 그림 파일 생성                   |
| ipykernel  | 7.4.0   | Python 노트북 커널               |
| JupyterLab | 4.6.4   | 설치한 노트북 작업 도구          |
| nbconvert  | 7.17.1  | 명령행에서 노트북 실행·출력 저장 |

실행 환경은 프로젝트의 `.venv`에 만들어졌고 의존성은 `uv.lock`에 기록됐습니다. `.venv`, 캐시와 임시 상태를 두는 `.runtime`, 생성 결과의 `results`는 `.gitignore`에 넣었습니다. 이 설정은 이후 Git으로 소스를 관리할 때의 경계이며 결과를 별도로 보존하는 절차까지 구성한 것은 아닙니다.

## 3. 작은 계산으로 실행 경로 확인

검증 코드는 1부터 5까지의 정수 배열을 만들고 각 수의 제곱을 계산합니다. 예상하는 제곱값은 `1, 4, 9, 16, 25`입니다. 이 다섯 값의 합은 `1 + 4 + 9 + 16 + 25 = 55`이고 평균은 `55 ÷ 5 = 11.0`입니다. 실제 계산 결과가 이 값과 일치하면, 입력과 정답을 알고 있는 작은 계산이 새 환경에서 정상적으로 실행됐다고 판단할 수 있습니다. 계산 결과와 함께 CSV, PNG, 환경 정보를 담은 JSON을 생성하도록 구성했습니다.

실행 코드에서는 `sys.prefix`가 프로젝트의 `.venv`인지, 아키텍처가 `arm64`인지, Python이 3.13 계열인지 확인합니다. `sys.executable`과 패키지 버전도 결과에 남겼습니다. 명령이 실행됐다는 사실뿐 아니라 어느 Python과 의존성으로 계산했는지 확인하기 위한 기록입니다.

```sh
uv sync
uv run --locked research-python-baseline
```

터미널 실행 결과는 Python 3.13.16, `arm64`, 프로젝트의 `.venv/bin/python`과 `.venv` 경로였습니다. 계산 결과는 예상한 합계 55·평균 11.0과 일치했고 `results/terminal`에 표, 그림과 JSON이 생성됐습니다. Matplotlib은 화면 창을 띄우지 않는 `Agg` 방식으로 그림을 저장했습니다. GPU 연산이나 성능 측정은 이 시험의 범위가 아닙니다.

## 4. 명령행과 VS Code에서 Jupyter 실행

`baseline.ipynb`에서도 같은 프로젝트 코드를 불러와 실행했습니다. 먼저 명령행에서 노트북 전체를 실행하고 결과가 담긴 별도 파일을 저장했습니다.

```sh
uv run --locked jupyter nbconvert \
  --to notebook --execute baseline.ipynb \
  --output baseline-executed --output-dir results/executed \
  --ExecutePreprocessor.timeout=120
```

이 실행에서는 IPython과 Jupyter의 임시·설정 경로를 프로젝트의 `.runtime` 아래로 지정했습니다. 실행된 노트북에는 셀 오류가 없었고 JSON과 그림 출력이 남았습니다. 터미널 실행과 노트북 커널의 Python 버전, 실행파일, 가상환경 경로, 패키지 버전과 계산 결과가 일치했습니다.

다만 명령 실행 환경의 권한 제한으로 커널 종료 과정에서 `psutil`이 자식 프로세스 목록을 조회하지 못했습니다. 로그에는 `sysctl()` 관련 `Operation not permitted`가 남았고 nbconvert는 출력 파일을 생성한 뒤 종료 코드 0을 반환했습니다. 노트북 계산이 성공한 것과 종료 단계의 진단을 구분했습니다. Python 환경의 모든 실행 경로가 오류 없이 정리됐다고 해석하지 않았습니다.

VS Code에서는 새 연구 프로젝트 폴더만 신뢰하도록 설정한 뒤 **Python: Select Interpreter**에서 `.venv/bin/python`을 선택했습니다. 노트북의 **Select Kernel → Python Environments**에서도 같은 가상환경을 골랐습니다. [uv의 VS Code 연동 안내](https://docs.astral.sh/uv/guides/integration/jupyter/)에서 설명하는 프로젝트 ipykernel과 환경 선택 방식입니다.

**Notebook: Run All**로 실제 셀을 실행해 성공 표시와 환경 JSON, 그림 출력을 확인했습니다. 이어서 검증 스크립트를 **Python: Run Python File in Terminal**로 실행했습니다. 편집기가 선택한 `.venv/bin/python` 경로로 실행했고 `results/vscode-terminal`에도 같은 계산 결과를 남겼습니다.

| 실행 경로                  | 확인 결과                                          |
| -------------------------- | -------------------------------------------------- |
| 터미널의 `uv run --locked` | Python 3.13.16·프로젝트 `.venv`, 합계 55·평균 11.0 |
| 명령행 노트북 실행         | 같은 환경과 결과, JSON·그림 출력                   |
| VS Code 노트북 커널        | 같은 `.venv`로 실제 셀 실행, JSON·그림 출력        |
| VS Code Python 스크립트    | 같은 인터프리터와 결과 파일 생성                   |

JupyterLab도 설치했지만 이번에 직접 확인한 대화형 노트북 작업은 VS Code에서 수행했습니다. JupyterLab의 브라우저 서버 실행까지 확인한 것은 아닙니다.

## 5. 반복 실행과 다음 확인 범위

새 로그인 zsh에서 `uv --version`과 `python3.13 --version`을 확인했습니다. macOS를 재시동한 뒤에도 두 명령에서 같은 버전을 확인했고, 같은 프로젝트에서 다음 명령이 성공했습니다.

```sh
uv sync --locked --offline
uv run --locked --offline research-python-baseline
```

재시동 후 VS Code에서도 같은 `.venv` 인터프리터와 노트북 커널 선택이 유지됐습니다. Python 스크립트와 노트북 전체를 다시 실행했고, 합계 55·평균 11.0과 결과 파일 생성을 확인했습니다.

이미 있는 `.venv`와 캐시를 이용한 반복 실행입니다. `--offline`으로 새 패키지를 요청하지 않고 작업할 수 있는 것은 확인했지만, 이 실행으로 네트워크를 끊은 장비 전체나 깨끗한 새 환경의 복구를 검증한 것은 아닙니다.

별도 프로젝트 복사본에서 `uv.lock`에 기록한 버전을 이용해 환경을 새로 구성하는 시험과, 남길 결과를 Google Drive에 보존하고 내용을 대조하는 작업은 후속 범위입니다.

이번 단계에서는 시스템 Python과 구분된 연구용 Python, 프로젝트별 의존성 기록, 터미널과 편집기·노트북의 실행 경로를 확보했습니다. 다음에는 이 기반과 분리된 작은 AI 프로젝트에서 PyTorch MPS와 MLX의 실제 연산을 확인할 생각입니다.
