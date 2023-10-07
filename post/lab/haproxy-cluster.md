---
layout: post
published: false
author: Fatih Tatoğlu
date: 2022-06-12T18:41:00Z
permalink: ./lab/haproxy/cluster.html
language: tr

title: HAProxy - Cluster
header: HAProxy - Cluster
description: HAProxy'nin yüksek erişilebilir yapısının kurulması ve test edilmesi.
tags: haproxy keepalived centos failover yüksek_erişilebilirlilik high_availability
---

Bu notumda HAProxy için yüksek erişilebilir bir yapı kurulmasından bahsetmeye çalışacağım.

## Ortamların Hazırlanması

Yüksek erişilebilir bir yapı kurmak için en az 2 makine ve 3 tane IP adresine ihtiyacımız bulunuyor.

|Makine Adı|IP Adresi|CPU|RAM|Disk|OS|
|:---:|:---:|:---:|:---:|:---:|:---:|
|haproxy-01|172.19.85.102|4|2 GB|40 GB|CentOS 7.X Minimal|
|haproxy-02|172.19.85.103|4|2 GB|40 GB|CentOS 7.X Minimal|

**172.19.85.104** IP adresini 3. IP adresi olarak kullanılacak.

Makinlerin her birine [HAProxy - Kurulum](./kendime-notlar/lab/haproxy/kurulum.html) adresindeki notlardan kurulumları yapılmalı.

## KeepAlived'ın Yüklenmesi

KeepAlived uygulaması iki makine arasında 3. IP adresini taşıyarak sistemin tek bir IP adresine üzerinden erişilebilir olmasını sağlayacaktır.

### Gerekli Dosyaların İndirilmesi

Yükleme yapılması için gereken kaynak kodların indirilmesi.

```shell
fatihtatoglu@fth-linux:~$ curl https://www.keepalived.org/software/keepalived-2.2.7.tar.gz > keepalived-2.2.7.tar.gz
fatihtatoglu@fth-linux:~$ tar xf keepalived-2.2.7.tar.gz
```

### KeepAlived'ın Derlenmesi

HAProxy'nin cluster olarak çalışması sağlayacak olan uygulamanın kurulumu.

```shell
fatihtatoglu@fth-linux:~$ cd ~
root@fth-linux:~# sudo su
root@fth-linux:~# cd keepalived-2.2.7
root@fth-linux:~# ./configure --prefix=/
root@fth-linux:~# make
root@fth-linux:~# make install
```

### Failover Scripti

KeepAlived HAProxy'nin çalışma durumuna göre iki makine arasında fail-over yapmaktadır. Ancak HAProxy uygulamasının çalıştığını anlaması için bir script ile kontrol etmesi gerekmektedir.

```shell
fatihtatoglu@fth-linux:~$ sudo vi /usr/local/bin/failover.sh
```

```bash
#!/bin/shell
SERVICE='haproxy'
STATUS=$(ps ax | grep -v grep | grep $SERVICE)

if [ "$STATUS" != "" ]
then
    exit 0
else
    exit 1
fi
```

```shell
fatihtatoglu@fth-linux:~$ sudo chmod a+rx /usr/local/bin/failover.sh
```

### Konfigürasyon

KeepAlived makine bazında ayrı ayrı ayarlanması gerekmektedir.

#### HAPROXY-01 Konfigürasyonu

```shell
fatihtatoglu@fth-linux:~$ sudo vi /etc/keepalived/keepalived.conf
```

```roboconf
global_defs {
     enable_script_security
     smtp_server 127.0.0.1
     smtp_connect_timeout 30
     notification_email {
          fatih@tatoglu.net
     }
}

vrrp_script chk_haproxy {
     script "/usr/local/bin/failover.sh"
     interval 1
     weight 2
     rise 2
     fall 2
     init_fail
}

vrrp_instance VI_MASTER { 
    state MASTER 
    interface eth0
    virtual_router_id 51
    priority 101 
    advert_int 1
    virtual_ipaddress {
        172.19.85.104
    }
    track_script {
        chk_haproxy
    }
    smtp_alert true
}
```

#### HAPROXY-02 Konfigürasyonu

```shell
fatihtatoglu@fth-linux:~$ sudo vi /etc/keepalived/keepalived.conf
```

```roboconf
global_defs {
     enable_script_security
     smtp_server 127.0.0.1
     smtp_connect_timeout 30
     notification_email {
          fatih@tatoglu.net
     }
}

vrrp_script chk_haproxy {
     script "/usr/local/bin/failover.sh"
     interval 1
     weight 2
     rise 2
     fall 2
     init_fail
}

vrrp_instance VI_BACKUP {
    state BACKUP 
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    virtual_ipaddress {
        172.19.85.104
    }
    track_script {
        chk_haproxy
    }
    smtp_alert true
}
```

Aşağıdaki script ile KeepAlived konfigürasyonunu kontrol edebilirsiniz.

```shell
fatihtatoglu@fth-linux:~$ sudo keepalived --config-test=keepalived.conf
```

### Servislerin Etkinleştirilmesi ve Çalıştırılmaları

Ayarlamalar yapıldığına göre artık çalıştırma zamanı.

```shell
fatihtatoglu@fth-linux:~$ sudo chkconfig keepalived on
fatihtatoglu@fth-linux:~$ sudo systemctl enable firewalld
fatihtatoglu@fth-linux:~$ sudo systemctl start firewalld
fatihtatoglu@fth-linux:~$ sudo firewall-cmd --add-rich-rule='rule protocol value="vrrp" accept' --permanent
fatihtatoglu@fth-linux:~$ sudo firewall-cmd --reload
fatihtatoglu@fth-linux:~$ sudo systemctl enable keepalived
fatihtatoglu@fth-linux:~$ sudo systemctl start keepalived
```

## Test Edilmesi

İki tane sistemi kurduk. Öncelikle sistemleri tek tek denememiz lazım. Bunun için;

1. **`http://172.19.85.102:1985/stats`**
2. **`http://172.19.85.103:1985/stats`**

adreslerini ziyaret edin. Karşınıza HAProxy'nin statü sayfaları gelecektir. Sayfalarda makine isimlerinin doğru olduğuna emin olunmalı.

Sonrasında **`http://172.19.85.104:1985/stats`** adresi ziyaret edilir. KeepAlived haproxy-01 makinesi master olarak ayarlandığı için bu adres üzerinden haproxy-01 makinesindeki statü sayfasını geldiği doğrulanmalıdır.

Şimdi geldik fail-over testine. haproxy-01 makinesideki haproxy durulur.

```shell
fatihtatoglu@fth-linux:~$ sudo systemctl stop haproxy
```

Sonrasında **`http://172.19.85.104:1985/stats`** adresi ziyaret edilir ve haproxy-02 makinesinin statü sayfasının geldiğin kontrol edilir.

```shell
fatihtatoglu@fth-linux:~$ sudo systemctl start haproxy
```

Yukarıdaki komut çalıştırılır ve haproxy-01 makinesinin statü sayfası geldiği kontrol edilir.

Test edilme sırasında her fail-over ve recovery olduğunda keepalived konfigürasyon dosyasında belirlenmiş mail adresine mail olarak bilgilendirme yapılır.
