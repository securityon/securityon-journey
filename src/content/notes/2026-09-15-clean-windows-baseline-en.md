---
title: "Building a Clean Windows Baseline"
description: "A record of checking the corporate master image, licensing, organisation registration, and recovery layout, then resolving installation-media issues to establish a clean Windows 11 Pro baseline on the Galaxy Book Ultra 6."
lang: en
translationKey: clean-windows-baseline
pubDatetime: 2026-09-15T00:00:00+09:00
tags:
  - research-journey
  - windows
  - workstation
  - security
featured: false
draft: false
---

The first architecture note treated the Windows research baseline and WSL2 pre-check as one next step. Once implementation began, establishing the operating system itself proved substantial enough to deserve a separate record before installing development tools.

The work included checking the corporate master image's licensing and organisation registration, reviewing its recovery partitions, and resolving incomplete USB installation media. This note documents how those checks led to a **clean Windows 11 Pro baseline**.

## 1. Why I Replaced the Existing Master Image

The laptop is a **Samsung Galaxy Book Ultra 6** with the following hardware:

- Intel Core Ultra 7 356H
- 32GB RAM
- NVIDIA GeForce RTX 5060 Laptop GPU with 8GB VRAM
- 1TB Samsung NVMe SSD

The laptop belongs to my employer, but I will use it while working on-site at another company. The organisation providing the device and the organisation where it will be used have different security requirements, mandatory security software, and network policies.

Preserving the original corporate master image therefore offered little practical value. I decided to reinstall Windows before entering the target environment, complete updates, check hardware recognition, and then build the required configuration on that foundation. A defined starting point would also make later changes easier to understand.

Before reinstalling, however, I examined what was already present.

## 2. OS, Licence, and Device Registration

The original installation had the following state:

| Item                              | Observed state                                 |
| --------------------------------- | ---------------------------------------------- |
| Operating system                  | Windows 11 Enterprise                          |
| Version                           | 25H2                                           |
| OS Build                          | 26200.8246                                     |
| Image                             | The original employer's corporate master image |
| Installed Enterprise licence type | Volume KMS Client / GVLK                       |
| Key held in firmware              | Windows Professional OEM:DM                    |

The useful distinction was between **the licence type of the installed Enterprise image and the Pro OEM key held in the laptop's firmware**. After confirming that the firmware contained a `Windows Professional OEM:DM` key, I selected Windows 11 Pro as the new baseline operating system instead of retaining the Enterprise/KMS configuration.

I also checked the device-registration fields. `AzureAdJoined`, `EnterpriseJoined`, `DomainJoined`, and `WorkplaceJoined` were all `NO`. I treated these as a record of the observed registration state, rather than evidence that the laptop already satisfied the target organisation's security requirements.

BitLocker was not active on the old master image. This was another observation about the state before reinstallation.

## 3. Existing Disk and Recovery Layout

The SSD contained several recovery partitions alongside the operating-system and data volumes.

| Partition     | Original size          |
| ------------- | ---------------------- |
| EFI           | Approximately 100MB    |
| MSR           | 16MB                   |
| C:            | Approximately 521.57GB |
| Recovery      | Approximately 816MB    |
| D:            | Approximately 400.39GB |
| Recovery_Data | Approximately 30GB     |
| SAMSUNG_REC   | Approximately 1GB      |

I could not find `reagentc.exe` in the old master image. Although recovery partitions were present, I decided that carrying their existing configuration forward as the new research environment's standard Windows recovery layout would not be appropriate.

The Samsung recovery partitions belonged to the original OEM environment. Returning to that image was not a requirement for the target environment, so preserving those partitions was not a condition of the new installation. I left the design of the future recovery approach to a later stage, once the new baseline and data layout had been defined.

## 4. Choices for the New Windows Installation

I selected Windows 11 Pro as the new operating system. A clean installation would become the starting point for the research environment.

The installation and regional choices were:

| Setting                                   | Choice                     |
| ----------------------------------------- | -------------------------- |
| Windows installation and display language | English (United Kingdom)   |
| Region, time, and currency                | Korea                      |
| Keyboard                                  | Korean Type 3              |
| OOBE account                              | Personal Microsoft account |

I wanted the Windows interface in British English while keeping regional settings appropriate for use in Korea. I selected Korean Type 3 because Shift+Space is my preferred Korean/English toggle.

At this stage, I kept the work focused on the operating-system installation and basic device checks. The research and development stack would follow later.

## 5. What the USB Installation Media Was Missing

Wi-Fi was not immediately available during setup, so network connectivity was not available from the outset. Separately, the first USB installation media had not been created completely. Network support and installation-media integrity therefore needed to be checked as distinct issues.

It contained boot files but none of the Windows installation-image payloads: `install.wim`, `install.esd`, or `install.swm`. The presence of boot files was not enough to establish that the USB drive was ready to install Windows.

The second USB drive contained split WIM files in the `install.swm` format. **FAT32 has a single-file size limit, so installation images can be stored as split WIM files.** The absence of a single `install.wim` therefore did not make this second drive incomplete. I verified that the installation-image payload was present and accepted the media.

Windows installation then proceeded normally with the second USB drive. The practical lesson was to treat network support and the actual contents of the installation media as separate checks.

## 6. Updates and Device Validation

After the clean installation, I completed Windows Update. Device Manager showed no unknown devices or devices reporting problems.

Samsung, NVIDIA, and Intel hardware was recognised successfully through the normal update process. The result recorded here is the healthy final device state; I did not attribute every vendor component to Windows Update alone.

These checks covered the operating system and hardware recognition. A recognised GPU was not a validation of CUDA or PyTorch workloads. That research stack had not yet been installed.

## 7. How the Implementation Sequence Changed

The roadmap in the first architecture note remains a snapshot of the original design. During implementation, the combined step of **building the Windows research baseline and pre-checking WSL2** became several smaller stages.

The sequence now starts with a clean OS baseline, continues with storage and everyday productivity configuration, and then moves towards the research and development stack and WSL2 pre-check. Replacing the operating system had already required separate decisions about licensing, recovery, installation media, and device health. Giving that work its own stage made the implementation record more precise.

The state reached in this phase was:

- A clean Windows 11 Pro installation
- Windows Update completed
- Healthy hardware recognition, with no unknown or problem devices
- A baseline before installing the research and development stack
- Readiness for storage and data-layout customisation

I had moved beyond deciding what to retain from the old master image and established a clear Clean Windows Baseline against which to compare subsequent changes. The next Storage and Productivity Baseline note builds on this foundation by separating the operating system from user and research data, then configuring the storage layout and productivity tools needed for everyday work.
