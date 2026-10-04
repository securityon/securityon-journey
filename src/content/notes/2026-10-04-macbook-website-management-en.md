---
title: "Managing the Website from a MacBook"
description: "Bringing the existing website repository onto a MacBook, configuring Node.js, pnpm and VS Code, and checking editing, validation and local previews."
lang: en
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

In “Establishing the macOS and Research Material Baseline”, I checked Command Line Tools and GitHub SSH authentication and chose locations for code and research material. The next task was to bring the work from the PC I had previously used to manage the website onto the MacBook, with editing and validation tools in place. As I continue organising the research environment, it is convenient to manage the website from the same MacBook on which I write about that work.

I brought the existing repository into the local code directory and installed the runtime tools and editor it needed. I went beyond an installation inventory to check dependency installation, validation, a build and a browser preview. This Note is my first website-management record written on the MacBook.

## 1. Bringing the Existing Repository into the Local Code Directory

I cloned the website repository over SSH into `~/Developer/securityon-journey`. Code remains in a local directory and on GitHub, outside Google Drive's research-material synchronisation. After cloning, I confirmed that `main` tracked `origin/main` and the working tree was clean.

Before working on the project, I read the repository's `AGENTS.md`, `package.json`, `pnpm-lock.yaml` and CI configuration. Astro, TypeScript, Tailwind CSS, ESLint and Prettier were already configured. The task was to provide the tools needed to run the same source and configuration on the MacBook.

The earlier stage had confirmed SSH account authentication; this clone also confirmed read access to the actual website repository. I retained the existing commit author name and GitHub `noreply` address chosen during that stage.

## 2. Version Criteria for Node.js and pnpm

The minimum Node.js requirement in `package.json` was `>=22.12.0`, while CI used Node.js 24 and pnpm 11.3.0. I followed the existing CI baseline rather than merely satisfying the minimum. The installed versions were Node.js 24.21.0, its bundled npm 11.19.0 and pnpm 11.3.0.

I downloaded the Apple Silicon `darwin-arm64` archive from the [official Node.js distribution server](https://nodejs.org/dist/). Before installation, I compared the archive's SHA256 with `SHASUMS256.txt` from the same release directory and confirmed a match. The versioned installation directory is `~/Developer/.tools/node-v24.21.0-darwin-arm64`, with `~/Developer/.tools/node` pointing to it.

I added the following path to `~/.zprofile`, preserving its existing contents, so that the tools could run from a login shell.

```sh
export PATH="$HOME/Developer/.tools/node/bin:$PATH"
```

I installed a specific pnpm version into that Node.js installation path.

```sh
npm install --global pnpm@11.3.0 \
  --prefix "$HOME/Developer/.tools/node" \
  --cache "$HOME/Developer/.tools/npm-cache" \
  --no-audit --no-fund
```

Here, `--global` uses the local tools directory specified by `--prefix`. The npm cache and pnpm store also sit under `.tools`. I ran `node --version` and `pnpm --version` in a fresh login zsh to confirm that the path was applied. I did not install Homebrew to configure the tools needed for this website-management stage.

## 3. Project Dependencies and Build Checks

Inside the project directory, I installed dependencies while retaining the lockfile.

```sh
pnpm install --frozen-lockfile \
  --store-dir "$HOME/Developer/.tools/pnpm-store"
pnpm run lint
pnpm run format:check
pnpm run build
```

Installation completed with 555 packages, without changing `package.json` or the lockfile. The main project versions at installation were:

| Tool         | Version and role                                      |
| ------------ | ----------------------------------------------------- |
| Astro        | 7.0.3, building pages and Notes as a static site      |
| Tailwind CSS | 4.3.2, styling the site                               |
| TypeScript   | 6.0.3, type checking and development support          |
| ESLint       | 10.6.0, code checks                                   |
| Prettier     | 3.9.3, checking and formatting against existing rules |

Astro did not need a separate system-wide installation. It was installed as a project dependency, and commands such as `pnpm dev` and `pnpm run build` use that version. Tailwind CSS and the checking tools follow the same model.

During the first build, Astro checked 60 files with zero errors, warnings or hints, and generated 114 static pages. Pagefind indexed 36 pages across Korean and English. ESLint also passed.

The formatting check failed on one existing file, `public/naver7fe53df996acb7e90822345eedea536d.html`. This concerned the formatting of the website verification file; I did not reformat unrelated source as part of installing tools and writing a new Note. I recorded the successful build separately from the repository-wide formatting check.

The build also reported that an existing Note's `gitattributes` code language would fall back to plain text, that the Naver verification HTML lacked an `html` element, and that Pagefind did not support Korean stemming. Site generation completed, but I did not record these notices as resolved.

## 4. VS Code and Editing Extensions

I installed **VS Code** for website management and subsequent research work. Following the [official macOS installation guidance](https://code.visualstudio.com/docs/setup/mac), I used the Apple Silicon application. Before installation, I confirmed that verification of its Microsoft Corporation code signature passed and that a notarisation ticket was present. The installed version is 1.140.0, with `arm64` architecture.

The application is in `/Applications/Visual Studio Code.app`. I added its internal command directory to PATH so that `code` could also run from a login shell. I first installed the four extensions already recommended by the repository's `.vscode/extensions.json`.

| Extension                 | Editing role                             |
| ------------------------- | ---------------------------------------- |
| Astro                     | Language support for `.astro` files      |
| Tailwind CSS IntelliSense | Style-class completion and guidance      |
| ESLint                    | Showing code-check results in the editor |
| Prettier                  | Formatting according to repository rules |

The project's Prettier package and the VS Code Prettier extension have different roles. Terminal checks run the package installed in the project; the extension supports formatting in the editor. The repository's existing `.prettierrc`, used on the PC that previously managed the website, retains the same formatting criteria on the MacBook. I did not add automatic formatting on save during this stage.

For research editing, I also installed Python, Pylance and Jupyter extensions. Python Debugger, Python Environments and related Jupyter extensions were installed alongside them. `code --list-extensions --show-versions` confirmed 13 installed extensions. This established editing support; it did not configure or test a Python virtual environment, experimental packages or a Jupyter kernel.

After opening the repository in VS Code, I limited workspace trust to `~/Developer/securityon-journey`. Granting trust enables that repository's tasks, debugging commands and extensions. I did not add the parent `Developer` directory or the whole home directory to the trusted list. The editor also showed the `main` branch.

## 5. Browser Previews and Work Across Two PCs

I checked the built site in a local browser with:

```sh
pnpm run preview --host 127.0.0.1 --port 4321
```

I opened `http://127.0.0.1:4321/` and inspected the existing Korean baseline Note's body and rendering. `preview` serves the generated site. When editing content or styling, I will use `pnpm dev`, taking care to avoid a port conflict if a preview server is already running.

The PC previously used to manage the website and the MacBook each hold a local copy of the same repository, with GitHub carrying changes between them. I intend to check the branch and working tree before starting and bring in changes published from the other computer first. This should reduce independently editing the same file on both PCs and reconciling it later. During this preparation, I fetched the remote history again and confirmed that local `main` was not behind.

The preview server depends on a running process. I have not configured it as a service that persists after the application or execution session closes. Use of the SSH key after a reboot and debugging from the editor also remain untested.

## 6. What This Stage Established

The MacBook can now read the existing website repository, edit Notes, run the project's checks and build, and display the result in a browser. I chose the writing and publication of this Note as the first real task in that environment. Appearance on the public site is checked separately from a successful local build.

The wider research environment is still in progress. Python and Jupyter editing extensions are present, but choosing a research Python version, creating virtual environments and running a representative experiment are the next tasks. Establishing website management first means that I can document and validate subsequent research-tool setup from the same MacBook.
