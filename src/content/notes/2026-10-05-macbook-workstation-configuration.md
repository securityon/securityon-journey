---
title: "MacBook 연구환경의 실제 구성"
description: "구축한 MacBook 연구환경의 코드·자료·결과 보존 범위를 정리하고, 별도 폴더와 새 가상환경에서 다시 실행해보는 기록입니다."
lang: ko
translationKey: macbook-workstation-configuration
pubDatetime: 2026-10-05T00:00:00+09:00
tags:
  - research-journey
  - macos
  - workstation
  - development
  - reproducibility
featured: false
draft: false
---

MacBook 연구 워크스테이션은 처음부터 모든 도구를 설치하기보다 작은 실행을 확인하며 구성했습니다. macOS의 기준 상태에서 시작해 홈페이지 관리, Python·Jupyter, Apple Silicon GPU 계산과 로컬 LLM까지 이어왔습니다. 마지막 단계에서는 무엇이 설치됐는지뿐 아니라 코드와 결과가 어디에 남는지, 기존 작업 폴더 없이도 다시 실행할 수 있는지 확인했습니다.

설치된 가상환경을 그대로 복사하면 당장은 편해도 어떤 파일이 실행에 필요한지 알기 어렵습니다. 이번에는 홈페이지를 GitHub에서 다시 가져오고, 대표 Python 프로젝트는 소스와 의존성 버전을 기록한 파일을 별도 폴더로 옮겨 환경을 새로 만들었습니다. 자료 동기화도 상태 표시만 보고 끝내지 않고 개인정보가 없는 시험 파일로 내용 일치와 이전 버전 복구를 확인하는 범위로 잡았습니다.

## 1. 실제로 구성한 도구와 역할

실험에 사용한 MacBook Pro는 Apple M5 Pro와 메모리 24GB 구성입니다. 초기 하드웨어 점검에 기록한 사양이며, 이번 도구 목록 점검에서는 macOS 26.6.2·빌드 25G83과 `arm64`를 다시 확인했습니다.

| 구성                     | 확인한 상태                                                 | 맡긴 역할                         |
| ------------------------ | ----------------------------------------------------------- | --------------------------------- |
| Command Line Tools / Git | 활성 경로 `/Library/Developer/CommandLineTools`, Git 2.50.1 | 명령행 개발도구와 소스 관리       |
| Node.js / pnpm           | 24.21.0 / 11.3.0                                            | 홈페이지 의존성과 빌드            |
| VS Code                  | 1.140.0                                                     | 코드 편집과 Python·Jupyter 작업   |
| uv / 프로젝트 Python     | 0.12.23 / 3.13.16                                           | 프로젝트별 가상환경과 의존성 관리 |
| PyTorch / MLX            | 앞선 GPU 실험에서 2.14.1 / 0.32.3 사용                      | GPU 계산과 작은 학습              |
| MLX-LM                   | 앞선 로컬 LLM 실험에서 0.32.0 사용                          | 로컬 모델 로딩과 문장 생성        |
| Google Drive 데스크톱 앱 | 131.0                                                       | 로컬 Research 폴더 동기화         |

홈페이지 프로젝트의 Astro와 Prettier는 저장소 의존성으로 사용합니다. 전역에 같은 도구를 따로 설치해야 홈페이지를 관리할 수 있는 구성은 아닙니다. 연구 패키지도 각 프로젝트의 `.venv`에 두고 시스템 Python은 연구용 환경으로 바꾸지 않았습니다.

FileVault는 켜지 않기로 한 결정을 유지했습니다. 이번 제한된 명령 환경에서 `fdesetup status` 재조회는 볼륨 확인 오류로 실패했으므로 새 상태를 확인했다고 기록하지 않습니다. Time Machine과 전체 시스템 복원은 이번 구축의 필수 범위에 넣지 않았습니다.

## 2. 코드·자료·결과를 나누는 기준

`~/Developer`는 코드 작업 위치이고 `~/Research`는 자료와 보존할 결과의 위치입니다. `.venv`는 설치된 Python 실행 환경이며, 필요할 때 소스와 의존성 기록을 바탕으로 다시 만듭니다. Python 프로젝트의 `uv.lock`과 홈페이지의 `pnpm-lock.yaml`은 함께 설치할 패키지의 정확한 버전을 기록하는 파일입니다. 다시 설치할 때도 같은 버전 조합을 사용하도록 돕습니다.

| 위치 / 파일                             | 관리하는 내용                                           |
| --------------------------------------- | ------------------------------------------------------- |
| `~/Developer/securityon-journey`        | 홈페이지 소스와 `pnpm-lock.yaml`                        |
| `~/Developer/research-python-baseline`  | Python·Jupyter 기준 실험 소스와 `uv.lock`               |
| `~/Developer/research-apple-silicon-ai` | GPU 연산·정밀도 비교 소스와 `uv.lock`                   |
| `~/Developer/research-local-llm`        | 로컬 추론 소스, 공개 노트 발췌문, 모델 리비전·해시 기록 |
| `~/Research/Materials`, `Manuscripts`   | 연구자료와 원고를 두는 기준 폴더                        |
| `~/Research/Experiments`                | 날짜별로 보존할 실행 결과와 검증 기록                   |
| `~/Research/Backups`                    | 별도로 보존한 자료·소스 사본                            |

이 구분이 폴더만 만들면 자동으로 완성되는 것은 아닙니다. 각 프로젝트의 `.gitignore`에는 `results`를 제외하도록 적어두었지만, 앞선 단계에서는 그 결과가 프로젝트 폴더에 남아 있었습니다. 이번에는 실제 결과를 Research 아래 날짜별 경로에 복사해 보존 사본을 마련했습니다. 원래 결과도 남겨두었고 새 실행 결과와 과거 결과는 구분했습니다.

홈페이지는 이미 GitHub에 보존돼 있습니다. 세 연구 프로젝트는 이번 점검 시점에는 아직 Git 저장소가 없는 로컬 폴더였습니다. 연구 코드는 프로젝트별 비공개 저장소 세 개로 나누기로 정했습니다. 원격 저장소 생성·첫 커밋·푸시는 준비한 내용을 검토한 뒤 별도로 진행할 단계입니다.

## 3. 홈페이지를 별도로 clone해 빌드

검증용 경로는 `~/Developer/research-workstation-check/website-clone`입니다. 기존 홈페이지 폴더의 `node_modules`를 복사하지 않고 GitHub에서 새로 clone했습니다. 가져온 소스는 6편까지 반영한 `9f152c0` 커밋과 일치했습니다.

```sh
pnpm install --frozen-lockfile \
  --store-dir ~/Developer/research-workstation-check/.runtime/pnpm-store
pnpm run build
```

`--frozen-lockfile`은 설치 과정에서 `pnpm-lock.yaml`을 바꾸지 않고 그 파일에 기록된 의존성 조합을 사용하도록 하는 옵션입니다. 패키지 저장 위치도 검증 폴더 아래로 지정했습니다. 설치와 빌드, lint를 통과했고 clone한 소스의 Git 작업 트리는 깨끗했습니다.

이번에 확인한 것은 소스를 다시 가져와 로컬 빌드를 만들 수 있다는 점입니다. 새 macOS를 설치한 뒤 Node.js부터 모두 다시 구성하는 시험이나 배포 시험은 아닙니다.

## 4. 새 가상환경에서 Python·Jupyter 실행

Python 검증 폴더는 `~/Developer/research-workstation-check/python-reconstructed`입니다. 소스, `pyproject.toml`, `uv.lock`, `.python-version`과 노트북을 복사하고 원래 `.venv`, 캐시와 실행 결과는 복사하지 않았습니다. 복사한 핵심 파일의 SHA-256도 원본과 대조해 일치를 확인했습니다.

```sh
uv sync --locked \
  --project ~/Developer/research-workstation-check/python-reconstructed
uv run --locked \
  --project ~/Developer/research-workstation-check/python-reconstructed \
  research-python-baseline
```

새 `.venv`가 만들어졌고 Python 3.13.16과 앞선 실험의 패키지 버전이 선택됐습니다. 기존 uv 패키지 캐시는 재사용했으므로 빈 캐시에서 모든 파일을 다시 내려받는 시험은 아닙니다. 실행 기록의 Python 경로가 기존 프로젝트가 아니라 `python-reconstructed/.venv`인지도 확인했습니다.

계산은 1부터 5까지의 제곱값 `1, 4, 9, 16, 25`를 사용합니다. 예상 합계는 55이고 평균은 `55 ÷ 5 = 11.0`입니다. 스크립트와 Jupyter 노트북 모두 이 값과 일치했고 CSV·PNG·JSON을 생성했습니다.

첫 노트북 실행은 기본 설정 경로인 `~/.jupyter`를 만들려다 제한된 실행 환경의 쓰기 권한에 막혔습니다. Jupyter와 IPython의 설정·실행 파일 위치를 검증 프로젝트의 `.runtime` 아래로 지정한 뒤 다시 실행했습니다. `python3` 커널을 명시했고 노트북 출력에서도 새 가상환경을 사용하는지 확인했습니다.

이번 재구성 시험은 Python·Jupyter 프로젝트를 대표로 삼았습니다. PyTorch·MLX·로컬 LLM 프로젝트의 과거 실행 결과는 보존했지만, 새 가상환경에서 GPU 실험 전체를 다시 실행했다고 확대하지 않습니다.

## 5. 소스와 결과의 보존 사본

세 연구 프로젝트의 소스와 실행 조건을 압축 사본으로 만들어 `~/Research/Backups/workstation-sources/2026-10-05`에 보존했습니다. 가상환경, 캐시, 모델 가중치와 생성 결과는 소스 압축에서 제외했습니다. 각 압축 안의 파일을 원본과 바이트 단위로 대조했고 압축 파일의 SHA-256도 별도 목록에 남겼습니다.

모델 가중치는 대용량 바이너리 대신 모델 저장소·리비전·파일 해시로 구분해 기록했습니다. 이 기록은 같은 파일을 찾는 데 도움이 되지만, 모델 제공처가 나중에 파일을 제공하지 않게 되는 상황까지 해결하는 장기 보존은 아닙니다.

Python·GPU·LLM의 기존 실행 결과와 이번 Python 재구성 결과는 `~/Research/Experiments/workstation-verification/2026-10-05`에 복사했습니다. JSON과 로그, 표·그림·실행된 노트북을 포함한 사본의 내용이 원본과 일치하는지 확인했습니다. 틀린 인용과 첫 실행의 실패 결과도 보존했습니다.

이 사본들은 같은 Mac의 Research 경로에 있습니다. 다른 장소의 사본으로 보존됐는지는 클라우드 쪽 내용 확인이 따로 필요합니다. 폴더 동기화가 변경·삭제를 전달할 수 있으므로, 날짜별 사본과 이전 버전의 확인을 동기화 상태 표시와 구분했습니다.

## 6. 클라우드 내용과 이전 버전 복구

시험 파일은 `~/Research/Experiments/workstation-verification/workstation-sync-recovery-check.txt`입니다. 첫 내용에는 `Revision: 1`, `Expected value: 55`를 적었으며 개인정보나 실제 연구자료는 넣지 않았습니다.

Google Drive 웹에서 컴퓨터 폴더에 올라간 파일의 내용을 확인하고 내려받았습니다. 내려받은 사본의 SHA-256이 원본과 일치했습니다. 이어 로컬 파일을 `Revision: 2`, `Expected value: 11.0`으로 변경했고, 웹의 버전 관리에서 현재 버전과 이전 버전이 나뉘어 있는 것을 확인했습니다.

Google Drive는 이번 화면에서 이전 버전 다운로드 전에 **Keep forever** 설정을 요구했습니다. 93바이트 시험 파일의 이전 버전에 적용했습니다. [Google의 파일 버전 안내](https://support.google.com/drive/answer/2409045)는 이전 버전이 자동으로 제거될 수 있고 따로 보존할 수 있다고 설명합니다. 실제 파일의 버전 관리 화면을 확인해야 보존 상태를 알 수 있었습니다.

버전 관리에서 이전 버전 1을 내려받아 93바이트 파일을 저장했고, SHA-256은 처음 기록한 값과 일치했습니다. 내려받은 이전 파일로 로컬 시험 파일을 복원한 뒤에도 `Revision: 1`, `Expected value: 55`와 원래 해시가 일치했습니다.

이번 확인은 시험 파일 하나의 동기화와 이전 내용 복구에 한정됩니다. 모든 자료의 복구 가능성, 계정 접근을 잃었을 때의 복원, 전체 시스템 복원을 확인한 것은 아닙니다.

## 7. 설계에서 실제 구성으로

처음 설계한 코드·자료 분리는 유지했습니다. 실제 구성에서는 내 드라이브 전체 미러링을 유지하는 대신 로컬 Research 하나를 컴퓨터 폴더로 동기화했습니다. 코드와 가상환경을 클라우드 파일 동기화 밖에 두고, 보존할 결과를 별도 사본으로 남기는 흐름입니다.

MacBook은 이동 중 연구 기록, 코드 편집, Python·Jupyter와 Apple Silicon에서 가능한 GPU·로컬 모델 실험을 맡습니다. Windows 연구 워크스테이션의 GPU 환경과는 구분해 기록합니다. 기존에 홈페이지를 관리하던 PC를 Windows 연구 워크스테이션과 같은 역할로 묶지는 않습니다. 어느 장비가 더 빠르다는 비교 측정은 이번 일곱 편에 포함하지 않았습니다.

일곱 편을 통해 홈페이지 관리에서 작은 연구 실행까지 이어지는 기반과 기록을 마련했습니다. 새로 만들 수 있는 환경과 별도 보존이 필요한 데이터를 나눠 확인했고, 로컬 LLM의 인용 오류처럼 아직 신뢰할 수 없는 부분도 남겼습니다. 이후 실제 연구에서는 자료별 요구와 실험 규모에 맞춰 도구를 추가하고, 결과와 실행 조건을 함께 보존하는 기준을 이어갈 생각입니다.
