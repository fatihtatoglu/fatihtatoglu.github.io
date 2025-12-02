---
id: awe08f1q57
lang: tr
title: Windows'ta Hyper-V ile Linux Mint Geliştirme Ortamı
slug: gelistirme-ortami-kurulumu
category: teknik-notlar
type: guide
tags:
  - windows
  - hyper-v
  - linux-mint
  - gelistirme-ortami
  - sanal-makine
  - docker
  - nodejs
  - go
  - dotnet
  - vscode
readingTime: 20
date: 2022-12-06
updated: 2025-10-28
pair: hyper-v-linux-mint-setup
canonical: ~/gelistirme-ortami-kurulumu/
alternate: ~/en/hyper-v-linux-mint-setup/
description: Windows 10/11’de Hyper-V kullanarak Linux Mint sanal geliştirme ortamı kurma, ağ ayarları, Docker/Node/Go/.NET ve VS Code kurulumu adım adım.
keywords:
  - geliştirme ortamı
  - windows
  - hyper-v
  - linux mint
  - virtual machine
  - docker
  - go
  - nodejs
  - python
  - powershell
featured: true
draft: false
cover: /assets/images/development-environment.webp
coverAlt: Windows üzerinde Hyper-V sanal penceresinde çalışan Linux Mint masaüstü, üzerinde Docker, Python, Go, NodeJS, .NET ve GitHub ikonlarıyla
coverCaption: Windows ana makinede Hyper-V üzerinden izole edilmiş Linux Mint geliştirici ortamı
template: post
layout: default
status: published
---
# Geliştirme Ortamı Kurulumu

Çalışma arkadaşlarımın baskılarına rağmen hala evde, Windows üzerinde Linux sanal makineler kullanarak geliştirmeler yapıyorum. 

Bu konfigürasyon; temiz, izole, farklılaşabilen, taşınabilir ve yedeklenebilir geliştirme ortamları sağlıyor. Bunun yanında ana makineyi temiz tutuyor ve sadece denemek için kurulacak bir kütüphane, uygulama veya aracın ana makinede kalıntı bırakmasının da önüne geçmiş oluyor.

Bunun yanında network yönetimi, sanal işletim sisteminin güncel tutulması, dosya transferi ve disk yönetimi gibi bazı dezavantajları da bulunuyor.

Günün sonunda bu yazıda, Windows 10 Professional veya Enterprise üzerinde Hyper-V ile bir geliştirme ortamı kurulum adımlarını buluyor olacaksınız.

## Önkoşullar ve Versiyon Matrisi

| Bileşen      | Test Edilen Sürüm                           | Notlar                                 |
| ------------------- | ------------------------------------------- | ------------------------------------------------------ |
| **Ana Makine OS** | Windows 10 Enterprise 22H2 | Hyper-V aktif olmalı, BIOS’ta virtualization açık |
| **Hyper-V** | 10.0.22621 | "Hyper-V Management Tools" ve "Hyper-V Platform" etkin |
| **Sanal Makine OS** | Linux Mint 21.3 XFCE (Ubuntu 22.04 tabanlı) | `UBUNTU_CODENAME`=jammy |
| **PowerShell** | 7.4.4 | Winget üzerinden güncel sürüm |
| **VS Code** | 1.94.0 | apt repo ile yüklenmiş sürüm |
| **Docker** | 27.2.0 | Mint için Ubuntu repo’su kullanılıyor |
| **NodeJS / NVM** | Node 22.11.0 / NVM 0.40.3 | Restart sonrası aktifleşiyor |
| **Go** | 1.25.3 | Manuel indirilen tar.gz kurulum |
| **.NET SDK** | 8.0 / 9.0 | apt veya PPA:dotnet/backports ile |
| **AWS CLI** | v2.17.0 | zip yöntemiyle kurulum |
| **Python** | 3.10.12 | Mint ile birlikte geliyor |

## Gereken Ayarlamalar

Windows üzerinde bir geliştiricinin ihtiyacı olan ya da işini kolaylaştıracak özelliklerin ve araçların çoğu kapalı ve yüklenmemiş olarak geliyor. Öncelikle bunların açılması gerekiyor.

### Hyper-V Yüklenmesi

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-All" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Tools-All" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Powershell" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Hypervisor" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Services" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Clients" -NoRestart
```

Bu komutlar ile Hyper-V servisi ve gereken yönetim araçları yüklenmiş oluyor.

### Powershell Güncellemesi

```powershell
winget install Microsoft.Powershell --accept-package-agreements --accept-source-agreements
```

Bu komut ile Windows içinde hazır gelen PowerShell yerine daha güncel bir sürüm olan PowerShell yüklenmiş oluyor.

### Klasör Görünümü

```powershell
Push-Location
Set-Location HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced
Set-ItemProperty . HideFileExt "0"
Set-ItemProperty . Hidden "1"
Pop-Location
```

Bu komut ile dosya uzantıları görünür olurken, gizli dosyalarında görünür olması sağlanıyor. Bu tamamen isteğe bağlı bir adımdır. Ben kendi ana makinemde bu ayarın olmasını önemli gördüğüm için burada da paylaşıyor oluyorum.

### UAC Kapatılması

```powershell
New-ItemProperty -Path HKLM:Software\Microsoft\Windows\CurrentVersion\policies\system -Name EnableLUA -PropertyType DWord -Value 0 -Force
```

Bu komut yine yapılabilecek öneri niteliğindeki komutlardan bir tanesidir. Windows üzerinde UAC (User Account Control) yetkisiz erişimlerin engellenmesi için kullanılan bir araçtır. Bunun kapatılması durumunda makinenizde isteğiniz dışında kod çalıştırılması olabilir. Bu riski göz önüne alarak bu işlemi yapmanızı öneriyorum. Benim makinemde UAC gibi bir koruma sağlayan, ancak ayarlanabilir olduğu için daha kullanışlı bir anti-virüs yazılımı olduğu için UAC özelliğini kapatmayı tercih ediyorum.

## Hyper-V Network Ayarlaması

Ortam kurulumundan önce ortamları çalıştıracak olan Hyper-V için network ayrıştırılması ve internet erişiminin verilmesi gerekiyor. Bu adımda `172.19.85.0/24` networkünü kullanıyor olacağım. Tercihlerinize göre istediğiniz IP yapılanmasını seçebilirsiniz. Bunun için komut parametrik yapıldı.

```powershell
$natSwitch     = "LAN-85"
$natIPAddress  = "172.19.85.254"
$natAddress    = "172.19.85.0/24"

New-VMSwitch -SwitchName $natSwitch -SwitchType Internal
New-NetIPAddress -IPAddress $natIPAddress -PrefixLength 24 -InterfaceAlias "vEthernet ($natSwitch)"

New-NetNAT -Name $natSwitch -InternalIPInterfaceAddressPrefix $natAddress
```

Bu komut ile bir tane internal sanal switch oluşturuluyor, belirtilen adres üzerinden host makineye NAT yapılıyor ve internet erişimi kazanıyor. Dikkat edilmesi gereken,  sanal switch için oluşturulan, sanal adaptör için bir gateway değeri girilmemesidir.

## Sanal Makine Oluşturmak

Network ayarlamaları yapıldığında göre artık sanal makine oluşturma aşamasına geçilebilir.

```powershell
$natSwitch = "LAN-85"
$vmName = "fth-template"
$workspacePath = "C:\\workspace\\machine\\"
$isoPath = "C:\\workspace\\iso\\linuxmint-21.3-xfce-64bit.iso"

$cpu = 2
$ramSize  = 8GB
$diskSize = 50GB

New-VHD -Path "$workspacePath\\$vmName\\$vmName.vhdx" -SizeBytes $diskSize -Fixed -BlockSizeBytes 1MB

New-VM -Name $vmName -MemoryStartupBytes $ramSize -BootDevice VHD -VHDPath "$workspacePath\\$vmName\\$vmName.vhdx" -Path "$workspacePath" -Generation 2 -Switch $natSwitch

Set-VMFirmware $vmName -EnableSecureBoot Off
Set-VMProcessor -VMName $vmName -Count $cpu
Set-VM -Name $vmName -AutomaticCheckpointsEnabled $false -CheckpointType Disabled
Set-VMMemory -VMName $vmName -DynamicMemoryEnabled $true -MinimumBytes ($ramSize / 16) -StartupBytes ($ramSize / 8) -MaximumBytes $ramSize

Add-VMDvdDrive -VMName $vmName -Path "$isoPath"

$dvd = Get-VMDVDDrive -VMName $vmName
Set-VMFirmware -VMName $vmName -FirstBootDevice $dvd
Start-VM -Name $vmName
```

Yukarıdaki komutta yer alan parametreleri kullanarak farklı sanal makineler kurulabilir. Bu komutun neler yaptığına biraz detaylı olarak bakmak istiyorum.

### Sanal Makine Ayarları

Sanal makineyi oluştururken Gen 2 olarak oluşturuyoruz. Gen 2, ana makinenin de kullandığı fiziksel kaynakları kullanarak bir sanallaştırma yapmasına olanak sağlıyor Hyper-V'nin. Eğer Gen 1 kullansaydık, CPU, RAM ve diğer donanımlarda sanallaştırma katmanında yer alacak ve sanal makinenin yavaşlamasına sebep olacaktı.

Linux makinelerde `SecureBoot` özelliği önerilmediği için kapatılıyor. Kişisel bir tercih olarak, sanal makinenin daha az yer kaplaması için, `CheckPoint` özelliğini de kapatıyorum. Bunun dezavantajı, Hyper-V checkpoint alamadığı için bir restore işleminin ileride yapılamayacak olmasıdır.

### Disk Blok Boyutu Ayarlaması

Microsoft Hyper-V üzerinde Linux işletim sistemlerinin daha hızlı çalışması için sanal disklerin 1MB boyutunda blocklardan oluşmasını öneriyor. Bu değerin varsayılan 32MB ve Windows işletim sistemine uygun olarak ayarlanmış şekilde. Bunu desteklemek için de Linux üzerinde 4096 adet gruptan oluşacak `ext4` formatı kullanılmasını öneriyor.

Bu önerinin sebebi, sanal diskin büyümesi gerektiğinde büyük parçalar yerine daha küçük parçalarla büyüyerek ana makinedeki disk kullanımını optimize etmek. Linux için yapılan önerinin sebebi ise, ayrılmış ama kullanılmayan disk alanı oranını düşürmektir.

### Disk Tipi Ayarlaması

Disk üzerinde blok ayarlamasının yanında disk tipinde de ayarlama yapmayı tercih ediyorum. Bunun için sanal makine oluştururken diskleri `-Fixed` olarak ayarlıyorum. Bu parametre ile ana makine üzerinde belirttiğim kadar alan o sanal disk için ayrılmış oluyor. Bu sayede sanal makinenin kurulum süresi azalıyor.

### RAM ve CPU ayarlaması

Sanal makinenin CPU ayarı `$cpu` değişkenine core değeri vererek yapılıyor. `$ramSize` değişkenine ise en fazla olabilecek memory değeri veriliyor. Tanımlama yapılırken, verilen değerinin 1/8'i kadarıyla başlayacak ve en fazla verilen değer kadar olmasını sağlayacak şekilde bir ayarlama yapılıyor. Bu sayede sanal makine ihtiyacı kadar RAM'i ihtiyacı olduğu zaman talep ediyor ve alıyor.

### DVD Boot

İlk kurulumun yapılması için `$isoPath` değişkeni ile yüklenecek işletim sistemi iso dosyası DVD olarak veriliyor ve boot sıralamasında ilk sıraya ekleniyor.

## Sanal Makine Kurulumu

Bu ortam yapısını ilk kurduğum zamanlar her makineye Ubuntu kurup devam ediyordum. İlerleyen zamanda daha az yer kaplayacak kompakt sanal makineler kurma isteğimden dolayı, sanal makinelerimi Linux Mint ile güncelledim.

Linux Mint aslında Ubuntu baz alınarak oluşturulmuş, daha az yer kaplayan ve ubuntu paketlerini destekleyen bir dağıtım. Hem ubuntu olması hem de ubuntu olmaması benim amacıma çok hitap ettiği için kullanmayı tercih ettim. Linux Mint kurulum sırasında farklı desktop yapıları sunabiliyor olmasına karşın, ben yine daha ufak olan Xfce versiyonunu seçiyorum.

Sanal makine başladıktan bir süre sonra karşınıza bir yükleme ekranı gelecek, bu ekrandaki adımları takip ederek kurulumu tamamlayınız. Sonrasında biraz daha özelleştirme yapmak için buradan okumaya devam edebilirsiniz.

### Temizlik

Her Linux işletim sistemi aksi bir dağıtımı yoksa içerisinde bazı yüklü yazılımlarla gelir. Bu yazılımların çoğu son kullanıcı düşünülerek yüklenmiş araç veya yazılımlardır. Ben genelde bunları kullanmadığım için aşağıdaki komutlar ile bir ön temizleme yapıyorum.

```bash
sudo apt remove --purge -y libreoffice* redshift warpinator pix hexchat thunderbird transmission-gtk webapp-manager celluloid hypnotix rhythmbox timeshift simple-scan vim-tiny hplip youtube-dl xfce4-dict
```

Temizlik sonrasında da işletim sisteminde kalmış olacak parçaları temizleyip, güncellemeleri yapıyorum.

```bash
sudo apt clean && sudo apt autoremove && sudo apt update && sudo apt upgrade -y
```

Her büyük işlem sonrasında olacağı gibi bir restart gerekecektir.

```bash
sudo reboot
```

### Temel Yazılımlar

```bash
sudo apt install -y openssh-server vim git
```

Şu ana kadar kurduğum bütün geliştirici makinelerinde ihtiyacım olduğunu tespit ettiğim 3 yazılımın kurulumunu yapıyorum bu komut ile.

- OpenSSH Server: Dosya paylaşabilmek için
- Vim: CLI da kullandığım text editör
- Git: Kodları almak ve geliştirmeleri göndermek için kullandığım versiyon kontrol aracı.

### Güvenlik

Bu bir sanal makine olsa da içerisinde bulunan kodlar ve bilgiler yaptığımız işe göre önemli veya gizli durumunda olabilir. Bu yüzden sanal makinelerinde temel seviyede bazı güvenlik araçlarını kullanması gerektiğini düşünüyorum.

```bash
sudo systemctl start ssh
sudo systemctl enable ssh
sudo systemctl status ssh
sudo ufw allow ssh
sudo ufw enable
sudo ufw reload
```

Komutu ile sanal makine içerisinde yer alan firewall yazılımı ayarlanıyor ve SSH servisi etkinleştiriliyor. Bu ayarlar sayesinde dışarıdan, sanal makineye ek istek gelmesi engellenmiş oluyor.

### Network Ayarları

Sanal makinenin kendi başına çalışması için son gereken ayarlama da network ayarlamasıdır. Bu ayarlama GUI veya CLI üzerinden yapılabilir. Ben sadece temel olarak yapılması gerekenleri anlatıyor olacağım.

Hyper-V bir DHCP sunmadığı için sanal makinemize elle IP tanımlaması yapmamız gerekiyor.

**Device:** eth0
**Method:** Manual
**Address:** 172.19.85.XXX
**Netmask:** 24
**Gateway:** 172.19.85.254
**DNS servers:** 1.1.1.1,8.8.8.8

kullanılacak değerler yukarıdaki gibidir. Bu kısımda `XXX` alanına 2-253 arasında bir değer girilmesi gerekiyor. Eğer netmask değerini daha farklı ise ona göre bir IP adresi seçilmelidir.

Şimdi basit olarak açıklamak gerekirse, sanal makineyi internete bağlamak için gateway olarak `172.19.85.254` değerini girdik. Hatırlanacağı üzere, bu değer bizim sanal switch'imizi ana makineye bağlarken kullanılan NAT adresi. Böylece sanal makine de direk internete erişebilir oluyor.

Network değişimini yaptıktan sonra aşağıdaki komutu çalıştırarak değişikliklerin uygulanmasını sağlamanız gerekiyor.

```bash
sudo service NetworkManager restart
```

## Geliştirici Ortamı

Sanal makine hazırlıkları tamamlandı. Sanal makine artık kullanıma hazır. İhtiyaçlar ve isteklere göre geliştirme araçlarını da kurmaya başlayalım.

### VS Code

Geliştirme yaparken IDE olarak VS Code kullanmayı seviyorum. Hem esnek hem de plugin eklenerek geliştirilebilir olmasından dolayı tercih ediyorum. Ücretsiz olması da aslında başka bir tercih sebebi oluyor benim için.

```bash
sudo apt install dirmngr ca-certificates software-properties-common apt-transport-https -y

curl -fSsL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor | sudo tee /usr/share/keyrings/vscode.gpg > /dev/null

echo deb [arch=amd64 signed-by=/usr/share/keyrings/vscode.gpg] https://packages.microsoft.com/repos/vscode stable main | sudo tee /etc/apt/sources.list.d/vscode.list

sudo apt update && sudo apt install -y code
```

Yukarıdaki komut ile manual olarak apt repolarından VS Code yüklemesi yapılıyor.

Linux üzerinde VS Code çalışırken dosyaları takip ederek bunlarda bir değişim olup olmadığını anlamaya çalışıyor. Dosya sayısı çok arttığında `ENOSPC` hatası alınmaya başlanıyor. Bunu gidermek için aşağıdaki komutun çalıştırılması gerekiyor.

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf

sudo sysctl -p
```

### Docker

Sanal makine de olsa bazı yazılımları geçici süre kullanmak gerektiğinde docker kullanmayı tercih ediyorum. Docker kurulumunu Linux Mint'e yaparken dikkat edilmesi gereken önemli bir durum var.

Normalde script içerisinde `VERSION_CODENAME` olarak tanımlı olan kısmı Linux Mint için `UBUNTU_CODENAME` olarak kullanılıyor. Çünkü Linux Mint `VERSION_CODENAME` değerini kendi sürüm bilgisi ile güncelliyor ve bu kullanıldığında docker ilgili paketi bulamıyor. Bu yüzden `UBUNTU_CODENAME` değeri kullanılıyor.

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$UBUNTU_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
```

Bu komut ile önceden yüklü kalmış olabilecek paketler temizleniyor ve hazırlıklar yapılıyor.

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Bu komut ile kurulum yapılıyor ve sonrasında da aşağıdaki komut ile servisler çalışır hale getiriliyor.

```bash
sudo systemctl enable docker.service && sudo systemctl enable containerd.service
```

Şu anda sadece `sudo` ile docker komutlarına ulaşılabiliyor. Eğer `sudo` olmadan erişilmek isteniyorsa aşağıdaki komutların da çalıştırılması gerekiyor.

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

Bu komutta `$USER` değeri o anda giriş yapmış kullanıcıyı ifade etmektedir. Eğer farklı bir kullanıcı eklenecekse `$USER` yerine istenen kullanıcı adı yazılması gerekmektedir.

Bu işlemden sonra kullandığınız terminali kapatıp açmanız işe yarayacak olsa da mutlaka bir restart yapmanızı öneriyorum.

### NodeJS

Frontend geliştirmesi ya da IaC (Infrastructure as Code) geliştirmesi yapmak istenildiğinde kullanılan NodeJS ortamının kurulumuna bakalım şimdi.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
sudo reboot
```

Bu komut ile NodeJS versiyonlarını çok kolay bir şekilde yönetilmesini sağlayan NVM'in (Node Version Manager) yüklenmesi yapılıyor.  Bu işlem sonrasında mutlaka bir restart yapılması gerekiyor.

Restart sonrasında ihtiyaç olan versiyonu yüklemek için;

```bash
nvm install 22.11.0
nvm use 22.11.0
```

komutunun çalıştırılması yeterlidir. Bu komut ile `node` ve `npm` makineye yüklenmiş ve kullanıma hazır olacak. Ancak `yarn` gibi bir paket yöneticisi yüklemek isterseniz;

```bash
corepack enable yarn
```

komutunu çalıştırın. Bu komut ile `yarn` da makineye yüklenmiş olacaktır.

### Go

Son zamanlarda arkasına aldığı hype ile adından çok bahsettiren Go programlama dilinin yüklenmesi çok kolay. Bunun için aşağıdaki komutun çalıştırılması gerekiyor.

```bash
sudo rm -rf /usr/local/go
wget https://go.dev/dl/go1.25.3.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.25.3.linux-amd64.tar.gz
```

Yükleme sonrasında `$HOME/.profile` veya `/etc/profile` dosyasına aşağıdaki satırın eklenmesi. Sonrasında yine bir restart faydalı olacaktır.

```bash
export PATH=$PATH:/usr/local/go/bin
```

### .NET

.NET kurmakta diğer dilleri kurmak kadar basit aslında. Sadece versiyonlar arasındaki farklılıklardan dolayı yüklemeler biraz değişebiliyor.

```bash
sudo apt install -y ca-certificates libc6 libgcc-s1 libgssapi-krb5-2 libicu70 liblttng-ust1 libssl3 libstdc++6 zlib1g
```

Komutu ile .NET'in ihtiyaç duyacağı kütüphaneler yüklenir. Sonrasında versiyona göre uygun komut çalıştırılır.

#### .NET 6.0

```bash
sudo apt update && sudo apt install -y dotnet-sdk-6.0 aspnetcore-runtime-6.0 dotnet-runtime-6.0
```

#### .NET 8.0

```bash
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0 aspnetcore-runtime-8.0 dotnet-runtime-8.0
```

#### .NET 9.0

```bash
sudo add-apt-repository ppa:dotnet/backports
sudo apt-get update && sudo apt-get install -y dotnet-sdk-9.0 aspnetcore-runtime-9.0 dotnet-runtime-9.0
```

Yüklemeler tamamlandıktan sonra CLI üzerinde komut tamamlama desteği için aşağıdaki kod parçasının `~/.bashrc` dosyasının en altına eklenmesi önerilmektedir.

```bash
# bash parameter completion for the dotnet CLI
function _dotnet_bash_complete() 
{ 
  local cur="${COMP_WORDS[COMP_CWORD]}" IFS=$'\n' # On Windows you may need to use use IFS=$'\r\n'
  local candidates 

  read -d '' -ra candidates < <(dotnet complete --position "${COMP_POINT}" "${COMP_LINE}" 2>/dev/null) 

  read -d '' -ra COMPREPLY < <(compgen -W "${candidates[*]:-}" -- "$cur") 
} 

complete -f -F _dotnet_bash_complete dotnet
```

### Git & GitHub

Geliştirmelerimin hepsini GitHub üzerinde tutuyorum. Hatta [blog sitemi](https://github.com/fatihtatoglu/fatihtatoglu.github.io) de orada tutuyorum girip bakabilirsiniz.

Git ve GitHub ile çalışırken yapılması zorunlu olan ve önerilen bazı noktalar bulunmaktadır. Bunları da geliştirme ortamının bir parçası olarak gördüğüm için paylaşmak istiyorum.

```bash
git config --global user.name "Fatih Tatoğlu"
git config --global user.email "fatihtatoglu@gmail.com"

git config --global init.defaultBranch master
git config --global commit.gpgsign true
git config --global tag.gpgSign true
```

Yukarıdaki komutun ilk iki satırı git için bir zorunluluk diğer satırları benim önerimdir. Değerleri kendinize göre ayarlamayı unutmayın.

```bash
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long
gpg --armor --export <key-id>

git config --global user.signingkey <key-id>
```

Bu komut kodların imzalanmasını sağlamak için ilk adım olan PGP key'inin üretilmesi aşamasıdır. Bu adımda üretilen key değerini `-----BEGIN PGP PUBLIC KEY BLOCK-----` ve `-----END PGP PUBLIC KEY BLOCK-----` satırlarını da alacak şekilde kopyalayın.

[GitHub Keys](https://github.com/settings/keys) adresindeki "New GPG key" butonu basın ve açılan penceredeki "Key" alanına kopyalanan değeri yazın. "Title" alanına istediğinizi yazabilirsiniz.

Artık kodlarınız sizin makinenizden imzalı olarak gidiyor olacak.

Bunun yanında geliştirme sırasında PAT kullanılmasını öneriyorum kodların güvenliği için.

- repo
- write:packages
- read:org
- write:public_key
- write:gpg_key
- workflow
- write:ssh_signing_key

yetkilerine sahip ve en fazla 1 yıllık süresi olan classic bir token fazlasıyla işinizi görecektir. Bu token'ı [GitHub Developer Tokens](https://github.com/settings/tokens) sayfasında alabilirsiniz.

Kullanım kolaylığı olması ve history de gizli bilgilerin görünmemesi için, `~/.bashrc` dosyasının altına aşağıdaki satırları ekleyebilirsiniz.

```bash
export GH_USERNAME=fatihtatoglu
export GH_TOKEN=ghp_....
```

Bu ekleme sayesinde `git clone` işlemlerinde açık olarak token bilgisini paylaşmanıza gerek kalmayacaktır.

```bash
git clone http://$GH_USERNAME:$GH_TOKEN@github.com/fatihtatoglu/...
```

### AWS

AWS için geliştirme yaparken çoğunlukla AWS CLI kullanmam gerekiyor. Ubuntu ve Mint için aşağıdaki komutu çalıştırdığım zaman AWS CLI V1 yükleniyor.

```bash
sudo apt install awscli -y
```

Ancak hem daha yeni hem de daha fazla özellik içermesinden dolayı AWS CLI V2'yi aşağıdaki komut ile yüklemeyi tercih ediyorum.

```bash
sudo apt remove awscli -y

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm awscliv2.zip
rm -rf ./aws
```

### Python

Günümüzde yapay zeka ile bir çalışma yaparken Python bir standart haline geldi. Bu yüzden Python için gereken kurulumları da yapmak gerekebiliyor.

İşin güzel kısmı Linux Mint Python 3.10 ile hazır geliyor. Bunun üzerine sadece gerekecek araçları yüklemek benim için yeterli oluyor.

```bash
sudo apt update && sudo apt upgrade && sudo apt install python3 python3-venv -y
```

## Sorun Giderme

Yazının içerisinde dağınık olarak paylaştım ancak toplamak gerekirse karşılaşılacak olası sorunlar için çözümler şu şekildedir.

### ENOSPC Hatası

Bu hatayı VS Code Linux üzerinde dosya izlemesi yaparken limitlere takıldığında görünür.

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf

sudo sysctl -p
```

Komutu çalıştırıldığında izleyici sayısı artırılmış olur.

### Docker Komutlarını `sudo` Olmadan Çalıştırmak

Docker kurulumu yapıldığında `sudo` yetkisi olmadan işlem yapmanıza izin vermeyecektir.

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

Komutunu kullanarak bu sorunu çözebilirsiniz.

### Ağ Erişimi Yok / IP Alamıyor

Kurulumunu yaptığımız zaman sanal makine, eğer ağa erişemiyor ya da IP alamıyorsa aşağıdaki adımlar kontrol edilmeli.

- **Gateway** değeri `172.19.85.254` olarak atanmış mı?
- **DNS** değeri doğru atanmış mı?
- **IP Adresi** başka bir sanal makine ile çakışıyor mu?

### Linux Mint Boot Olmuyor

Bunun sebebi `Secure Boot` açık unutulmuş olabilir.

```bash
$vmName = "fth-template"
Set-VMFirmware $vmName -EnableSecureBoot Off
```

Komutu çalıştırıldıktan sonra `Secure Boot` kapanacaktır. Ancak etki etmesi için sanal makinenin yeniden başlatılması gerekmektedir.

### Snapshot / Checkpoint

Kurulum sırasında snapshot / checkpoint özelliğini kapatıyoruz ve bu sayede restore işlemlerini engellemiş oluyoruz.

Ancak yedekleme yapılması isteniyorsa, bu parametre açılabilir veya `Export-VM` kullanılarak sanal makinenin yedeği alınabilir.

## Kapanış Sözü

Her gün farklı bir geliştirme ortamına ihtiyacım olabiliyor. Bunun için elimin altında basit ve çoğu önceden belirlenmiş bir yönerge olması işimi çok kolaylaştırıyor. Özellikle bir şey denemek için ufak bir makine çalıştırıp sonrasında yok etmek ve bunun için hiç bir ek ücret ödememek çok cazip geliyor bana.

Buradaki amaç aynı kalacak şekilde farklı sanallaştırma katmanları kullanılabilir. Hatta tam bir laboratuvar kurulumu yapılabilir. Bunun için bir engel bulunmuyor. Sadece bu seçenekleri diğer yazılara saklıyorum.

Eğer siz de katkı sağlamak isterseniz, eklenmesini istediğiniz veya kullandığınız yönerge adımlarını benimle paylaşabilir, bu yazıyı okumasını istediğiniz kişilere iletebilir veya beğeni ve yorumlarınızı bırakabilirsiniz.

## Kaynaklar ve Ek Okumalar

- [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v)
- [Running VSCode On Linux: Hitting My Watcher Limit And What To Do About It](https://dev.to/stephencweiss/running-vscode-on-linux-hitting-my-watcher-limit-and-what-to-do-about-it-52i0)
- [Install .NET SDK or .NET Runtime on Ubuntu](https://learn.microsoft.com/en-us/dotnet/core/install/linux-ubuntu-install?tabs=dotnet9&pivots=os-linux-ubuntu-2204)
- [Installing or updating to the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
