---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T22:00:42Z
permalink: ./lab/environment/dev-setup-mint.html
language: tr

title: Linux Mint ile Geliştirme Ortamı Oluşturma
header: Linux Mint ile Geliştirme Ortamı Oluşturma
tags: mint ubuntu linux_mint geliştirme geliştirme_ortamı

category: lab
group: environment
groupTitle: Geliştirme Ortamı
order: 3
---

Sanal makinelerle çok sayıda geliştirme ortamına sahip olmak, kişisel ve çalışma kurulumunu ayırmak veya farklı dilleri ve araçları denemek gibi ekstra avantajlar sağlar. Ancak sıfırdan bir ortam oluşturmak çok zaman alıyor. Bu yüzden her Linux sanal makinesi için bir temel kurulumum var.

Büyük bir dağıtımdan ziyade küçük ve alışması kolay bir dağıtımı tercih ediyorum. Linux Mint, Ubuntu tabanlı küçük ve güçlü bir dağıtımdır. Birçok Ubuntu özelliğini ve paketini destekliyor. Ortamı küçük tutmak için **Xfce Edition** sürümünü seçtim. Diğer sürümler daha güzel ve eğlenceli ama ben en kompakt olanı seviyorum.

🔥 Bu not Linux Mint 20.3 Xfce Sürümü üzerinde test edilen bazı komutları içermektedir. Farklı sürümler ve versiyonlar ekstralara ihtiyaç duyabilir.

Linux Mint küçük bir dağıtım olmasına rağmen, temel geliştirme ortamını oluşturmaya başlamadan önce, bazı gereksiz uygulamaları kaldırmayı seçtim.

```shell
fatihtatoglu@fth-linux:~$ sudo apt remove --purge -y libreoffice* thunderbird rhythmbox transmission-gtk simple-scan timeshift vim-tiny hplip youtube-dl hypnotix warpinator
fatihtatoglu@fth-linux:~$ sudo apt clean
fatihtatoglu@fth-linux:~$ sudo apt autoremove
```

## Genel İşlemler

Bu işlemi tamamladıktan sonra, temel kurulumu tamamlamak için son beş adım vardır. Ortamları farklılaştırmaya başlamadan önce bu adımlar tamamlanmalıdır. Öneri olarak bu adımlar tamamlandıktan sonra misafir makinenin diski diğer tüm sanal sunucular için temel imaj olarak klonlanmalıdır.

### Güncellemeler

Yeni yazılım eklemeden önce, sistemi daha kararlı ve güvenli hale getirmek için her seferinde işletim sistemi tabanlı güncellemeleri yaparak sistemi en son sürüme güncellemeyi tercih ediyorum. Genellikle ilk güncelleme daha uzun zaman alabiliyor.

```shell
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ sudo apt upgrade -y
```

### SSH Bağlantısı

Konuk makineye bağlanmak için ana makineden SSH kullanılır. Bu nedenle, SSH sunucusu kurulumun önemli bir parçasıdır. Aşağıdaki komut ile kurulum yapıldıktan sonra root kimlik doğrulaması devre dışı bırakılmalıdır. Daha güvenli bir sistem için sertifika tabanlı kimlik doğrulama tercih edilebilir.

```shell
fatihtatoglu@fth-linux:~$ sudo apt install -y openssh-server
```

### Metin Düzenleyici ve Genel Sürücüler

Sanal makineyi kullanırken, komut satırı ortamında en çok kullanılan araç bir metin editörü olabilir. Bu yüzden ben de popüler metin editörüm `vim`i jenerik sürücüler ile birlikte yüklemeyi kurmayı tercih ettim. Bu arada, genel kullanım dışında kalan bütün durumlar için jenerik sürücülerin yüklenmesi yeterli olacaktır.

```shell
fatihtatoglu@fth-linux:~$ sudo apt install vim -y
fatihtatoglu@fth-linux:~$ sudo apt install --install-recommends linux-generic-hwe-20.04 -y
```

### Güvenlik

Bir sunucuyu daha güvenli hale getirmek, iyi yapılandırılmış bir yazılım tabanlı güvenlik duvarı olmadan düşünülemez. Gelen ve giden ağ trafiğini yönetmek için Ubuntu ve Mint Linux'da `ufw` kullanmayı tercih ediyorum.

```shell
fatihtatoglu@fth-linux:~$ sudo systemctl status ssh
fatihtatoglu@fth-linux:~$ sudo systemctl enable ssh
fatihtatoglu@fth-linux:~$ sudo ufw allow ssh
fatihtatoglu@fth-linux:~$ sudo ufw enable
fatihtatoglu@fth-linux:~$ sudo ufw reload
```

### Ekran Çözünürlüğü

Hyper-V ile Linux dağıtımlarını kullanırken, birçok kez ekran çözünürlüğü ile ilgili sorun yaşadım. Ayrıca, Mint Linux'un bunun için düzenleme yapması gerekiyor.

```shell
fatihtatoglu@fth-linux:~$ sudo vi /etc/default/grub
```

Dosya açıldıktan sonra bu satırı **`GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"`** bu satır ile **`GRUB_CMDLINE_LINUX_DEFAULT="quiet splash video=hyperv_fb:1920x1080"`** değişecektir. Daha sonra dosya kaydedilmeli ve sistem yeniden başlatılmalıdır. Ekran boyutunu dizüstü bilgisayarımın aktif ekran boyutuna göre ayarlıyorum.

```shell
fatihtatoglu@fth-linux:~$ sudo update-grub
fatihtatoglu@fth-linux:~$ sudo reboot
```

## Geliştirme Ortamları

Temel sunucu için tüm adımları tamamladıktan sonra, farklı geliştirme ortamı hazırlıklarına geçelim. Bazı adımlar tekrarlanabilir, ancak düzgün bir kurulum için tüm adımlar uygulanmalıdır.

🔥 Aşağıdaki ortam tariflerini kullanmadan önce, lütfen araçların sürümlerinden farkında olun. Mevcut komut **Mint Linux 20.3 Xfce Edition** için test edilmiştir.

### C# Geliştirme Ortamı

Klasik bir Microsoft DotNet geliştirme ortamı benim için **PowerShell**, **Git**, **VSCode** ve bunlarla ilgili eklentileri içerir.

```shell
fatihtatoglu@fth-linux:~$ sudo apt-get install -y wget apt-transport-https software-properties-common
fatihtatoglu@fth-linux:~$ wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
v sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
fatihtatoglu@fth-linux:~$ rm -f packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ 
fatihtatoglu@fth-linux:~$ wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ rm packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ 
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ 
fatihtatoglu@fth-linux:~$ sudo apt install code git powershell dotnet-sdk-6.0 aspnetcore-runtime-6.0 dotnet-runtime-6.0 -y
```

### Go Geliştirme Ortamı

Benim için Go geliştirme ortamı **Git**, **Go**, **VsCode** ve ilgili eklentileri içerir.

```shell
fatihtatoglu@fth-linux:~$ wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
v sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
fatihtatoglu@fth-linux:~$ rm -f packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo apt install apt-transport-https -y
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt install code git -y
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget https://go.dev/dl/go1.18.3.linux-amd64.tar.gz
fatihtatoglu@fth-linux:~$ sudo su
root@fth-linux:/home/fatihtatoglu# rm -rf /usr/local/go && tar -C /usr/local -xzf go1.18.3.linux-amd64.tar.gz
root@fth-linux:/home/fatihtatoglu# exit
fatihtatoglu@fth-linux:~$ export PATH=$PATH:/usr/local/go/bin
```

Go kurulumunun en zor noktası her seferinde `GOPATH` ortam değişkenini ayarlamaktır.

```shell
fatihtatoglu@fth-linux:~$ sudo vi ~/.bashrc
```

Bunu yapmak için, `.bashrc` dosyası yukarıdaki komutla açılarak düzenlenir ve ardından aşağıdaki satır dosyanın altına eklenerek kaydedilir.

```text
export PATH=$PATH:/usr/local/go/bin
```

### Fatih'in Geliştirme Ortamı

Genellikle aynı anda birden fazla uygulama geliştiriyorum, bu nedenle çeşitli araçlara ihtiyacım var. Aşağıdaki komut ile mevcut ortamım hazırlanabilir.

```shell
fatihtatoglu@fth-linux:~$ sudo apt-get install -y wget curl apt-transport-https software-properties-common
fatihtatoglu@fth-linux:~$ wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
v sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
fatihtatoglu@fth-linux:~$ rm -f packages.microsoft.gpg
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ rm packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ curl -fsSL https://deb.nodesource.com/setup_16.x |sudo -E bash -
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt-get remove docker docker-engine docker.io containerd runc
fatihtatoglu@fth-linux:~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
fatihtatoglu@fth-linux:~$ echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu focal stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ sudo apt install code git dotnet-sdk-6.0 aspnetcore-runtime-6.0 dotnet-runtime-6.0 nodejs powershell ca-certificates gnupg lsb-release docker-ce docker-ce-cli containerd.io -y
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo usermod -aG docker $USER
fatihtatoglu@fth-linux:~$ newgrp docker
fatihtatoglu@fth-linux:~$ sudo systemctl enable docker.service
fatihtatoglu@fth-linux:~$ sudo systemctl enable containerd.service
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget https://go.dev/dl/go1.18.3.linux-amd64.tar.gz
fatihtatoglu@fth-linux:~$ sudo su
root@fth-linux:/home/fatihtatoglu# rm -rf /usr/local/go && tar -C /usr/local -xzf go1.18.3.linux-amd64.tar.gz
root@fth-linux:/home/fatihtatoglu# exit
fatihtatoglu@fth-linux:~$ export PATH=$PATH:/usr/local/go/bin
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo vi ~/.bashrc
```

Aşağıdaki satırı dosyanın en altına ekleyin.

```text
export PATH=$PATH:/usr/local/go/bin
```

O ortamda özel ve profesyonel hayatımdaki rutinim için Front-end ve back-end uygulamalar geliştirebiliyorum. Örneğin Yemeksepeti'nde bunu kullandım.

### Delivery Hero Geliştirme Ortamı

Bu, Delivery Hero için benzersiz bir durumdur. Yukarıdaki ortam yeterli görünüyor. Buna rağmen, tüm kaynaklar AWS bulutunda olduğunda daha güvenli bir ortam sağlamak için bir VPN bağlantısı çok önemli olmalıdır. **Fatih'in Geliştirme Ortamına** bir VPN istemcisi eklemek **Delivery Hero Ortamı** haline gelir.

```shell
fatihtatoglu@fth-linux:~$ sudo apt install build-essential qtcreator qt5-default -y
fatihtatoglu@fth-linux:~$ sudo add-apt-repository ppa:yuezk/globalprotect-openconnect
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ sudo apt install -y globalprotect-openconnect
```

## Son Ama Çok Önemli

Tüm kurulum tamamlandıktan ve sistem yeniden başlatıldıktan sonra kurulumu kontrol etmeyi unutmayın. Örneğin aşağıdaki komutlar kullanılabilir.

```shell
fatihtatoglu@fth-linux:~$ git --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ node --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ npm --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ go version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ docker --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ dotnet --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ pwsh --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ code --version
```
