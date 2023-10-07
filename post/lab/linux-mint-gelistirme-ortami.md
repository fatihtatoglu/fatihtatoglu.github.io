---
layout: post
published: false
author: Fatih Tatoğlu
date: 2022-06-12T22:00:42Z
permalink: ./lab/linux/mint-gelistirme-ortami.html
language: tr

title: Linux - Mint Geliştirme Ortamı
header: Linux - Mint Geliştirme Ortamı
description: Geliştirmelerimin çoğu artık cross platform olduğu için linux üzerinde geliştirme yapmayı tercih ediyorum. Mint linux ile geliştirmelerime devam ediyorum.
tags: mint ubuntu linux_mint geliştirme
---

Geliştirmelerimin çoğu artık cross platform olarak çalışıyor. Diğer insanların aksine MacOS seçmediğim için Linux üzerinde geliştirmelerime devam ediyorum. Odağım geliştirme olduğu için çok büyük bir dağıtım seçmek yerine daha kolay alışabileceğim bir dağıtım tercih ettim.

Linux Mint, Ubuntu'yu baz alan bir dağıtım ve Ubuntu için çalışan çoğu paketi de çalıştırabiliyor. Ama tam bir geliştirme ortamı olabilmesi için bazı ufak eklemeler ve çıkartmalar yapmam gerekiyor.

Linux Mint, seçimi yaparken basit, hafif ve verimli olması için **Xfce Edition** sürümünü kullanıyorumdum. Diğer sürümlerinde daha görsel olarak güzel ve eğlenceli arayüzler olmasına karşın ben olabildiğinde az yer kaplayan bir sürüm olmasını tercih ediyorumdum.

## Çıkartmalar

Linux Mint, hafif bir dağıtım olmasına rağmen içinde benim geliştirme sırasında kullanmayacağım bazı yüklemelerde bulunmakta. Öncelikle bunlardan kurtuluyor olacağım.

```shell
fatihtatoglu@fth-linux:~$ sudo apt remove --purge -y libreoffice* thunderbird rhythmbox transmission-gtk simple-scan timeshift vim-tiny hplip youtube-dl hypnotix warpinator
fatihtatoglu@fth-linux:~$ sudo apt clean
fatihtatoglu@fth-linux:~$ sudo apt autoremove
```

## İlk Yapılacak

Gerek duymadığım yazılımları çıkarttıktan sonra yeni yükleme yapmadan önce ilk yapmam gereken dediğim bazı adımlar her işletim sistemi için bulunmaktadır. Linux Mint içinde;

- Güncellemeleri Yapmak
- SSH Serverı Ayarlamak
- Firewallu Ayarlamak

şeklinde. Bu işlemler yapılmadan güvenli, stabil ve rahat bir çalışma ortamına sahip olmayacağımı düşünüyorum. Bu yüzden öncelike bunları yapıyor olacağım.

```shell
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ sudo apt upgrade -y
```

Yukarıdaki komutlar ile güncellemeler yapılıyor. İlk defa yapılacağı için biraz uzun sürebilir.

```shell
fatihtatoglu@fth-linux:~$ sudo apt install vim -y
fatihtatoglu@fth-linux:~$ sudo apt install --install-recommends linux-generic-hwe-20.04 -y
fatihtatoglu@fth-linux:~$ sudo apt install -y openssh-server
```

Yukarıdaki komutlar ile sırasıyla favori komut satırı editörümü yüklüyorum. Sonrasında ekran kartı sürücüsünü yüklüyorum. Hyper-V üzerinden çalıştırdığım için generic bir ekran kartı sürücüsü işimi görüyor olacaktır. Son olarak ana makine ile bağlantı sağlayabilmek için SSH Server kuruyorum.

```shell
fatihtatoglu@fth-linux:~$ sudo systemctl status ssh
fatihtatoglu@fth-linux:~$ sudo systemctl enable ssh
fatihtatoglu@fth-linux:~$ sudo ufw allow ssh
fatihtatoglu@fth-linux:~$ sudo ufw enable
fatihtatoglu@fth-linux:~$ sudo ufw reload
```

Yukarıdaki komutlar ile Linux Mint içindeki firewallu etkinleştirip SSH Servera yetki veriyorum. Bunun dışında ek bir yetkiye ihtiyacım olmadığı için sadece SSH portuna yetki vermek yeterli olacaktır.

## Ekran Ayarlama

Hyper-V üzerinde çalıştırdığım bütün Linux dağıtımlarında mutlaka sonrasında ekran ayarı yapılması gerekmektedir. Linux Mint için de bu işlemi aşağıdaki işlem ile yapabiliyorum.

```shell
fatihtatoglu@fth-linux:~$ sudo vi /etc/default/grub
```

Dosyayı açtıktan sonra **`GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"`** olan satırı **`GRUB_CMDLINE_LINUX_DEFAULT="quiet splash video=hyperv_fb:1920x1080"`** olarak güncelleyip kaydediyoruz.

```shell
fatihtatoglu@fth-linux:~$ sudo update-grub
fatihtatoglu@fth-linux:~$ sudo reboot
```

Sonrasında yukarıdaki komutları çalıştırarak sanal makineyi restart ediyoruz ve ekran artık kocaman oluyor.

## VPN Ayarlamaları

Geliştirme yaparken çalıştığım şirketin ortamlarına bağlanmak ya da güvenlik gereği bir jumpserver üzerinden bağlanmam gerektiğinde VPN yapmam kaçınılmaz hale geliyor. Linux Mint **Xfce Edition** sürümü ile GlobalProtect VPN servisine bağlanmak sorun olabiliyor. Bunun için aşağıdaki adımların yapılması yeterli olacaktır.

```shell
fatihtatoglu@fth-linux:~$ sudo apt install build-essential 
fatihtatoglu@fth-linux:~$ sudo apt install qtcreator
fatihtatoglu@fth-linux:~$ sudo apt install qt5-default
fatihtatoglu@fth-linux:~$ sudo add-apt-repository ppa:yuezk/globalprotect-openconnect
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ sudo apt install -y globalprotect-openconnect
```

Yukarıdaki komutlar çalıştırıldıktan sonra eğer cli üzerinden çalıştırmak ve loglarını görmek isterseniz `gpclient` komutu kullanılabilir. Cli kapandığında bağlantı kesilecektir. Bağlantı hep açık kalsın istiyorsanız makine restart edildikten sonra başlat menüsünden **GlobalProtect** yazarak uygulamaya ulaşılabilir.

## Kurulumlar

İşimize yaramayacak yazılımlardan kurtulduk, ayarlamalarımızı yaptık, gerekiyorsa VPN'i ayarladık ve en son ekranımızı da ayarladıktan sonra sadece geliştirme ortamının kurulması işlemi kaldı. Bu bölümde parça parça benim kullandığım araçların kurulumları ile ilgili komutları paylaşacağım.

### VSCode

```shell
fatihtatoglu@fth-linux:~$ wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
v sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
fatihtatoglu@fth-linux:~$ rm -f packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo apt install apt-transport-https -y
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ sudo apt install code -y
```

### Git

```shell
fatihtatoglu@fth-linux:~$ sudo apt install git -y
```

### DotNet Core

```shell
fatihtatoglu@fth-linux:~$ wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ rm packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo apt-get update

fatihtatoglu@fth-linux:~$ sudo apt-get install -y apt-transport-https
fatihtatoglu@fth-linux:~$ sudo apt-get install -y dotnet-sdk-6.0
fatihtatoglu@fth-linux:~$ sudo apt-get install -y aspnetcore-runtime-6.0
fatihtatoglu@fth-linux:~$ sudo apt-get install -y dotnet-runtime-6.0
```

### NodeJs

```shell
fatihtatoglu@fth-linux:~$ sudo apt install -y curl
fatihtatoglu@fth-linux:~$ curl -fsSL https://deb.nodesource.com/setup_16.x |sudo -E bash -
fatihtatoglu@fth-linux:~$ sudo apt install nodejs
```

### PowerShell

Evet doğru görüyorsunuz powershell. Çünkü artık PowerShell Core da cross platform olarak çalışabiliyor.

```shell
fatihtatoglu@fth-linux:~$ sudo apt-get install -y wget apt-transport-https software-properties-common
fatihtatoglu@fth-linux:~$ wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo apt-get update
fatihtatoglu@fth-linux:~$ sudo apt-get install -y powershell
```

### Docker

```shell
fatihtatoglu@fth-linux:~$ sudo apt-get remove docker docker-engine docker.io containerd runc
fatihtatoglu@fth-linux:~$ sudo apt-get install -y ca-certificates curl gnupg lsb-release
fatihtatoglu@fth-linux:~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
fatihtatoglu@fth-linux:~$ echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu focal stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
fatihtatoglu@fth-linux:~$ sudo apt-get update
fatihtatoglu@fth-linux:~$ sudo apt-get install -y docker-ce docker-ce-cli containerd.io
fatihtatoglu@fth-linux:~$ sudo usermod -aG docker $USER
fatihtatoglu@fth-linux:~$ newgrp docker 
fatihtatoglu@fth-linux:~$ sudo systemctl enable docker.service
fatihtatoglu@fth-linux:~$ sudo systemctl enable containerd.service
fatihtatoglu@fth-linux:~$ docker run hello-world
```

### GO

```shell
fatihtatoglu@fth-linux:~$ wget https://go.dev/dl/go1.18.3.linux-amd64.tar.gz
fatihtatoglu@fth-linux:~$ sudo su
fatihtatoglu@fth-linux:~$ rm -rf /usr/local/go && tar -C /usr/local -xzf go1.18.3.linux-amd64.tar.gz
fatihtatoglu@fth-linux:~$ exit
fatihtatoglu@fth-linux:~$ export PATH=$PATH:/usr/local/go/bin
fatihtatoglu@fth-linux:~$ go version
```

GO kurulumu yaparken dikkat eklmemiz gereken bir noktada her seferinde otomatik olarak GOPATH değerinin atanması. Bu işlem için;

```shell
fatihtatoglu@fth-linux:~$ sudo vi ~/.bashrc
```

komutu ile dosyayı açıyoruz ve en altına aşağıdaki satırı ekleyip kapatıyoruz.

```bash
export PATH=$PATH:/usr/local/go/bin
```

## Son İşlem

Kendime göre geliştirme ortamımı kurdum ve her zaman son işlem mutlaka makineyi restart etmek olacaktır. Restart işleminden sonra kurulumları test etmek için aşağıdaki komutları çalıştırabilirsiniz.

```shell
fatihtatoglu@fth-linux:~$ git --version
fatihtatoglu@fth-linux:~$ node --version
fatihtatoglu@fth-linux:~$ npm --version
fatihtatoglu@fth-linux:~$ go version
fatihtatoglu@fth-linux:~$ docker --version
fatihtatoglu@fth-linux:~$ dotnet --version
fatihtatoglu@fth-linux:~$ pwsh --version
fatihtatoglu@fth-linux:~$ code --version
```

Bu komutların sonunda hata alıyor ya da sonuç alamıyorsanız yüklemelerde bir sıkıntı olmuş olabilir. Bu sorunları tespit etmek için yükleme adımlarını kontrol ederek giderebilirsiniz.
