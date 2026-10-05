---
title: "MacBook에서 홈페이지를 관리하는 환경"
description: "기존 홈페이지 저장소를 MacBook으로 가져와 Node.js와 pnpm, VS Code를 구성하고 편집·검증·미리보기 환경을 확인한 기록입니다."
lang: ko
translationKey: macbook-website-management
pubDatetime: 2026-10-04T22:10:00+09:00
tags:
  - research-journey
  - macos
  - workstation
  - development
featured: false
draft: false
---

「macOS와 연구자료의 기준 상태」에서는 Command Line Tools와 GitHub SSH 인증을 확인하고 코드와 자료의 저장 위치를 정했습니다. 다음 작업은 기존에 홈페이지 관리에 사용하던 PC의 작업을 MacBook에서도 이어갈 수 있도록 편집·검증 환경을 만드는 것이었습니다. 연구환경을 계속 정리하면서 그 과정을 기록하려면, 글을 작성한 MacBook에서 홈페이지 관리까지 이어갈 수 있는 편이 편리합니다.

이번에는 기존 저장소를 로컬 코드 폴더로 가져오고, 프로젝트가 요구하는 실행 도구와 편집기를 설치했습니다. 설치 목록만 남기지 않고 실제 의존성 설치, 검사, 빌드, 브라우저 미리보기까지 확인했습니다. 이 글을 MacBook에서 작성하는 첫 홈페이지 관리 기록으로 남깁니다.

## 1. 기존 저장소를 로컬 코드 폴더로 가져오기

홈페이지 저장소는 SSH로 복제해 `~/Developer/securityon-journey`에 두었습니다. 앞서 정한 대로 코드는 로컬 폴더와 GitHub에서 관리하며 Google Drive의 연구자료 동기화 대상에 넣지 않았습니다. 복제 후 `main`이 `origin/main`을 추적하고 작업 트리가 깨끗한 것을 확인했습니다.

실제 프로젝트를 다루기 전에 저장소의 `AGENTS.md`, `package.json`, `pnpm-lock.yaml`, CI 설정을 읽었습니다. 홈페이지에는 이미 Astro와 TypeScript, Tailwind CSS, ESLint, Prettier가 구성돼 있었습니다. MacBook에서 다른 틀로 홈페이지를 새로 만드는 것이 아니라 같은 소스와 설정을 실행할 도구를 갖추는 작업입니다.

SSH 계정 인증은 이전 단계에서 확인했지만, 이번 복제로 실제 홈페이지 저장소를 읽을 수 있는 것까지 확인했습니다. 커밋 작성자 설정도 앞서 선택한 기존 이름과 GitHub `noreply` 주소를 그대로 사용합니다.

## 2. Node.js와 pnpm의 버전 기준

`package.json`의 Node.js 최소 요구는 `>=22.12.0`이었고 CI는 Node.js 24와 pnpm 11.3.0을 사용하고 있었습니다. 설치 버전은 최소 요구만 만족시키기보다 기존 CI의 기준에 맞췄습니다. 실제 설치한 Node.js는 24.21.0, 함께 제공된 npm은 11.19.0, pnpm은 11.3.0입니다.

Node.js는 [공식 배포 서버](https://nodejs.org/dist/)의 Apple Silicon용 `darwin-arm64` 아카이브를 내려받았습니다. 설치 전에 아카이브의 SHA256을 같은 배포 경로의 `SHASUMS256.txt`와 대조해 일치하는 것을 확인했습니다. 버전별 설치 폴더는 `~/Developer/.tools/node-v24.21.0-darwin-arm64`이며, `~/Developer/.tools/node` 링크가 이를 가리키도록 구성했습니다.

로그인 셸에서 실행할 수 있도록 `~/.zprofile`에 다음 경로를 추가했습니다. 기존 내용은 보존했습니다.

```sh
export PATH="$HOME/Developer/.tools/node/bin:$PATH"
```

pnpm은 이 Node.js 설치 경로에 버전을 지정해 설치했습니다.

```sh
npm install --global pnpm@11.3.0 \
  --prefix "$HOME/Developer/.tools/node" \
  --cache "$HOME/Developer/.tools/npm-cache" \
  --no-audit --no-fund
```

여기서 `--global`의 설치 범위는 `--prefix`로 지정한 로컬 도구 폴더입니다. npm 캐시와 pnpm 저장소도 `.tools` 아래에 두었습니다. 새 로그인 zsh에서 `node --version`과 `pnpm --version`을 다시 실행해 경로가 적용된 것을 확인했습니다. 이번 홈페이지 관리에 필요한 도구를 구성하는 데 Homebrew는 설치하지 않았습니다.

## 3. 프로젝트 의존성과 빌드 확인

프로젝트 폴더에서 `pnpm-lock.yaml`에 기록된 버전을 유지하며 의존성을 설치했습니다.

```sh
pnpm install --frozen-lockfile \
  --store-dir "$HOME/Developer/.tools/pnpm-store"
pnpm run lint
pnpm run format:check
pnpm run build
```

의존성 설치는 555개 패키지로 완료됐고 `package.json`과 `pnpm-lock.yaml`은 변경되지 않았습니다. 설치 시점의 주요 프로젝트 버전은 다음과 같습니다.

| 도구         | 버전과 역할                             |
| ------------ | --------------------------------------- |
| Astro        | 7.0.3, 페이지와 노트의 정적 사이트 빌드 |
| Tailwind CSS | 4.3.2, 화면의 스타일 구성               |
| TypeScript   | 6.0.3, 타입 검사와 개발 지원            |
| ESLint       | 10.6.0, 코드 검사                       |
| Prettier     | 3.9.3, 기존 규칙에 따른 서식 검사·정리  |

Astro를 시스템 전체에 별도로 설치할 필요는 없었습니다. 저장소의 프로젝트 의존성으로 설치됐고 `pnpm dev`나 `pnpm run build`가 그 버전을 실행합니다. Tailwind CSS와 검사 도구도 같은 방식으로 사용합니다.

첫 빌드에서는 Astro가 60개 파일을 검사해 오류·경고·힌트가 모두 0이었고, 정적 페이지 114개가 생성됐습니다. Pagefind는 한국어와 영어의 36개 페이지를 색인했습니다. ESLint 검사도 통과했습니다.

서식 검사는 기존 `public/naver7fe53df996acb7e90822345eedea536d.html` 한 파일에서 실패했습니다. 홈페이지 인증용 파일의 서식 문제였고 이번 도구 설치와 새 노트 작성 범위에서 원본을 일괄 정리하지 않았습니다. 빌드가 성공한 것과 저장소 전체 서식 검사가 통과한 것은 구분해 기록합니다.

빌드에는 기존 노트의 `gitattributes` 코드 언어를 일반 텍스트로 표시한다는 메시지, Naver 인증 HTML의 `html` 요소 부재, Pagefind의 한국어 어간 처리 미지원 안내도 있었습니다. 사이트 생성은 완료됐으며 이 메시지들을 해결했다고 기록하지 않았습니다.

## 4. VS Code와 편집 확장

홈페이지 관리와 이후 연구 작업에 사용할 편집기로 **VS Code**를 설치했습니다. [공식 macOS 설치 안내](https://code.visualstudio.com/docs/setup/mac)에 맞춰 Apple Silicon용 앱을 사용했고, 설치 전 Microsoft Corporation의 코드 서명 검증이 통과하는 것과 공증 티켓이 있는 것을 확인했습니다. 설치된 버전은 1.140.0, 아키텍처는 `arm64`입니다.

앱은 `/Applications/Visual Studio Code.app`에 두고 로그인 셸에서 `code` 명령도 사용할 수 있도록 앱 내부의 명령 경로를 PATH에 추가했습니다. 확장은 저장소의 `.vscode/extensions.json`에 이미 있던 네 가지 권장 항목을 먼저 설치했습니다.

| 확장                      | 편집할 때의 역할                  |
| ------------------------- | --------------------------------- |
| Astro                     | `.astro` 파일의 언어 지원         |
| Tailwind CSS IntelliSense | 스타일 클래스 자동완성과 안내     |
| ESLint                    | 편집기 안에서 코드 검사 결과 표시 |
| Prettier                  | 저장소 규칙에 따른 서식 정리      |

프로젝트의 Prettier 실행 패키지와 VS Code의 Prettier 확장은 역할이 다릅니다. 터미널 검사는 프로젝트에 설치된 Prettier를 실행하고, 확장은 편집기에서 그 작업을 돕습니다. 기존 홈페이지 관리 PC에서 사용하던 저장소의 `.prettierrc`를 그대로 사용하므로 MacBook에서도 서식 기준은 같습니다. 저장 시 자동 서식 정리 설정은 이번에 추가하지 않았습니다.

연구 편집용으로 Python, Pylance, Jupyter 확장도 설치했습니다. 필요한 Python Debugger, Python Environments와 Jupyter 관련 확장은 함께 설치됐습니다. `code --list-extensions --show-versions`로 설치된 13개 확장을 확인했습니다. 이 결과는 편집 기능의 설치이며 Python 가상환경이나 실험용 패키지, Jupyter 커널을 구성하고 실행한 결과는 아닙니다.

VS Code에서 저장소를 연 뒤 작업 폴더 신뢰 범위는 `~/Developer/securityon-journey` 하나로 한정했습니다. 신뢰를 부여하면 해당 저장소의 작업·디버깅 명령과 확장이 실행될 수 있습니다. 상위 `Developer` 폴더나 홈 전체까지 신뢰 목록에 넣지는 않았습니다. 편집기에서 `main` 브랜치도 확인했습니다.

## 5. 브라우저 미리보기와 두 PC의 작업 흐름

빌드 결과는 다음 명령으로 로컬 브라우저에서 확인했습니다.

```sh
pnpm run preview --host 127.0.0.1 --port 4321
```

`http://127.0.0.1:4321/`에서 사이트를 열고 기존 한국어 기준 상태 노트의 본문과 화면을 직접 확인했습니다. `preview`는 생성된 사이트를 확인하는 용도입니다. 글이나 화면을 수정하며 확인할 때는 `pnpm dev`를 사용하며, 이미 미리보기 서버가 실행 중이라면 포트가 겹치지 않도록 해야 합니다.

기존 홈페이지 관리 PC와 MacBook은 같은 저장소를 각자의 로컬 폴더에 두고 GitHub를 통해 변경을 주고받습니다. 작업 시작 전에는 브랜치와 작업 트리를 확인하고, 다른 쪽에서 게시한 변경이 있다면 먼저 가져오는 흐름으로 운영하려 합니다. 두 PC에서 같은 파일을 따로 수정한 뒤 나중에 합치는 일을 줄이는 것이 목적입니다. 이번 준비에서도 원격 이력을 다시 조회해 로컬 `main`이 뒤처져 있지 않은 것을 확인했습니다.

미리보기 서버는 실행 중인 프로세스에 의존합니다. 앱이나 실행 세션을 종료한 뒤에도 자동으로 유지되도록 서비스화한 것은 아닙니다. 재부팅 뒤 SSH 키 사용과 편집기에서의 디버깅 실행 역시 아직 시험하지 않았습니다.

## 6. 이번 단계의 범위

이제 MacBook에서 기존 홈페이지 저장소를 읽고 노트를 편집하며, 프로젝트의 검사 도구와 빌드를 실행하고 브라우저로 결과를 확인할 수 있습니다. 이번 노트의 작성과 게시를 이 환경의 첫 실제 작업으로 삼았습니다. 공개 사이트의 반영 여부는 로컬 빌드 성공과 별도로 확인합니다.

연구환경 전체를 완성한 단계는 아닙니다. Python·Jupyter 확장은 갖췄지만 연구용 Python 버전과 가상환경, 대표 실험의 실행은 다음 작업으로 남겨뒀습니다. 먼저 홈페이지를 관리할 수 있는 환경을 마련했으므로, 이후 연구 도구를 추가하는 과정도 같은 MacBook에서 기록하고 검증할 수 있게 됐습니다.
