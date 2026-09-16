---
title: "Building the Storage and Productivity Baseline"
description: "Separating Windows from user and research data, relocating Known Folders, selecting productivity tools, configuring Samsung hardware, and recording the baseline before installing the research stack."
lang: en
translationKey: storage-productivity-baseline
pubDatetime: 2026-09-16T00:00:00+09:00
tags:
  - research-journey
  - windows
  - workstation
  - storage
  - productivity
featured: false
draft: false
---

In “Building a Clean Windows Baseline”, I replaced the original corporate master image with Windows 11 Pro, completed updates, and confirmed healthy device recognition.

Before installing development tools, I wanted to settle the daily working environment and the location of its data. That meant deciding what an OS reinstallation should replace, what it should preserve, and whether everyday file storage depended on a cloud service unavailable in the target workplace.

In this stage, I refined the original architecture's storage plan around the workstation's actual working and recovery requirements.

## 1. Moving beyond `C:\OfflineLab\`

The initial plan gathered installers and research assets around `C:\OfflineLab\`. That was a simple place to manage them, but keeping large models and datasets on the OS volume would increase the amount of data that needed attention during C: recovery.

I decided to **separate the lifecycles of the OS and applications, user data, and research assets**, and to give future local recovery material its own location. Windows, the user profile, and applications would remain on C:. Everyday files, research assets, and a future recovery image would live on D:.

| Area                 | Initial design              | Location chosen during this build         |
| -------------------- | --------------------------- | ----------------------------------------- |
| Offline-ready assets | Centred on `C:\OfflineLab\` | `D:\Lab\OfflineLab\`                      |
| Models and datasets  | Grouped inside OfflineLab   | `D:\Lab\Models\`, `D:\Lab\Datasets\`      |
| Everyday user files  | Location not yet specified  | `D:\UserData\`                            |
| Recovery image       | Recovery capability planned | `D:\Recovery\GoldenResearch.wim` reserved |

This gives me a clearer basis for a future procedure that restores only C:, preserving research data on D: during OS reinstallation. It also lets large research assets and the recovery image share the available capacity on D:.

## 2. Device Encryption before Partitioning

BitLocker had not been active on the old master image. After the clean installation, however, I found that BitLocker / Device Encryption was unexpectedly enabled. I did not establish when or why it had been enabled.

The target on-site company does not require BitLocker. I also wanted to keep the planned recovery flow through internal WinRE and `D:\Recovery\GoldenResearch.wim` straightforward. For this workstation's use case, I deliberately disabled BitLocker and waited for **full decryption before changing the partitions**.

The verified final state was:

```text
BitLocker Version: None
Conversion Status: Fully Decrypted
Percentage Encrypted: 0.0%
Encryption Method: None
Protection Status: Protection Off
Key Protectors: None Found
```

I checked more than whether protection was off: the conversion status was Fully Decrypted and the encrypted percentage was 0.0%. That was the starting condition for the storage changes.

## 3. A 350GB C: Volume and D: Data

After confirming decryption, I shrank C: to 350GB and created D: from the remaining space. These were the three commands used to change the storage layout:

```powershell
Resize-Partition -DriveLetter C -Size 350GB
New-Partition -DiskNumber 0 -UseMaximumSize -DriveLetter D
Format-Volume -DriveLetter D -FileSystem NTFS -NewFileSystemLabel "Data" -Confirm:$false
```

Disk 0 remained the Samsung 1TB NVMe SSD using GPT. All partitions were reported as healthy / OK after the work.

| Partition | Size     | File system and purpose                                   |
| --------- | -------- | --------------------------------------------------------- |
| EFI       | 200MB    | System boot                                               |
| MSR       | 16MB     | Microsoft Reserved                                        |
| C:        | 350GB    | NTFS; Windows and applications                            |
| D: Data   | 602.78GB | NTFS; user and research data, and a future recovery image |
| Recovery  | 900MB    | Recovery partition created by the Windows installation    |

At the time of recording, C: had approximately 270.7GB free. D: was almost entirely free when created. These figures describe the baseline before further tools and research assets are added.

I retained the 900MB Recovery partition created by the Windows installation and did not create a separate large partition for the recovery image.

## 4. Three Roles for D:

The top level of D: separates `UserData`, `Lab`, and `Recovery`. Everyday files, research assets, and OS recovery material each have a defined location.

```text
D:\
├─ UserData\
│  ├─ Desktop\
│  ├─ Documents\
│  ├─ Downloads\
│  ├─ Pictures\
│  ├─ Music\
│  └─ Videos\
├─ Lab\
│  ├─ Research\
│  ├─ Models\
│  ├─ Datasets\
│  ├─ OfflineLab\
│  │  ├─ installers\
│  │  ├─ wheelhouse\
│  │  ├─ vscode-extensions\
│  │  ├─ repos\
│  │  ├─ docs\
│  │  ├─ manifests\
│  │  └─ backups\
│  └─ WSL\
└─ Recovery\
```

Within `Lab`, research work, large models and datasets, and OfflineLab material for rebuilding the environment have separate locations. The `WSL` directory is also reserved for a later stage. Creating these directories does not mean that WSL2 is installed or that research assets have already been collected.

`D:\Recovery\` is reserved for a future `GoldenResearch.wim`. The plan is to use the internal Windows Recovery Environment with the WIM on D:. Neither WIM creation nor recovery validation was completed in this phase.

Avoiding a large, fixed recovery partition leaves capacity available for the actual sizes of research data and the recovery image, rather than setting aside space that may remain unused.

C: and D: are still on the same physical SSD. **This is a local rollback design for OS or software corruption; it does not protect against physical SSD failure.** External HDD or USB storage is not practical in the target company environment, which is why I chose this local recovery arrangement.

## 5. Relocating Known Folders from OneDrive

After OOBE with a personal Microsoft account, I inspected the Known Folder paths in the registry. Desktop, Documents, and Pictures already pointed into OneDrive. Music, Videos, and Downloads remained under the local profile.

| Known Folder | Observed location                    | New location            |
| ------------ | ------------------------------------ | ----------------------- |
| Desktop      | `C:\Users\<user>\OneDrive\Desktop`   | `D:\UserData\Desktop`   |
| Documents    | `C:\Users\<user>\OneDrive\Documents` | `D:\UserData\Documents` |
| Downloads    | Under the local profile              | `D:\UserData\Downloads` |
| Pictures     | `C:\Users\<user>\OneDrive\Pictures`  | `D:\UserData\Pictures`  |
| Music        | Under the local profile              | `D:\UserData\Music`     |
| Videos       | Under the local profile              | `D:\UserData\Videos`    |

OneDrive is blocked in the target company environment, so it was not a useful dependency for everyday file management on this workstation. I moved all six Known Folders to D: and detached them from OneDrive before removing OneDrive itself.

The user profile and AppData remain on C:. Moving the entire profile would add unnecessary compatibility risk around the paths expected by Windows, Microsoft Store, and applications. Relocating the Known Folders was sufficient to separate the user files I wanted to preserve.

## 6. Selective Windows Cleanup

The aim was not aggressive debloating. I removed consumer and personal apps that were unnecessary for this baseline while retaining Windows, Store, hardware integration, runtime, and codec components.

The removed apps included:

- Phone Link, Clipchamp, Bing News, Bing Weather, and Solitaire
- Gaming / Xbox app components where removable, and the Zune / Music app
- New Outlook, Teams, Power Automate Desktop, To Do, Sticky Notes, and Office Hub
- Get Help, Feedback Hub, Quick Assist, Alarms, Sound Recorder, and Dev Home

I deliberately preserved:

- Microsoft Store, App Installer / winget, Windows Terminal, Edge, and Windows Security
- Calculator, Notepad, Paint, Snipping Tool, Photos, and Camera
- Windows App Runtime, UI.Xaml / VCLibs, WebView / Win32WebViewHost-related runtimes, and core Windows shell and runtime packages
- Windows AI / AIFabric / WindowsWorkload components, Intel OpenVINO, and Intel graphics and connectivity components
- NVIDIA Control Panel, Dolby components, and media codecs

An unfamiliar package name or a component I was not yet using was not enough reason to remove it. I kept the cleanup limited so that the foundations for later NPU, GPU, and application use remained available.

## 7. Productivity Tools and Browser Roles

The installations in this phase supported document work and research reading.

| Tool                       | Role in this baseline                                             |
| -------------------------- | ----------------------------------------------------------------- |
| Microsoft 365              | Document work through a school / student licence                  |
| 7-Zip                      | Archive management                                                |
| Zotero                     | Papers and reference management                                   |
| Firefox + Zotero Connector | Preferred browser for personal research and collecting references |
| Google Chrome              | Web compatibility checks and testing                              |
| Edge                       | Retained as the default browser                                   |

I prefer **Firefox** for personal research and installed the **Zotero Connector** there. Chrome remains mainly for checking web compatibility.

Edge remains the default because I expect corporate sites and security modules to be more likely to support Chromium / Edge reliably. This is the compatibility consideration behind the default, rather than a claim that all target corporate sites have already been tested.

## 8. Finding the Samsung Controls

Some settings needed more than the standard Windows interface. I installed and used **Samsung Device Care**, but it alone did not expose the battery and performance controls I needed. **Samsung Settings** was also difficult to find directly, so I used **Galaxy Book Experience** to find and install it.

Samsung Settings remained necessary for hardware-specific controls such as battery protection and performance mode. Removing every Samsung app would therefore have been unhelpful. My approach also allowed Samsung Update and related support apps to remain where useful.

Because the laptop will normally stay connected to AC power, I set **Battery Protection** to 60%. I used **High Performance** mode temporarily during the heavy installation and build work. Normal or optimised mode can be used for everyday work after setup.

This completed the configuration for the intended working conditions. It was not a measurement of performance gains or battery longevity.

## 9. What `winget export` Could Not Record

Initially, I expected `winget export` to be the main installation record. In practice, many packages could not be exported because they were unavailable from a configured winget source. These included several Samsung, Intel, and NVIDIA packages, as well as Microsoft Store apps, Windows components, codecs, and OEM packages.

`winget export` is useful for packages that can be mapped back to package sources, but it is not a complete snapshot of a Windows installation. I therefore expanded the record beyond the export to include the observed installed state and system settings.

The baseline manifests were saved under `D:\Lab\OfflineLab\manifests\`.

| File                                           | Purpose                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| `winget-productivity-baseline.json`            | Packages that could be exported with a winget source association |
| `winget-list-productivity-baseline.txt`        | Installed packages reported by winget                            |
| `appx-productivity-baseline.txt`               | AppX package inventory                                           |
| `installed-programs-productivity-baseline.txt` | Classic installed-program inventory                              |
| `system-baseline.txt`                          | System baseline                                                  |
| `storage-baseline.txt`                         | Storage baseline                                                 |
| `known-folders-baseline.txt`                   | Actual Known Folder paths                                        |

These records complement one another. Source matching, AppX packages, classic installed programs, and system and storage settings describe different parts of the environment. Keeping them together gives a more faithful basis for comparing the actual baseline, including items missing from the winget export.

An inventory does not make every package automatically reinstallable. This phase broadened the evidence available for rebuilding; collecting installers and preparing the recovery image remain later work.

## 10. Ready for the Research Development Layer

User files now belong under `D:\UserData\`, research assets under `D:\Lab\`, and the future recovery image under `D:\Recovery\`. Windows, the user profile and AppData, and applications remain on C:.

The implementation has made more than the folder names explicit. It defines which data should survive a C: recovery, removes the dependency on an unavailable OneDrive service, and records the installed state through several complementary manifests. Unnecessary consumer apps have been removed, productivity tools installed, browser roles defined, and Samsung battery and performance settings configured.

**Git, the VS Code research configuration, Python, uv, Jupyter, WSL2, CUDA, PyTorch, Ollama, llama.cpp, and local LLMs have not yet been installed or configured.** They belong to later notes in the series.

The workstation can now support everyday document work and research reading, with a recorded baseline against which to compare the next set of changes. The next task is to build the Windows-native research development environment on that foundation.
