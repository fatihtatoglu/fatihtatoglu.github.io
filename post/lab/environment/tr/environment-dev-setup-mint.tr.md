---
layout: post
published: true
author: Fatih Tatoğlu
date: 2023-10-27T21:44:00Z
permalink: ./lab/environment/dev-setup-mint.html
language: tr

title: Linux Mint ile Geliştirme Ortamı Oluşturma
header: Linux Mint ile Geliştirme Ortamı Oluşturma
description: Fatih'in alışkanlık ve tercihlerine uygun bir yazılım geliştirme ortamı hazırlamak.
tags: mint ubuntu linux_mint geliştirme geliştirme_ortamı

category: lab
group: environment
groupTitle: Geliştirme Ortamı
order: 3
---

Sanal makinelerle çok sayıda geliştirme ortamına sahip olmak, kişisel ve çalışma kurulumunu ayırmak veya farklı dilleri ve araçları denemek gibi ekstra avantajlar sağlar. Ancak sıfırdan bir ortam oluşturmak çok zaman alıyor. Bu yüzden her Linux sanal makinesi için bir temel kurulumum var.

Büyük bir dağıtımdan ziyade küçük ve alışması kolay bir dağıtımı tercih ediyorum. Linux Mint, Ubuntu tabanlı küçük ve güçlü bir dağıtımdır. Birçok Ubuntu özelliğini ve paketini destekliyor. Ortamı küçük tutmak için **Xfce Edition** sürümünü seçtim. Diğer sürümler daha güzel ve eğlenceli ama ben en kompakt olanı seviyorum.

🔥 Bu not Linux Mint 21.2 Xfce Sürümü üzerinde test edilen bazı komutları içermektedir. Farklı sürümler ve versiyonlar ekstralara ihtiyaç duyabilir.

Linux Mint küçük bir dağıtım olmasına rağmen, temel geliştirme ortamını oluşturmaya başlamadan önce, bazı gereksiz uygulamaları kaldırmayı seçtim.

```shell
fatihtatoglu@fth-dev:~$ sudo apt remove --purge -y libreoffice* thunderbird rhythmbox transmission-gtk simple-scan timeshift vim-tiny hplip youtube-dl hypnotix warpinator hexchat xfce4-dict
fatihtatoglu@fth-dev:~$ sudo apt clean
fatihtatoglu@fth-dev:~$ sudo apt autoremove
```

## Genel İşlemler

Bu işlemi tamamladıktan sonra, temel kurulumu tamamlamak için son bazı adımlar vardır. Ortamları farklılaştırmaya başlamadan önce bu adımlar tamamlanmalıdır. Öneri olarak bu adımlar tamamlandıktan sonra misafir makinenin diski diğer tüm sanal sunucular için temel imaj olarak klonlanmalıdır.

### Güncellemeler

Yeni yazılım eklemeden önce, sistemi daha kararlı ve güvenli hale getirmek için her seferinde işletim sistemi tabanlı güncellemeleri yaparak sistemi en son sürüme güncellemeyi tercih ediyorum. Genellikle ilk güncelleme daha uzun zaman alabiliyor.

```shell
fatihtatoglu@fth-dev:~$ sudo apt update
fatihtatoglu@fth-dev:~$ sudo apt upgrade -y
```

### SSH Bağlantısı

Konuk makineye bağlanmak için ana makineden SSH kullanılır. Bu nedenle, SSH sunucusu kurulumun önemli bir parçasıdır. Aşağıdaki komut ile kurulum yapıldıktan sonra root kimlik doğrulaması devre dışı bırakılmalıdır. Daha güvenli bir sistem için sertifika tabanlı kimlik doğrulama tercih edilebilir.

```shell
fatihtatoglu@fth-dev:~$ sudo apt install -y openssh-server
```

### Metin Düzenleyici ve Genel Sürücüler

Sanal makineyi kullanırken, komut satırı ortamında en çok kullanılan araç bir metin editörü olabilir. Bu yüzden ben de popüler metin editörüm `vim`i jenerik sürücüler ile birlikte yüklemeyi kurmayı tercih ettim. Bu arada, genel kullanım dışında kalan bütün durumlar için jenerik sürücülerin yüklenmesi yeterli olacaktır.

```shell
fatihtatoglu@fth-dev:~$ sudo apt install vim -y
fatihtatoglu@fth-dev:~$ sudo apt install --install-recommends linux-generic-hwe-22.04 -y
```

### Güvenlik

Bir sunucuyu daha güvenli hale getirmek, iyi yapılandırılmış bir yazılım tabanlı güvenlik duvarı olmadan düşünülemez. Gelen ve giden ağ trafiğini yönetmek için Ubuntu ve Mint Linux'da `ufw` kullanmayı tercih ediyorum.

```shell
fatihtatoglu@fth-dev:~$ sudo systemctl status ssh
fatihtatoglu@fth-dev:~$ sudo systemctl enable ssh
fatihtatoglu@fth-dev:~$ sudo ufw allow ssh
fatihtatoglu@fth-dev:~$ sudo ufw enable
fatihtatoglu@fth-dev:~$ sudo ufw reload
```

## Geliştirme Ortamları

Temel sunucu için tüm adımları tamamladıktan sonra, farklı geliştirme ortamı hazırlıklarına geçelim. Bazı adımlar tekrarlanabilir, ancak düzgün bir kurulum için tüm adımlar uygulanmalıdır.

🔥 Aşağıdaki ortam tariflerini kullanmadan önce, lütfen araçların sürümlerinden farkında olun. Mevcut komut **Mint Linux 21.2 Xfce Edition** için test edilmiştir.

### Fatih'in Geliştirme Ortamı

Genellikle aynı anda birden fazla uygulama geliştiriyorum, bu nedenle çeşitli araçlara ihtiyacım var. Aşağıdaki komut ile mevcut ortamım hazırlanabilir.

```shell
fatihtatoglu@fth-dev:~$ echo "Prepare Environment"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ sudo apt install -y software-properties-common apt-transport-https wget curl gnupg ca-certificates
fatihtatoglu@fth-dev:~$ sudo apt remove -y --purge docker docker-engine docker.io containerd runc
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "Add Repositories"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> vscode"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ wget -O- https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor | sudo tee /usr/share/keyrings/microsoft.gpg
fatihtatoglu@fth-dev:~$ echo deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/vscode stable main | sudo tee /etc/apt/sources.list.d/vscode.list
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> powershell & dotnet"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo deb [arch=amd64,armhf,arm64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/22.04/prod/ jammy main | sudo tee /etc/apt/sources.list.d/microsoft.list
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> nodejs"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ NODE_MAJOR=20
fatihtatoglu@fth-dev:~$ echo "deb [arch=amd64 signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> docker"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
fatihtatoglu@fth-dev:~$ echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> python"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ curl "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xF23C5A6CF475977595C89F51BA6932366A755776" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/deadsnakes.gpg
fatihtatoglu@fth-dev:~$ echo deb [signed-by=/usr/share/keyrings/deadsnakes.gpg] https://ppa.launchpadcontent.net/deadsnakes/ppa/ubuntu jammy main | sudo tee /etc/apt/sources.list.d/deadsnakes.list
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> go"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ wget https://go.dev/dl/go1.21.3.linux-amd64.tar.gz -O go1.21.3.linux-amd64.tar.gz
fatihtatoglu@fth-dev:~$ sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.21.3.linux-amd64.tar.gz
fatihtatoglu@fth-dev:~$ sudo rm go1.21.3.linux-amd64.tar.gz
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ export PATH=$PATH:/usr/local/go/bin
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "Start installation"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ sudo apt update && sudo apt upgrade -y
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ sudo apt install -y code git nodejs powershell docker-ce docker-ce-cli docker-compose-plugin containerd.io python3.12
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ sudo usermod -aG docker $USER
fatihtatoglu@fth-dev:~$ sudo systemctl enable docker.service
fatihtatoglu@fth-dev:~$ sudo systemctl enable containerd.service
```

Go kurulumunun püf noktası her seferinde `GOPATH` ortam değişkenini ayarlamaktır.

```shell
fatihtatoglu@fth-dev:~$ sudo vi ~/.bashrc
```

Bunu yapmak için, `.bashrc` dosyası yukarıdaki komutla açılarak düzenlenir ve ardından aşağıdaki satır dosyanın altına eklenerek kaydedilir.

```text
export PATH=$PATH:/usr/local/go/bin
```

O ortamda özel ve profesyonel hayatımdaki rutinim için Front-end ve back-end uygulamalar geliştirebiliyorum. Örneğin Yemeksepeti'nde bunu kullandım.

### Delivery Hero Geliştirme Ortamı

Bu, Delivery Hero için benzersiz bir durumdur. Yukarıdaki ortam yeterli görünüyor. Buna rağmen, tüm kaynaklar AWS bulutunda olduğunda daha güvenli bir ortam sağlamak için bir VPN bağlantısı çok önemli olmalıdır. **Fatih'in Geliştirme Ortamına** bir VPN istemcisi eklemek **Delivery Hero Ortamı** haline gelir.

```shell
fatihtatoglu@fth-dev:~$ sudo apt install build-essential qtcreator qt5-default -y
fatihtatoglu@fth-dev:~$ sudo add-apt-repository ppa:yuezk/globalprotect-openconnect
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ sudo apt update
fatihtatoglu@fth-dev:~$ sudo apt install -y globalprotect-openconnect
```

## Son Ama Çok Önemli

Tüm kurulum tamamlandıktan ve sistem yeniden başlatıldıktan sonra kurulumu kontrol etmeyi unutmayın. Örneğin aşağıdaki komutlar kullanılabilir.

```shell
fatihtatoglu@fth-dev:~$ git --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ node --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ npm --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ go version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ docker --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ dotnet --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ pwsh --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ code --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ python3 --version
```
