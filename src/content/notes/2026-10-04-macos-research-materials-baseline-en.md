---
title: "Establishing the macOS and Research Material Baseline"
description: "I inspect the MacBook's starting state, validate Command Line Tools and Git, and define where code and research material are stored and synchronised."
lang: en
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

In “Designing a MacBook Research Workstation”, I decided to inspect the existing environment before changing it. On 4 October 2026, I recorded the operating system and development-tool starting state, tested local Git work and GitHub authentication, and chose where to keep code and research material. The aim at this stage was to establish a baseline for development and material management, rather than to install every research tool.

## 1. The MacBook at the Start

I first ran `uname -s`, `sw_vers` and `uname -m` to check the execution context. They reported Darwin, macOS 26.6.2 (build 25G83) and `arm64`. I used `system_profiler SPHardwareDataType` for the hardware check and removed serial numbers, UUIDs and other device identifiers from the public record. The laptop is a 14-inch MacBook Pro with model identifier `Mac17,9`, a 15-core Apple M5 Pro and 24GB of unified memory.

At the time of inspection, `df -h / /System/Volumes/Data` showed roughly 839GiB available on a 926GiB volume. The root and Data volumes reported around 12GiB and 65GiB used respectively. I did not add the two total or available figures together to estimate disk capacity. This was a filesystem-space check, not verification of the physical disk layout.

In the first environment I used for inspection, `sysctl` returned a permission error, `diskutil` could not access the disk-management framework, and `fdesetup status` did not return a state. I repeated the relevant hardware and FileVault checks in the Mac's login terminal. A failed query was not treated as evidence that the feature was absent or disabled.

Before installation, I checked the active path with `xcode-select -p`, the package installation record with `pkgutil --pkg-info com.apple.pkg.CLTools_Executables`, and the standard development-tool directories. Repeating the checks in the Mac's login terminal still found no active developer path or package record; `/Applications/Xcode.app` and `/Library/Developer/CommandLineTools` were absent. These checks supported a conclusion about the standard installation, not an exhaustive search for tools copied elsewhere.

`command -v` located `git`, `python3`, `clang` and `make` under `/usr/bin`. Yet the first `git --version` invoked the developer-tool installation prompt. A command path did not establish that the tool could run. Homebrew, GitHub CLI, Node.js and uv were not found on PATH at that point.

I requested installation with `xcode-select --install` and completed it in the macOS window. The request message alone was not evidence of completion, so I checked the path and executable versions again.

```text
xcode-select -p  → /Library/Developer/CommandLineTools
git --version    → git version 2.50.1 (Apple Git-155)
clang --version  → Apple clang version 21.0.0 (clang-2100.1.1.101)
```

The clang output identified an `arm64-apple-darwin25.6.0` target. `python3 --version` returned 3.9.6. I had confirmed that Python ran, but had not chosen a version or created a virtual environment for research projects.

## 2. A Local Code Directory and GitHub Authentication

I chose local `~/Developer` for code. I checked that no item with the same name existed before creating it and later confirmed that it was an ordinary directory. I did not add it to Google Drive synchronisation. iCloud **Desktop & Documents** syncing was also off. This keeps Git working directories separate from cloud file synchronisation.

A GitHub browser session does not provide terminal Git authentication. After checking that this Mac had no existing `~/.ssh` directory or public key, I generated a dedicated Ed25519 key.

```sh
mkdir -m 700 -p "$HOME/.ssh"
ssh-keygen -t ed25519 -C "research-macbook" -f "$HOME/.ssh/id_ed25519"
/usr/bin/ssh-add --apple-use-keychain "$HOME/.ssh/id_ed25519"
```

I entered a key passphrase distinct from the GitHub account password. Only the `.pub` public key was registered under GitHub **Settings → SSH and GPG keys**; the private key remained on the Mac. I requested that the key be added to the keychain, but have not yet tested whether it remains available without a passphrase prompt after a reboot.

The first direct connection failed because network access was restricted. Once access was allowed, strict host verification stopped at GitHub's as-yet-unregistered host key. I compared the Ed25519 fingerprint of the server key obtained with `ssh-keyscan` against [GitHub's published fingerprint](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints) before adding the matching key to `known_hosts`. The fingerprint was `SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU`.

I used these options for the final connection check:

```sh
ssh -T \
  -o BatchMode=yes \
  -o ConnectTimeout=15 \
  -o StrictHostKeyChecking=yes \
  -o UpdateHostKeys=no \
  git@github.com
```

`BatchMode=yes` checked whether authentication worked without interactive password input, and `ConnectTimeout=15` limited the wait. `StrictHostKeyChecking=yes` retained strict verification of the registered host key. I set `UpdateHostKeys=no` for this command only to avoid an additional host-key update failure in the restricted execution context; it did not disable server verification.

With the account name omitted, the result was `Hi ...! You've successfully authenticated, but GitHub does not provide shell access.` [GitHub's connection-test guidance](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection) explains both the shell-access message and exit code 1. This confirmed account SSH authentication, not clone or push permission for a particular repository.

### Commit Identity and a Local Repository Test

I treated SSH authentication and commit identity separately. Public commits showed more than one author combination, so I did not infer the intended current setting from that history. I applied the existing author name and GitHub `noreply` address I had chosen for this setup as global Git settings, then checked that the stored values matched. I left the name and address themselves out of the public record. These settings govern new commits; they neither alter earlier commits nor configure SSH authentication.

After the initial inspection, I tested Git's local workflow in a separate `work/git-baseline-check` directory without changing a research repository.

```sh
git init --initial-branch=main
# Create a test README.md
git add README.md
git commit -m 'Verify local Git baseline'
git branch --show-current
git rev-list --count HEAD
git status --porcelain
```

The result was a `main` branch with one commit and a clean working tree. The commit author name and email matched the global settings. I did not configure a remote or push this test repository. Use of the key after a reboot, commit signing, and actual clone and push operations for the website repository remain untested.

## 3. Locations for Research Material

I chose `~/Research` as the local base for research material. I downloaded the official Google Drive for desktop installer, checked the disk image's integrity and its Google LLC package signature, and confirmed version 131.0 after installation. Existing Documents and Downloads contained files whose purposes needed individual review, so I did not move them wholesale. I created these subfolders:

| Folder        | Intended use                                      |
| ------------- | ------------------------------------------------- |
| `Materials`   | Papers and study material                         |
| `Manuscripts` | Drafts and working documents                      |
| `Experiments` | Results retained by experiment                    |
| `Backups`     | Separate copies of material that needs preserving |

The folders establish a way to organise future material. Existing research files have not all been moved, and creating `Backups` did not establish dated copies or a retention policy.

## 4. The Scope of Google Drive Synchronisation

I selected local `~/Research` as the one computer folder to synchronise. Its cloud location is **Computers → My Mac → Research**. I did not create a second folder of the same name in **My Drive**.

During setup I briefly enabled **full My Drive mirroring**, which began downloading multiple files. That was broader than the intended Research scope, so I disabled it. The final configuration uses **Stream files** for My Drive and separate computer-folder synchronisation for local `~/Research`. [Google's description](https://support.google.com/drive/answer/13401938?hl=en) distinguishes the My Drive stream/mirror choice from local-folder synchronisation. The earlier mirrored copy was tidied after syncing was disabled, but some residual items remained.

The test file `Research/README.md` moved from an upload queue to **Up to date** in the desktop app, with no queued items remaining. This confirms the app's reported sync state; I have not compared the file's contents in the web interface or tested recovery of a changed or deleted file. Synchronisation also propagates changes and deletions, so I have not treated it as a completed independent backup. SSH private keys, credentials, virtual environments and caches are outside the research-material folder's scope.

I confirmed that iCloud **Desktop & Documents** syncing was off and retained that boundary while choosing where to work and store material.

## 5. FileVault and the Next Stage

In the login terminal, `fdesetup status` returned `FileVault is Off.` I used [Apple's description](https://support.apple.com/guide/security/volume-encryption-with-filevault-sec4c6dc1b6e/web) to distinguish Apple Silicon's built-in storage encryption from FileVault's additional protection of the keys and its login requirements. After considering recovery-key management and unlocking after a restart, I chose to leave FileVault off for this setup. I did not measure performance before and after enabling it. Time Machine and full-system restoration are also outside this setup's required scope.

This stage established the system baseline, confirmed Command Line Tools execution, produced a local Git commit, authenticated to GitHub over SSH, and observed the app's synchronisation state for a Research file. Cloning, building and publishing the website from the Mac, comparing and recovering cloud-file contents, and reconstructing a research project in a fresh environment remain untested. Next I will bring a real project into `~/Developer`, run it, and keep a record of the packages installed for that work.
