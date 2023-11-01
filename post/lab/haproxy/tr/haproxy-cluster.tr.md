---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T18:41:00Z
permalink: ./lab/haproxy/cluster.html
language: tr

title: Cluster
header: Cluster
description: Verimli yük dengeleme için CentOS 7.X'te HAProxy'yi kurun. Hazırlık, kurulum, yapılandırma ve güvenlik için adım adım talimatları izleyin. Sorunsuz bir dağıtım sağlayın.
tags: haproxy keepalived centos failover high_availability

category: lab
group: haproxy
groupTitle: HAProxy
order: 2
---

Bu not, iki HAProxy sunucusuna sahip bir cluster kurulumunu içerir.

🔥 Bu not KeepAlived 2.2.7 sürümü için yazılmıştır. Daha yeni sürümler farklı konfigürasyonlara sahip olabilir.

## Ön Hazırlık

|Özellik|Master Sunucu|Slave Sunucu|
|---:|:---|:---|
|**Sunucu Adı**|haproxy-01|haproxy-02|
|**IP Adresi**|172.19.85.102|172.19.85.103|
|**Netmask**|255.255.255.0|255.255.255.0|
|**Gateway**|172.19.85.1|172.19.85.1|
|**CPU** ⭐|4|4|
|**Bellek** ⭐|2 GB|2 GB|
|**Disk**|40GB|40 GB|
|**OS**|CentOS 7.X Minimal|CentOS 7.X Minimal|
|**İnternet Erişimi**|Evet|Evet|

⭐: Kurulum işlemi sırasında kaynakları artırabilirsiniz.

Kurulum ve derleme sürecinde **root** kullanıcıya gerek yoktur. Ancak root ayrıcalıklarına sahip bir kullanıcıya ihtiyaç duyulacaktır. Notta **devops** kullanıcısı kurulum ve derleme süreci için kullanılır. Farklı bir kullanıcınız varsa lütfen onu kullanın.

Ayrıca clusterın master sunucuya hizmet verebilmesi için özel bir IP adresine ihtiyacı vardır. Dolayısıyla bu notta sanal IP adresi olarak `172.19.85.104` kullanılacaktır.

## Kurulum Hazırlığı

Aşağıdaki dosya ilk sunucuya indirilmeli ve çıkartılmalıdır.

```shell
devops@haproxy-01:~$ curl https://www.keepalived.org/software/keepalived-2.2.7.tar.gz > keepalived-2.2.7.tar.gz

devops@haproxy-01:~$ tar xf keepalived-2.2.7.tar.gz
```

Aşağıdaki dosya ikinci sunucuya indirilmeli ve çıkartılmalıdır.

```shell
devops@haproxy-02:~$ curl https://www.keepalived.org/software/keepalived-2.2.7.tar.gz > keepalived-2.2.7.tar.gz

devops@haproxy-02:~$ tar xf keepalived-2.2.7.tar.gz
```

## Kurulum

Derleme işlemi otomatiktir ve master ve slave sunucularda aşağıdaki komutların çalıştırılması gerekir.

```shell
devops@haproxy-01:~$ cd ~
devops@haproxy-01:~$ sudo su
root@haproxy-01:/home/devops# 
root@haproxy-01:/home/devops# cd keepalived-2.2.7
root@haproxy-01:/home/devops# ./configure --prefix=/
root@haproxy-01:/home/devops# make
root@haproxy-01:/home/devops# make install
root@haproxy-01:/home/devops# exit
devops@haproxy-01:~$
```

```shell
devops@haproxy-02:~$ cd ~
devops@haproxy-02:~$ sudo su
root@haproxy-02:/home/devops# 
root@haproxy-02:/home/devops# cd keepalived-2.2.7
root@haproxy-02:/home/devops# ./configure --prefix=/
root@haproxy-02:/home/devops# make
root@haproxy-02:/home/devops# make install
root@haproxy-02:/home/devops# exit
devops@haproxy-02:~$
```

## Konfigürasyon

Yapılandırma bölümüne başlamadan önce KeepAlived kütüphanesinin çalışma tarzı anlaşılmalıdır. Kütüphane aynı anda master ve slave sunucuları dinler. Master sunucu sorunlarla karşılaşırsa, slave sunucu IP adresini sanal IP adresiyle günceller. Master sunucu tekrar canlı veya kullanılabilir hale geldiğinde kitaplık, master sunucunun IP adresini günceller. Bunu yapmak için kütüphanenin bir failover scriptine ihtiyacı vardır.

### Failover Script

Failover script dosyası HAProxy hizmetinin durumunu kontrol eder. Komut dosyasının tüm sunuculara eklenmesi gerekir.

```shell
devops@haproxy-01:~$ sudo vi /usr/local/bin/failover.sh
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

KeepAlived kitaplığı root ayrıcalıklarıyla çalışır, bu nedenle failover script dosyasının ayrıcalıklarının güncellenmesi gerekir.

```shell
devops@haproxy-01:~$ sudo chmod a+rx /usr/local/bin/failover.sh
```

Sunucuların yapılandırmasına devam edelim. Master ve slave sunucuların konfigürasyonları farklıdır. Aşağıda paylaşılmaktadır.

### Master Sunucu

```shell
devops@haproxy-01:~$ sudo vi /etc/keepalived/keepalived.conf
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

Doğrulamak için konfigürasyon dosyasını ekledikten sonra aşağıdaki komut kullanılabilir.

```shell
devops@haproxy-01:~$ sudo keepalived --config-test=keepalived.conf
```

### Slave Sunucu

```shell
devops@haproxy-02:~$ sudo vi /etc/keepalived/keepalived.conf
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

Doğrulamak için konfigürasyon dosyasını ekledikten sonra aşağıdaki komut kullanılabilir.

```shell
devops@haproxy-02:~$ sudo keepalived --config-test=keepalived.conf
```

## Güvenlik

Hatırlarsanız zaten HAProxy için güvenlik duvarı ayarlanmıştı. Şimdi KeepAlived kütüphanesine izin vermek için aşağıdaki komut faydalı olacaktır.

```shell
devops@haproxy-01:~$ sudo firewall-cmd --add-rich-rule='rule protocol value="vrrp" accept' --permanent
devops@haproxy-01:~$ sudo firewall-cmd --reload
```

```shell
devops@haproxy-02:~$ sudo firewall-cmd --add-rich-rule='rule protocol value="vrrp" accept' --permanent
devops@haproxy-02:~$ sudo firewall-cmd --reload
```

## Çalıştırma

```shell
devops@haproxy-01:~$ sudo chkconfig keepalived on
devops@haproxy-01:~$ sudo systemctl enable keepalived
devops@haproxy-01:~$ sudo systemctl start keepalived
```

```shell
devops@haproxy-02:~$ sudo chkconfig keepalived on
devops@haproxy-02:~$ sudo systemctl enable keepalived
devops@haproxy-02:~$ sudo systemctl start keepalived
```

## Doğrulama

Öncelikle tüm sunucuların ayrı ayrı test edilmesi gerekmektedir. Bunun için;

1. `http://172.19.85.102:1985/stats`
2. `http://172.19.85.103:1985/stats`

yukarıdaki adresler tarayıcı üzerinden ziyaret edilmelidir. HAProxy hizmetlerinin durum sayfası gösterilmelidir.

Daha sonra tarayıcı üzerinden `http://172.19.85.104:1985/stats` adresine gidilmeli ve master sunucunun durum sayfası gösterilmelidir.

Şu ana kadar herhangi bir sorun yaşanmadıysa her şey yolunda görünüyor. Bir sonraki adımda HAProxy hizmet durumuyla oynayalım.

```shell
devops@haproxy-01:~$ sudo systemctl stop haproxy
```

Yukarıdaki komutla master sunucudaki HAProxy hizmeti kapatılır. `http://172.19.85.104:1985/stats` adresini tekrar ziyaret ettikten sonra beklenen slave sunucunun durum sayfasının gösterilmesidir.

Son olarak aşağıdaki komut çalıştırıldığında her şey başlangıç durumunda olmalıdır.

```shell
devops@haproxy-01:~$ sudo systemctl start haproxy
```

Bu arada, yapılandırma dosyalarını kontrol ederseniz bir e-posta adresi görebilirsiniz. Yani her yük devretme durumu değişikliğinden sonra bir e-posta alırsınız. Lütfen e-posta adresini güncellemeyi unutmayın. Aksi halde e-postam kilitlenebilir.
