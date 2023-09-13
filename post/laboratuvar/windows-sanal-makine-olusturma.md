---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T21:28:33Z
permalink: ./lab/windows/sanal-makine-olusturma.html
language: tr

title: Windows - Sanal Makine Oluşturma
header: Windows - Sanal Makine Oluşturma
description: Sanal makine oluşturmak için UI üzerinden çok fazla tıklama yapmam gerekiyor. Bunun yerine bu işlemi powershell ile yapmak daha kolay oluyor.
tags: powershell hyper-v sanal_makine
---

Sanal makine oluşturmak için UI üzerinden çok fazla tıklama yapmam gerekiyor. Bunun yerine bu işlemi powershell ile yapmak daha kolay oluyor. Bu notumda powershell ile sanal makine kurmayı anlatmaya çalışacağım.

## Network Ayarlama

Sanal sunucuların internete erişmesi ve ana makine ile birlikte iletişimde kalabilmesi için network ayarının doğru yapılması gerekiyor. Bu işlem için aşağıdaki komutları çalıştırmak yeterli olacaktır.

```powershell
$natSwitch     = "NATSwitch"
$natIPAddress  = "172.19.85.1"
$natAddress    = "172.19.85.0/24"

New-VMSwitch -SwitchName $natSwitch -SwitchType Internal
New-NetIPAddress -IPAddress $natIPAddress -PrefixLength 24 -InterfaceAlias "vEthernet ($natSwitch)"

New-NetNAT -Name $natSwitch -InternalIPInterfaceAddressPrefix $natAddress

Set-DnsClientServerAddress -InterfaceAlias "vEthernet ($natSwitch)" -ServerAddresses ("8.8.8.8","1.1.1.1")
```

Yukarıdaki komutta **`$natSwitch`** değişkeni sanal network kartının adını belirtmektedir. **`$natIPAddress`** değişkeni sanal networkün IP adresini belirtmektedir. Bu değeri kuracağımız sanal makinelerde gateway olarak ta kullanacağız. **`$natAddress`** değişkeni de sanal networkün gemişliğini belirlemek için kullanılmaktadır. /24 değeri ile 254 tane IP adresi atanabilmesini sağlamış oluyoruz. Bu değeri kuracağımız sanal makinede de 24 olarak giriyor olacağız. Bu sayede aynı network genişliğinde çalışabiliyor olacaklar.

Sanal networke DNS olarak istediğimizi tanımlayabiliriz ben makinemden dışarı çıkarken Google ve CloudFlare DNS lerini tercih ettim.

## Makine Ayarlama

```powershell
$natSwitch = "NATSwitch"
$vmGroup = "fatihtatoglu"
$vmName = "fth-linux"
$workspacePath = "C:\\workspace\\servers\\"

$ramSize  = 2GB 
$diskSize = 50GB


New-VHD -Path "$workspacePath\\$vmGroup\\$vmName\\$vmName.vhdx" -SizeBytes $diskSize -Fixed -BlockSizeBytes 1MB

New-VM -Name $vmName -MemoryStartupBytes $ramSize -BootDevice VHD -VHDPath "$workspacePath\\$vmGroup\\$vmName\\$vmName.vhdx" -Path "$workspacePath\\$vmGroup" -Generation 2 -Switch $natSwitch

Set-VMFirmware $vmName -EnableSecureBoot Off
Set-VMProcessor -VMName $vmName -Count 2
Set-VM -Name $vmName -AutomaticCheckpointsEnabled $false -CheckpointType Disabled
Set-VMMemory -VMName $vmName -DynamicMemoryEnabled $true -MinimumBytes ($ramSize / 16) -StartupBytes ($ramSize / 8) -MaximumBytes $ramSize

Add-VMDvdDrive -VMName $vmName -Path "C:\\workspace\\isos\\linuxmint-20.3-xfce-64bit.iso"

$dvd = Get-VMDVDDrive -VMName $vmName
Set-VMFirmware -VMName $vmName -FirstBootDevice $dvd

$computer = hostname
Start-VM -Name $vmName
Start-Sleep -Seconds 3
vmconnect.exe $computer $vmName
```

Yukarıdaki komut yeni bir sanal makine için sabit bir disk oluşturup, sonrasında makinenin kurulması için gereken tanımları yapıp, sonrasında makineyi çalıştırmaktadır. Bu sayede elle tek tek yapacağım işleri çok daha hızlı olarak yapabilmekteyim.

Parametreleri değiştirerek daha farklı makineler kurulabilir.

## Son Adım

En son adım olarak makinelerin kurulumu bittikten sonra ana makine ile bağlatıyı sağlamak için host dosyasına ekleme yapılması işinizi kolaylaştıracaktır.

```shell
notepad %systemroot%\system32\drivers\etc\hosts
```

## Sanal Makine Ayarı

![Linux Mint Ethernet](../../../image/linux-mint-eth0.png "Linux Mint Ethernet")

Sanal makinenin içerisinde olacak ayarladan da ufak bahsetmem gerekeceğini düşündüm. Görselde görüldüğü gibi **NetMask** ve **Gateway** tanımları sanal network ile aynı olacak şekilde. Sadece dikkat edilmesi gereken konu ise **DNS Server** değerinin ana makinenin gateway değeri olarak güncellenmesi. Bu işlem yapılmadığında sanal makine internete çıkabiliyor ama DNS çözümlemesi yapamıyor. Bununla ilgili olarak bazı denemeler de yaptım ama başarılı olarak çalışan iki denemem oldu.

1. Ana makinenin gateway değerinin DNS olarak girilmesi.
2. Ana makinenin gatewayi ile aynı networkte olan bir DNS sunucusunun DNS olarak tanımlanması.
