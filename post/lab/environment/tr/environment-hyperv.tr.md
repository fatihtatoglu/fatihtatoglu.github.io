---
layout: post
published: true
author: Fatih Tatoğlu
date: 2023-10-27T21:37:00Z
permalink: ./lab/environment/hyperv.html
language: tr

title: Hyper-V ile Sanal Makine Oluşturma
header: Hyper-V ile Sanal Makine Oluşturma
description: Fatih'in alışkanlık ve tercihlerine uygun bir yazılım geliştirme ortamı hazırlamak.
tags: powershell hyper-v sanal_makine

category: lab
group: environment
groupTitle: Geliştirme Ortamı
order: 2
---

Ortam kurulumunun hazırlığını tamamladıktan sonra, geliştirmeye başlamak için bir sanal makineye ihtiyacım var. Birçok butona tıklamak yerine Powershell kullanmayı tercih ediyorum.

## Ağ Ayarlaması

İnternete ulaşmak veya ana bilgisayar ve diğer sanal makinelerle iletişim kurmak için öncelikle ağ ayarları yapılmalıdır.

```powershell
PS C:\Users\Fatih Tatoğlu> $natSwitch     = "NATSwitch"
PS C:\Users\Fatih Tatoğlu> $natIPAddress  = "172.19.85.1"
PS C:\Users\Fatih Tatoğlu> $natAddress    = "172.19.85.0/24"
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> New-VMSwitch -SwitchName $natSwitch -SwitchType Internal
PS C:\Users\Fatih Tatoğlu> New-NetIPAddress -IPAddress $natIPAddress -PrefixLength 24 -InterfaceAlias "vEthernet ($natSwitch)"
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> New-NetNAT -Name $natSwitch -InternalIPInterfaceAddressPrefix $natAddress
```

Yukarıdaki komutlar ile bir virtual switch oluşturulacaktır. Ben `172.19.85.0/24` IP aralığını seçtim ama istek ve ihtiyaçlara göre değiştirilebilir.

## Sanal Makine Oluşturmak

```powershell
PS C:\Users\Fatih Tatoğlu> $natSwitch = "NATSwitch"
PS C:\Users\Fatih Tatoğlu> $vmName = "fth-dev"
PS C:\Users\Fatih Tatoğlu> $workspacePath = "C:\\workspace\\machine\\"
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> $ramSize  = 8GB 
PS C:\Users\Fatih Tatoğlu> $diskSize = 50GB
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> New-VHD -Path "$workspacePath\\$vmName\\$vmName.vhdx" -SizeBytes $diskSize -Fixed -BlockSizeBytes 1MB
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> New-VM -Name $vmName -MemoryStartupBytes $ramSize -BootDevice VHD -VHDPath "$workspacePath\\$vmName\\$vmName.vhdx" -Path "$workspacePath" -Generation 2 -Switch $natSwitch
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> Set-VMFirmware $vmName -EnableSecureBoot Off
PS C:\Users\Fatih Tatoğlu> Set-VMProcessor -VMName $vmName -Count 2
PS C:\Users\Fatih Tatoğlu> Set-VM -Name $vmName -AutomaticCheckpointsEnabled $false -CheckpointType Disabled
PS C:\Users\Fatih Tatoğlu> Set-VMMemory -VMName $vmName -DynamicMemoryEnabled $true -MinimumBytes ($ramSize / 16) -StartupBytes ($ramSize / 8) -MaximumBytes $ramSize
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> Add-VMDvdDrive -VMName $vmName -Path "C:\\workspace\\iso\\linuxmint-21.2-xfce-64bit.iso"
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> $dvd = Get-VMDVDDrive -VMName $vmName
PS C:\Users\Fatih Tatoğlu> Set-VMFirmware -VMName $vmName -FirstBootDevice $dvd
PS C:\Users\Fatih Tatoğlu> Start-VM -Name $vmName
```

Yukarıdaki komutlar ile sanal disk oluşturulacaktır. Daha sonra sanal makine düzenlenir ve son olarak makine başlatılır.

🔥 Parametre değiştirilerek farklı sanal makineler oluşturulabilir. Öte yandan, bu sanal makineler temel ve boş makinelerdir. Ağ ayarlarını manuel olarak ayarlamayı unutmayın.

Aşağıdaki komut uygulanırsa, ana makine konuk makineye bağlanacaktır.

```powershell
PS C:\Users\Fatih Tatoğlu> $computer = hostname
PS C:\Users\Fatih Tatoğlu> vmconnect.exe $computer $vmName
```

## Sanal Makine Ayarları

Sanal makinenin ağ ayarının zor olabileceği farklı senaryoları deneyimleyerek öğrendim. Benim ortamımda, DNS ana bilgisayarın ağ geçidi IP adresi ile aynı atanmalıdır. Örneğin, ana bilgisayarın ağ geçidi IP adresi `192.168.6.1` ise. Sanal makinenin DNS IP adresi `192.168.6.1` olmalıdır. DNS sunucusu IP adresleri, geçerli bir DNS sunucusu bulunmuşsa kullanılabilir.
