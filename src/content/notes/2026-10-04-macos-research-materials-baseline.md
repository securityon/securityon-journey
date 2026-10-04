---
title: "macOS와 연구자료의 기준 상태"
description: "MacBook의 시작 상태와 Command Line Tools, Git을 확인하고 코드와 연구자료의 저장·동기화 범위를 정한 기록입니다."
lang: ko
translationKey: macos-research-materials-baseline
pubDatetime: 2026-10-04T20:45:00+09:00
tags:
  - research-journey
  - macos
  - workstation
  - development
featured: false
draft: false
---

「MacBook 연구 워크스테이션 설계」에서 기존 환경을 먼저 살펴보고 필요한 부분만 바꾸기로 했습니다. 2026년 10월 4일에는 운영체제와 개발도구의 시작 상태를 확인하고, Git의 로컬 작업과 GitHub 인증을 시험했습니다. 코드와 연구자료의 저장 위치도 이 과정에서 정했습니다. 이번 단계는 모든 연구 소프트웨어의 설치가 아니라 개발과 자료 관리를 시작할 기준 상태를 마련하는 작업입니다.

## 1. MacBook의 시작 상태

먼저 `uname -s`, `sw_vers`, `uname -m`으로 실행 환경을 확인했습니다. 결과는 Darwin, macOS 26.6.2(빌드 25G83), `arm64`였습니다. 하드웨어는 `system_profiler SPHardwareDataType`으로 확인하고 일련번호와 UUID 같은 식별자는 공개 기록에서 제외했습니다. 대상은 14인치 MacBook Pro이며 모델 식별자는 `Mac17,9`, 칩은 Apple M5 Pro 15코어, 통합 메모리는 24GB였습니다.

`df -h / /System/Volumes/Data`에서 점검 당시 전체 약 926GiB, 가용 약 839GiB가 표시됐습니다. 루트와 Data 볼륨의 사용량은 각각 약 12GiB와 65GiB였습니다. 두 줄의 전체·가용 공간을 합산해 디스크 용량으로 해석하지 않았습니다. 이 결과는 당시 파일시스템의 공간 현황이며 물리 디스크 구성의 검증은 아닙니다.

처음 사용한 점검 환경에서는 `sysctl`이 권한 오류를, `diskutil`이 디스크 관리 프레임워크 접근 오류를 반환했고 `fdesetup status`도 상태를 얻지 못했습니다. 이후 Mac의 로그인 터미널에서 하드웨어와 FileVault 상태를 다시 확인했습니다. 앞선 조회 실패를 기능이 없거나 꺼져 있다는 판정으로 바꾸지 않았습니다.

설치 전에는 `xcode-select -p`의 활성 경로, `pkgutil --pkg-info com.apple.pkg.CLTools_Executables`의 패키지 설치 기록, 표준 개발도구 폴더를 확인했습니다. Mac의 로그인 터미널에서 다시 살펴봐도 활성 경로와 패키지 기록은 확인되지 않았고 `/Applications/Xcode.app`과 `/Library/Developer/CommandLineTools`도 없었습니다. 표준 설치 상태에 대한 판단이며 임의 위치의 도구까지 전역 검색한 결과는 아닙니다.

`command -v`는 `git`, `python3`, `clang`, `make`를 `/usr/bin` 아래에서 찾았지만 첫 `git --version`은 개발도구 설치를 요청했습니다. 경로가 존재하는 것과 실제로 실행되는 것은 달랐습니다. Homebrew, GitHub CLI, Node.js, uv는 당시 PATH에서 발견되지 않았습니다.

`xcode-select --install`로 설치를 요청한 뒤 macOS 설치 창에서 진행했습니다. 요청 메시지만으로 완료를 판정하지 않고 다음 결과를 다시 확인했습니다.

```text
xcode-select -p  → /Library/Developer/CommandLineTools
git --version    → git version 2.50.1 (Apple Git-155)
clang --version  → Apple clang version 21.0.0 (clang-2100.1.1.101)
```

clang 출력의 대상은 `arm64-apple-darwin25.6.0`이었습니다. `python3 --version`은 3.9.6을 반환했습니다. Python은 실행 여부만 확인했으며, 연구 프로젝트용 버전이나 가상환경을 구성한 것은 아닙니다.

## 2. 코드 경로와 GitHub 연결

코드 작업 위치는 로컬 `~/Developer`로 정했습니다. 생성 전 같은 이름의 항목이 없는지 확인했고 생성 후 일반 폴더인지 다시 확인했습니다. Google Drive 동기화 대상에 넣지 않았으며 iCloud의 **데스크탑 및 문서 폴더** 동기화도 꺼져 있었습니다. Git 작업 폴더와 클라우드 파일 동기화의 경계를 분리한 결정입니다.

GitHub의 브라우저 로그인과 터미널 인증은 별개입니다. 이 Mac에 기존 `~/.ssh`와 공개키가 없는 것을 확인한 뒤 전용 Ed25519 키를 만들었습니다.

```sh
mkdir -m 700 -p "$HOME/.ssh"
ssh-keygen -t ed25519 -C "research-macbook" -f "$HOME/.ssh/id_ed25519"
/usr/bin/ssh-add --apple-use-keychain "$HOME/.ssh/id_ed25519"
```

키 보호용 암호는 GitHub 로그인 암호와 별개로 입력했습니다. GitHub의 **Settings → SSH and GPG keys**에는 `.pub` 공개키만 등록하고 개인키는 Mac에 남겼습니다. 키를 키체인에 추가하도록 요청했지만 재부팅 뒤에도 암호 입력 없이 사용할 수 있는지는 아직 시험하지 않았습니다.

첫 직접 연결은 네트워크 접근 제한으로 실패했습니다. 접근을 허용한 뒤에는 등록되지 않은 GitHub 호스트 키 때문에 엄격한 검증에서 연결이 멈췄습니다. `ssh-keyscan`으로 받은 서버 키의 Ed25519 지문을 [GitHub 공식 지문](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints)과 대조했습니다. 일치한 값은 `SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU`였고, 해당 키를 `known_hosts`에 저장했습니다.

최종 연결 시험은 다음 옵션으로 진행했습니다.

```sh
ssh -T \
  -o BatchMode=yes \
  -o ConnectTimeout=15 \
  -o StrictHostKeyChecking=yes \
  -o UpdateHostKeys=no \
  git@github.com
```

`BatchMode=yes`는 대화형 암호 입력 없이 인증되는지 확인하고 `ConnectTimeout=15`는 대기 시간을 제한합니다. `StrictHostKeyChecking=yes`는 등록한 서버 키를 엄격하게 검증합니다. `UpdateHostKeys=no`는 제한된 실행 환경에서 추가 호스트 키의 자동 갱신 오류를 피하려고 이번 명령에만 사용했습니다. 서버 검증 기능을 끈 것은 아닙니다.

결과는 계정명을 제외하면 `Hi ...! You've successfully authenticated, but GitHub does not provide shell access.`였습니다. [GitHub의 연결 시험 안내](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection)에 따르면 셸 접근을 제공하지 않는다는 메시지와 종료 코드 1은 이 시험의 정상적인 결과입니다. 특정 저장소의 clone·push 권한까지 확인한 것은 아닙니다.

### 커밋 작성자와 로컬 작업 시험

SSH 인증과 커밋 작성자 설정도 구분했습니다. 공개 커밋의 작성자 조합이 여러 개여서 그 이력만으로 현재 사용할 값을 단정하지 않았습니다. 기존에 사용하던 작성자 이름과 GitHub `noreply` 주소를 확인해 전역 Git 설정에 적용하고 값의 일치를 다시 조회했습니다. 이름과 이메일 주소 자체는 공개 기록에서 제외했습니다. 이 설정은 새 커밋의 작성자 정보를 정하며 기존 커밋이나 SSH 인증을 바꾸지 않습니다.

처음 점검을 마친 뒤에는 연구 저장소를 건드리지 않고 별도 `work/git-baseline-check`에서 로컬 작업을 시험했습니다.

```sh
git init --initial-branch=main
# 시험용 README.md 생성
git add README.md
git commit -m 'Verify local Git baseline'
git branch --show-current
git rev-list --count HEAD
git status --porcelain
```

`main` 브랜치에 커밋 1개가 생성됐고 작업 트리는 깨끗했습니다. 커밋의 작성자 이름과 이메일도 전역 설정과 일치했습니다. 이 시험 저장소에는 원격을 등록하지 않았고 push하지 않았습니다. 재부팅 후 키 사용, 커밋 서명, 홈페이지 저장소의 실제 clone·push는 다음 작업에서 따로 확인해야 합니다.

## 3. 연구자료의 위치

연구자료의 로컬 기준 경로는 `~/Research`로 잡았습니다. Google Drive 데스크톱 앱의 공식 설치 파일을 내려받아 디스크 이미지 무결성과 Google LLC의 패키지 서명을 확인했고, 설치 후 버전은 131.0이었습니다. Documents와 Downloads에는 용도를 따로 살펴봐야 할 파일이 있어 일괄 이동하지 않았습니다. Research 아래에는 다음 폴더를 만들었습니다.

| 폴더          | 계획한 용도                    |
| ------------- | ------------------------------ |
| `Materials`   | 논문과 학습자료                |
| `Manuscripts` | 원고와 작성 중인 문서          |
| `Experiments` | 실험별로 남길 결과             |
| `Backups`     | 별도 보존이 필요한 자료의 사본 |

폴더 이름은 자료를 나눌 기준입니다. 기존 연구자료를 모두 옮겼거나 `Backups`에 날짜별 사본과 보존 정책을 마련했다는 의미는 아닙니다.

## 4. Google Drive 동기화 범위

Google Drive에서는 로컬 `~/Research` 하나만 컴퓨터 폴더 동기화 대상으로 지정했습니다. 클라우드 쪽 위치는 **컴퓨터 → My Mac → Research**입니다. **내 드라이브**에 같은 이름의 폴더를 별도로 만든 것은 아닙니다.

설정 과정에서 **내 드라이브 전체 미러링**을 잠시 켰고 여러 파일의 다운로드가 시작됐습니다. 필요한 범위가 Research 하나임을 확인한 뒤 전체 미러링을 해제했습니다. 최종적으로 내 드라이브는 **파일 스트리밍**, 로컬 `~/Research`는 컴퓨터 폴더 동기화 상태입니다. [Google의 동기화 방식 설명](https://support.google.com/drive/answer/13401938?hl=en)에서도 내 드라이브의 스트리밍·미러링 선택과 로컬 폴더 동기화의 범위를 구분합니다. 내려받은 이전 미러링 사본은 동기화 해제 후 정리했지만 잔여 항목까지 모두 제거한 것은 아닙니다.

`Research/README.md` 시험 파일은 업로드 대기 상태를 거쳐 **Up to date**로 표시됐고 대기 목록이 비었습니다. 여기까지 확인한 것은 데스크톱 앱의 동기화 상태입니다. 웹에서 내용이 일치하는지, 삭제하거나 변경한 파일을 이전 상태로 복구할 수 있는지는 시험하지 않았습니다. 동기화는 파일의 변경과 삭제도 반영하므로 이를 독립적인 백업 완료로 간주하지 않습니다. SSH 개인키와 인증정보, 가상환경과 캐시는 Research의 관리 대상에서 제외했습니다.

iCloud의 **데스크탑 및 문서 폴더** 동기화는 꺼진 상태를 확인했습니다. 코드와 연구자료의 저장 범위를 정할 때 이 상태를 유지했습니다.

## 5. FileVault와 다음 단계

로그인 터미널에서 `fdesetup status`는 `FileVault is Off.`를 반환했습니다. [Apple의 설명](https://support.apple.com/guide/security/volume-encryption-with-filevault-sec4c6dc1b6e/web)을 참고해 Apple Silicon의 기본 저장장치 암호화와 FileVault를 켰을 때의 키 보호·로그인 조건을 구분했습니다. 복구 수단 관리와 재시작 뒤 잠금 해제도 고려한 끝에 이번에는 FileVault를 켜지 않기로 했습니다. 이 Mac에서 활성화 전후 성능을 측정한 것은 아닙니다. Time Machine과 전체 시스템 복원도 이번 필수 범위에 포함하지 않았습니다.

이번 단계에서 확보한 것은 MacBook의 기준 정보, Command Line Tools의 설치 후 실행, Git의 로컬 커밋과 GitHub SSH 인증, 그리고 `Research` 파일의 앱 동기화 상태입니다. 홈페이지 저장소의 복제·빌드·게시, 클라우드 파일의 내용 대조와 복구, 대표 프로젝트의 새 환경 재구성은 아직 수행하지 않았습니다. 다음에는 `~/Developer`에서 실제 프로젝트를 가져와 실행하고 필요한 패키지 설치 기록을 남기겠습니다.
