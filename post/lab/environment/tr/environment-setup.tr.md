---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T20:43:39Z
permalink: ./lab/environment/setup.html
language: tr

title: Ana Makine Kurulumu
header: Ana Makine Kurulumu
description: Fatih'in alışkanlık ve tercihlerine uygun bir yazılım geliştirme ortamı hazırlamak.
tags: windows choco chocolatey powershell hyper-v ortam_kurulumu

category: lab
order: 1

group: environment
groupTitle: Geliştirme Ortamı Kurulumu
groupImage: ../image/lab-environment.jpg
---

Ekip arkadaşlarımın ve dostlarımın tüm baskılarına rağmen işyeri olarak hala Microsoft Windows kullanıyorum. Neden bilmiyorum ama Windows kullanırken kendimi rahat hissediyorum. Ancak Windows'u Unix tabanlı bir işletim sistemi gibi Powershell ile kullanıyorum.

🔥 Bu not Windows 10 Enterprise ve Microsoft Windows 11 Enterprise'ın daha yeni sürümleri için yazılmıştır.

## Paket Yöneticisi

İlk olarak, ortamın MacOS veya Linux dağıtımları gibi gerekli uygulamaları yüklemek için bir paket yöneticisine ihtiyacı vardır. Ben Chocolatey'i seçiyorum, ancak Winget de kullanılabilir.

Varsayılan olarak, işletim sistemi Windows 10'un en son sürümü veya Windows 11'in herhangi bir sürümü ise Winget yüklenmiştir.

```powershell
PS C:\Users\Fatih Tatoğlu> Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

## Windows Özellikleri

Tüm geliştirme araçlarını ana makineye kurmak yerine geliştirme için sanal makineler kullanıyorum. Bu sayede aynı anda hem taşınabilir hem de farklı bir ortama sahip olabiliyorum.

Hyper-V'yi tercih ediyorum çünkü Windows sanallaştırma için en uygun olanı. Ancak Virtualbox ya da başka bir sanallaştırma uygulaması ya da sistemi de kullanılabilir.

```powershell
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-All" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Tools-All" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Powershell" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Hypervisor" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Services" -NoRestart
PS C:\Users\Fatih Tatoğlu> Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Clients" -NoRestart
```

## Gereken Yazılımlar

Genellikle günlük rutinlerimde çok fazla program kullanmıyorum. Ancak, bazı ek yazılımlara ihtiyacım var. Buna ek olarak, Excel, Word, PowerPoint gibi ofis programları iş sırasında bilgisayarıma zaten yüklenmiş durumda.

```powershell
PS C:\Users\Fatih Tatoğlu> choco install slack zoom googlechrome notepadplusplus gimp spotify speedtest everything winrar powershell-core -y
```

Winget kullanılmak isteniyorsa aşağıdaki komut uygulanabilir.

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

Daha fazla uygulama için Chocolatey Paket Deposu veya Winget `search` komutu kullanılmalıdır.

## Ufak Dokunuşlar

Ana bilgisayar ortamıma bazı küçük dokunuşlar yapıyorum. Aşağıdaki komutları uygulandıktan sonra `Restart-Computer` komutunu çalıştırın.

### UAC'ın Devredışı Bırakılması

```powershell
PS C:\Users\Fatih Tatoğlu> New-ItemProperty -Path HKLM:Software\Microsoft\Windows\CurrentVersion\policies\system -Name EnableLUA -PropertyType DWord -Value 0 -Force
```

### Klasör Görünüm Seçenkleri

```powershell
PS C:\Users\Fatih Tatoğlu> Push-Location
PS C:\Users\Fatih Tatoğlu> Set-Location HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced
PS C:\Users\Fatih Tatoğlu> Set-ItemProperty . HideFileExt "0"
PS C:\Users\Fatih Tatoğlu> Set-ItemProperty . Hidden "1"
PS C:\Users\Fatih Tatoğlu> Pop-Location
```
