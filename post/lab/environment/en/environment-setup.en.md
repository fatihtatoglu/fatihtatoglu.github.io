---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T20:43:39Z
permalink: ./en/lab/environment/setup.html
language: en

title: Host Setup
header: Host Setup
tags: windows choco chocolatey powershell hyper-v environment_setup

category: lab
group: environment
groupTitle: Development Environment
order: 1
---

Despite all the pressure from my teammates and friends, I still use Microsoft Windows as a workplace. I don't know why, but I feel comfortable using Windows. However, I use Windows with Powershell, like a Unix-based OS.

🔥 This note is written for Windows 10 Enterprise and newer versions of Microsoft Windows Enterprise.

## Package Manager

First, the environment needs a package manager to install the required applications, like MacOS or Linux distros. I select Chocolatey, but the Winget can also be used.

By default, the Winget has been installed if the OS is the latest version of Windows 10 or any version of Windows 11.

```powershell
PS C:\Users\Fatih Tatoğlu> Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

## Windows Features

I use virtual machines for development rather than installing all the development tools into the host machine. By doing this, I can have a portable and different environment at the same time.

I prefer Hyper-V because it is the best fit for Windows virtualization. However, the Virtualbox or other virtualization application or system can be used.

```powershell
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-All" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Tools-All" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Powershell" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Hypervisor" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Services" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Clients" -NoRestart
```

## Required Software

Usually, I don't use a lot of programs in my daily routines. However, I need some additional software. In addition, office programs like Excel, Word, PowerPoint, etc, have already been installed on my computer during work.

```powershell
choco install slack zoom googlechrome notepadplusplus gimp spotify speedtest everything winrar powershell-core -y
```

If the Winget wants to be used, the below command can be applied.

```powershell
PS C:\Users\Fatih Tatoğlu> winget install SlackTechnologies.Slack --accept-package-agreements --accept-source-agreements
PS C:\Users\Fatih Tatoğlu> winget install Zoom.zoom --accept-package-agreements --accept-source-agreements
PS C:\Users\Fatih Tatoğlu> winget install Google.Chrome --accept-package-agreements --accept-source-agreements
PS C:\Users\Fatih Tatoğlu> winget install Notepad++.Notepad++ --accept-package-agreements --accept-source-agreements
PS C:\Users\Fatih Tatoğlu> winget install GIMP.GIMP --accept-package-agreements --accept-source-agreements
PS C:\Users\Fatih Tatoğlu> winget install Spotify.Spotify --accept-package-agreements --accept-source-agreements
PS C:\Users\Fatih Tatoğlu> winget install voidTools.Everything --accept-package-agreements --accept-source-agreements
PS C:\Users\Fatih Tatoğlu> winget install RARLab.winrar --accept-package-agreements --accept-source-agreements
PS C:\Users\Fatih Tatoğlu> winget install Microsoft.Powershell --accept-package-agreements --accept-source-agreements
```

For more applications, the Chocolatey Package Repository or Winget `search` command should be used.

## Little Touch

I arrange some little touches to my host environment. After the below commands executes to apply, run the `Restart-Computer` command.

### Disabling UAC

```powershell
PS C:\Users\Fatih Tatoğlu> New-ItemProperty -Path HKLM:Software\Microsoft\Windows\CurrentVersion\policies\system -Name EnableLUA -PropertyType DWord -Value 0 -Force
```

### Folder Appearance Settings

```powershell
PS C:\Users\Fatih Tatoğlu> Push-Location
PS C:\Users\Fatih Tatoğlu> Set-Location HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced
PS C:\Users\Fatih Tatoğlu> Set-ItemProperty . HideFileExt "0"
PS C:\Users\Fatih Tatoğlu> Set-ItemProperty . Hidden "1"
PS C:\Users\Fatih Tatoğlu> Pop-Location
```
