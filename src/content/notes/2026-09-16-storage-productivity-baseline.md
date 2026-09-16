---
title: "Storage & Productivity Baseline 구축"
description: "Clean Windows 설치 후 OS와 데이터를 분리하고, Known Folder 이동, 선택적 앱 정리, 생산성 도구와 Samsung 설정, 시스템 목록 기록을 통해 연구도구 설치 전의 기준 상태를 만듭니다."
lang: ko
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

앞선 「Clean Windows Baseline 구축」에서는 기존 기업 마스터 이미지를 정리하고, 업데이트와 장치 인식이 정상인 Windows 11 Pro를 기준으로 삼았습니다.

이번에는 개발도구를 설치하기 전에 매일 사용할 환경과 데이터의 위치를 먼저 정리했습니다. OS를 다시 설치할 때 무엇을 지우고 무엇을 남길지, 회사에서 사용할 수 없는 클라우드 서비스에 일상적인 파일 저장이 의존하고 있지는 않은지 확인하는 작업이었습니다.

이번 단계에서는 첫 아키텍처의 저장소 구상을 실제 사용과 복구 조건에 맞춰 구체화했습니다.

## 1. `C:\OfflineLab\`에서 OS와 데이터의 분리로

처음에는 설치파일과 연구자산을 `C:\OfflineLab\` 중심으로 모으려 했습니다. 한곳에서 관리하기에는 단순하지만, OS와 큰 모델·데이터셋을 같은 볼륨에 두면 C:를 복구할 때 보존해야 할 데이터의 범위가 커집니다.

실제 구축에서는 **OS·애플리케이션과 사용자 데이터, 연구자산의 수명주기를 분리**하고, 향후 로컬 복구 자료의 위치도 따로 정하기로 했습니다. Windows, 사용자 프로필과 애플리케이션은 C:에 두고, 일상적인 파일과 연구자산, 향후 복구 이미지는 D:에 두는 구조입니다.

| 영역                 | 초기 설계              | 이번 구축에서 정한 위치               |
| -------------------- | ---------------------- | ------------------------------------- |
| Offline-ready 자산   | `C:\OfflineLab\` 중심  | `D:\Lab\OfflineLab\`                  |
| 모델·데이터셋        | OfflineLab 아래에 통합 | `D:\Lab\Models\`, `D:\Lab\Datasets\`  |
| 일상적인 사용자 파일 | 구체적인 위치 미정     | `D:\UserData\`                        |
| 복구 이미지          | 복구 체계 마련 예정    | `D:\Recovery\GoldenResearch.wim` 예약 |

이렇게 하면 향후 C:만 복구하는 절차를 설계할 수 있고, D:의 연구 데이터를 유지하면서 OS를 재설치하기에도 수월합니다. 대용량 연구자산과 복구 이미지가 D:의 여유 공간을 함께 활용할 수 있다는 점도 선택의 이유였습니다.

## 2. 파티션 작업 전에 발견한 Device Encryption

기존 마스터 이미지에서는 BitLocker가 활성화돼 있지 않았습니다. 그런데 Clean Windows 설치 후 확인 과정에서 예상하지 않았던 BitLocker / Device Encryption 활성화 상태를 발견했습니다. 정확히 언제, 어떤 계기로 활성화됐는지는 확인하지 못했습니다.

실제 사용할 회사 환경에서는 BitLocker를 필수로 요구하지 않았습니다. 또한 향후 내부 WinRE와 `D:\Recovery\GoldenResearch.wim`을 이용하는 복구 흐름을 단순하게 유지하려 했습니다. 이 장비의 사용 조건에 맞춰 BitLocker를 해제하고, **드라이브 복호화가 완전히 끝난 뒤** 파티션을 변경하기로 했습니다.

최종적으로 확인한 상태는 다음과 같습니다.

```text
BitLocker Version: None
Conversion Status: Fully Decrypted
Percentage Encrypted: 0.0%
Encryption Method: None
Protection Status: Protection Off
Key Protectors: None Found
```

보호가 꺼졌는지만 확인한 것이 아니라, 암호화 비율이 0.0%이고 변환 상태가 Fully Decrypted인 것까지 확인했습니다. 이 상태를 저장소 변경의 출발점으로 삼았습니다.

## 3. C: 350GB와 D: Data 구성

복호화를 확인한 뒤 C:를 350GB로 줄이고, 남은 공간으로 D:를 만들었습니다. 실제 상태 변경에 사용한 명령은 다음 세 가지입니다.

```powershell
Resize-Partition -DriveLetter C -Size 350GB
New-Partition -DiskNumber 0 -UseMaximumSize -DriveLetter D
Format-Volume -DriveLetter D -FileSystem NTFS -NewFileSystemLabel "Data" -Confirm:$false
```

작업 후 Disk 0은 Samsung NVMe 1TB / GPT 구성을 유지했고, 파티션 상태는 모두 정상으로 확인됐습니다.

| 파티션   | 크기     | 파일 시스템·용도                            |
| -------- | -------- | ------------------------------------------- |
| EFI      | 200MB    | 시스템 부팅                                 |
| MSR      | 16MB     | Microsoft Reserved                          |
| C:       | 350GB    | NTFS, Windows와 애플리케이션                |
| D: Data  | 602.78GB | NTFS, 사용자·연구 데이터와 향후 복구 이미지 |
| Recovery | 900MB    | Windows 설치 후 생성된 Recovery 파티션      |

기록 시점에 C:의 여유 공간은 약 270.7GB였고, D:는 생성 직후 거의 비어 있었습니다. 이 수치는 앞으로 도구와 연구자산이 추가되기 전의 기준값입니다.

Windows 설치 후 생성된 900MB Recovery 파티션은 유지했습니다. 복구 이미지용으로 별도의 큰 파티션을 만들지는 않았습니다.

## 4. D:의 세 가지 역할

D:의 최상위는 `UserData`, `Lab`, `Recovery`로 나눴습니다. 일상적인 파일, 연구자산, OS 복구 자료를 서로 구분하기 위한 구조입니다.

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

`Lab` 안에서도 연구 작업, 큰 모델·데이터셋, 재구축에 필요한 OfflineLab 자산의 위치를 나눴습니다. `WSL` 경로 역시 이후 단계를 위한 자리이며, 폴더를 마련한 것이 WSL2 설치나 연구자산 준비의 완료를 의미하지는 않습니다.

`D:\Recovery\`에는 향후 `GoldenResearch.wim`을 보관할 예정입니다. 내부 Windows Recovery Environment에서 D:의 WIM을 이용해 복구할 계획이며, 이번 단계에서 WIM 생성이나 복구 검증을 완료한 것은 아닙니다.

큰 복구 파티션을 고정 크기로 떼어 두지 않으면 사용하지 않는 공간을 묶어 두지 않아도 됩니다. 연구 데이터와 복구 이미지의 실제 크기에 맞춰 D:의 용량을 유연하게 사용할 수 있습니다.

다만 C:와 D:는 같은 물리 SSD에 있습니다. **이 구성은 OS나 소프트웨어 손상에 대비한 로컬 롤백 설계이며, 물리적인 SSD 고장에 대한 보호 수단은 아닙니다.** 대상 회사 환경에서는 외장 HDD나 USB 저장장치를 실용적인 복구 경로로 사용하기 어려워 이 방식을 선택했습니다.

## 5. Known Folder와 OneDrive 의존성 정리

개인 Microsoft 계정으로 OOBE를 마친 뒤 레지스트리에서 Known Folder 경로를 확인했습니다. Desktop, Documents, Pictures는 이미 OneDrive 아래를 가리키고 있었습니다. Music, Videos, Downloads는 로컬 프로필 아래에 남아 있었습니다.

| Known Folder | 확인한 기존 위치                     | 변경한 위치             |
| ------------ | ------------------------------------ | ----------------------- |
| Desktop      | `C:\Users\<user>\OneDrive\Desktop`   | `D:\UserData\Desktop`   |
| Documents    | `C:\Users\<user>\OneDrive\Documents` | `D:\UserData\Documents` |
| Downloads    | 로컬 프로필 아래                     | `D:\UserData\Downloads` |
| Pictures     | `C:\Users\<user>\OneDrive\Pictures`  | `D:\UserData\Pictures`  |
| Music        | 로컬 프로필 아래                     | `D:\UserData\Music`     |
| Videos       | 로컬 프로필 아래                     | `D:\UserData\Videos`    |

실제 사용할 회사 환경에서는 OneDrive가 차단돼 있으므로, 이 경로에 일상적인 파일 관리를 의존할 이유가 없었습니다. 여섯 Known Folder를 모두 D:로 이동하고 OneDrive 연결을 정리한 뒤 OneDrive를 제거했습니다.

사용자 프로필 자체와 AppData는 C:에 유지했습니다. 프로필 전체를 옮기면 Windows, Microsoft Store와 애플리케이션이 기대하는 경로와의 호환성을 불필요하게 복잡하게 만들 수 있습니다. 보존하려는 사용자 파일을 Known Folder 단위로 분리하는 것으로 이번 목적을 충족했습니다.

## 6. 필요한 구성요소를 남기는 Windows 정리

앱 정리의 기준은 공격적인 debloat가 아니었습니다. 일상적인 업무와 연구에 필요하지 않은 소비자용·개인용 앱을 정리하되, Windows와 Store, 하드웨어 통합, 런타임과 코덱은 유지했습니다.

제거한 앱에는 다음이 포함됩니다.

- Phone Link, Clipchamp, Bing News, Bing Weather, Solitaire
- 제거 가능한 Gaming / Xbox 앱 구성요소, Zune / Music 앱
- New Outlook, Teams, Power Automate Desktop, To Do, Sticky Notes, Office Hub
- Get Help, Feedback Hub, Quick Assist, Alarms, Sound Recorder, Dev Home

반대로 다음 구성요소는 의도적으로 남겼습니다.

- Microsoft Store, App Installer / winget, Windows Terminal, Edge, Windows Security
- Calculator, Notepad, Paint, Snipping Tool, Photos, Camera
- Windows App Runtime, UI.Xaml / VCLibs, WebView / Win32WebViewHost 관련 런타임, 핵심 Windows shell·runtime 패키지
- Windows AI / AIFabric / WindowsWorkload 구성요소, Intel OpenVINO와 Intel 그래픽·연결 구성요소
- NVIDIA Control Panel, Dolby 구성요소, 미디어 코덱

앱 이름이 낯설거나 아직 직접 사용하지 않는다는 이유만으로 제거하지는 않았습니다. 이후 사용할 NPU·GPU와 애플리케이션의 기반을 보존하는 쪽으로 정리 범위를 제한했습니다.

## 7. 생산성 도구와 브라우저의 역할

이 단계에서는 문서 작업과 자료 조사에 필요한 도구를 설치했습니다.

| 도구                       | 이번 기준 상태에서의 역할                      |
| -------------------------- | ---------------------------------------------- |
| Microsoft 365              | 학교·학생 라이선스를 이용한 문서 작업          |
| 7-Zip                      | 압축파일 관리                                  |
| Zotero                     | 논문과 참고문헌 관리                           |
| Firefox + Zotero Connector | 개인 연구와 자료 수집에 우선 사용하는 브라우저 |
| Google Chrome              | 웹 호환성 확인과 테스트                        |
| Edge                       | 기본 브라우저 유지                             |

개인 연구용으로는 **Firefox**를 선호하고, **Zotero Connector**도 Firefox에 설치했습니다. Chrome은 주로 웹 호환성을 확인하는 용도로 남겼습니다.

기본 브라우저는 Edge를 유지했습니다. 기업 사이트와 보안 모듈은 Chromium / Edge를 기준으로 지원할 가능성이 높다고 판단했기 때문입니다. 이는 실제 회사 환경에서 모든 사이트의 동작을 검증했다는 의미가 아니라, 기본값을 정할 때 고려한 호환성 기준입니다.

## 8. Samsung 설정을 찾는 과정

일반적인 Windows 설정만으로 끝나지 않는 부분도 있었습니다. **Samsung Device Care**를 설치해 사용했지만, 그것만으로는 필요한 배터리·성능 제어 항목을 찾을 수 없었습니다. **Samsung Settings**도 직접 찾기가 쉽지 않아, **Galaxy Book Experience**를 통해 찾아 설치했습니다.

Samsung Settings는 배터리 보호와 성능 모드처럼 장비에 특화된 설정에 필요했습니다. 따라서 Samsung 앱을 일괄 제거하는 방식은 맞지 않았고, Samsung Update와 관련 지원 앱도 필요한 경우 유지하는 기준으로 정리했습니다.

이 노트북은 대부분 AC 전원에 연결해 사용할 예정이므로 **Battery Protection**을 60%로 설정했습니다. 설치와 구축 작업이 집중되는 동안에는 **High Performance** 모드를 임시로 사용했습니다. 구축 이후의 일상적인 사용에서는 일반·최적화 모드를 사용할 수 있습니다.

여기서 완료한 것은 장비의 사용 조건에 맞춘 설정입니다. 성능 향상이나 배터리 수명에 대한 측정 결과를 얻은 단계는 아닙니다.

## 9. `winget export`만으로는 남지 않는 상태

처음에는 `winget export`를 설치 목록의 중심으로 생각했습니다. 하지만 실제 내보내기에서는 구성된 winget source에서 찾을 수 없는 패키지가 많았습니다. 여러 Samsung, Intel, NVIDIA 패키지와 Microsoft Store 앱, Windows 구성요소, 코덱, OEM 패키지가 여기에 포함됐습니다.

`winget export`는 패키지 source와 대응되는 항목을 기록하는 데 유용하지만, 실제 Windows 설치 전체의 스냅샷은 아닙니다. 따라서 내보내기 목록에 더해 실제 설치 상태와 시스템 설정도 함께 남기도록 기록 범위를 넓혔습니다.

기준 상태의 기록은 `D:\Lab\OfflineLab\manifests\`에 저장했습니다.

| 파일                                           | 기록 목적                                         |
| ---------------------------------------------- | ------------------------------------------------- |
| `winget-productivity-baseline.json`            | winget source와 연결해 내보낼 수 있는 패키지 목록 |
| `winget-list-productivity-baseline.txt`        | winget이 표시하는 설치 목록                       |
| `appx-productivity-baseline.txt`               | AppX 패키지 목록                                  |
| `installed-programs-productivity-baseline.txt` | 전통적인 설치 프로그램 목록                       |
| `system-baseline.txt`                          | 시스템 기준 상태                                  |
| `storage-baseline.txt`                         | 저장소 기준 상태                                  |
| `known-folders-baseline.txt`                   | Known Folder의 실제 경로                          |

이 기록들은 서로 대체 관계가 아닙니다. 패키지 source와의 연결 여부, AppX와 일반 프로그램의 설치 목록, 시스템과 저장소 설정은 각각 다른 측면을 보여 줍니다. 함께 보관하면 winget export에서 빠진 항목까지 포함해 실제 기준 상태를 더 충실하게 비교할 수 있습니다.

목록을 확보했다고 모든 패키지를 자동으로 재설치할 수 있는 것은 아닙니다. 이번 단계에서는 재구축할 때 확인할 근거를 넓혔고, 설치파일 확보와 복구 이미지 구성은 이후 작업으로 남겼습니다.

## 10. 연구 개발 계층을 올리기 전의 기준점

이번 작업을 통해 사용자 파일은 `D:\UserData\`, 연구자산은 `D:\Lab\`, 향후 복구 이미지는 `D:\Recovery\`로 역할을 나눴습니다. C:에는 Windows, 사용자 프로필과 AppData, 애플리케이션을 유지했습니다.

초기 설계보다 구체화된 부분은 폴더 이름만이 아닙니다. C: 복구 시 보존할 데이터의 경계를 정했고, 사용할 수 없는 OneDrive에 대한 의존성을 정리했으며, 실제 설치 상태를 여러 종류의 manifest로 남겼습니다. 불필요한 소비자용 앱을 제거하고, 생산성 도구와 브라우저 역할, Samsung 배터리·성능 설정까지 마련했습니다.

**Git, VS Code 연구 설정, Python, uv, Jupyter, WSL2, CUDA, PyTorch, Ollama, llama.cpp와 로컬 LLM은 아직 설치·구성하지 않았습니다.** 해당 연구 개발 계층은 이후 노트에서 다룰 예정입니다.

이제 일상적인 문서 작업과 자료 조사를 할 수 있고, 다음 설치 단계에서 무엇이 바뀌는지 비교할 기준도 생겼습니다. 다음 작업은 이 기준 위에 Windows Native 연구 개발환경을 구성하는 것입니다.
