---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T20:43:39Z
permalink: ./lab/windows/ortam-kurulumu.html
language: tr

title: Windows - Ortam Kurulumu
header: Windows - Ortam Kurulumu
description: Bütün baskılara rağmen hala Windows makine kullanıyorum. Bu makinede istediklerimi yapmak için ön hazırlık yapmam gerekiyor.
tags: windows choco chocolatey powershell hyper-v ortam_kurulumu
---

Arkadaşlarımın bütün baskılarına rağmen hala Windows makine kullanıyorum. Bu makinede istediklerimi yapmak için ön hazırlık yapmam gerekiyor. Bu notumda ana windows makinemin geliştirme ortamını nasıl hazırlıyorum onu anlatmaya çalışacağım.

## Chocolatey

Öncelikle makineme gereken kurulumları yapabilmek için tıpkı MacOS ya da Linux dağıtımlarında olduğu gibi bir paket yöneticisine ihtiyacım var. Bunun için en aşağıdaki komut ile chocolatey'i yükleniyor.

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Kurulum tamamlandıktan sonra diğer adımlar için **PowerShell** ve **Chocolatey** ile devam ediyor olacağım.

## Windows Özellikleri

Geliştirme yapmak için ana makinemi kullanmak yerine daha çok sanal makine kullanıyorum. Bu sayede hem taşınabilir hem de istediğim her makinede çalışabilir bir geliştirme ortamım oluyor. Bunu sağlamak için ilk yapmam gereken Windows içindeki Hyper-V modülünü etkinleştirmek.

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-All" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Tools-All" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Powershell" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Hypervisor" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Services" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Clients" -NoRestart
```

## Gereken Yazılımlar

Normal kullanım için genelde çok yazılım kullanmıyorum. Zaten office programlarının çoğu yüklü geliyor ya da sonradan yüklüyorum. Ama diğer kalan yazılımlar için sadece aşağıdaki komutu çalıştırmam yeterli oluyor.

```powershell
choco install slack zoom googlechrome notepadplusplus gimp spotify speedtest everything winrar powershell-core -y
```

Benim yüklemelerim bu şekilde eğer ek yüklemek istediğiniz bir yazılım varsa [Chocolatey](https://community.chocolatey.org/packages "Chocolatey Software | Packages") üzerinden bulabilir ve ekleyebilirsiniz.

## Ufak Dokunuşlar

Kullanım sırasında işimi kolaylaştırması için bazı ufak ayarlamalar da yapıyorum. Bunlar için de aşağıdaki komutları çalıştırmam yeterli oluyor.

### UAC Kapatılması

```powershell
New-ItemProperty -Path HKLM:Software\Microsoft\Windows\CurrentVersion\policies\system -Name EnableLUA -PropertyType DWord -Value 0 -Force
```

### Klasör Görünümünün Ayarlanması

```powershell
Push-Location
Set-Location HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced
Set-ItemProperty . HideFileExt "0"
Set-ItemProperty . Hidden "1"
Pop-Location
```
