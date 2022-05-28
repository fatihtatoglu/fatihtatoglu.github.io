---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-05-28T18:49:21Z
permalink: ./kendime-notlar/haproxy.html
language: tr

description: HAProxy'nin CentOS üzerinde cluster olarak kurulmasını anlatan notlarım.
tags: haproxy load_balancer reverse_proxy keepalived centos
category: notes
---

# HAProxy

Bu notumda CentOS 7.X üzerine cluster olacak şekilde HAProxy kurma notlarımı bulabilirsiniz. Kurulum kaynak kodlar üzerinden yapılacak şekildedir.

## Ortamların Hazırlanması

Öncelikle yükleme yapacağımız ortamların hazırlanması gerekiyor. Kurulum için 2 tane CentOS makine ve 3 tane de IP adresi gerekiyor. Örnek kurulum için makine özellikleri aşağıdaki gibidir.

|Makine Adı|IP Adresi|CPU|RAM|Disk|OS|
|:---:|:---:|:---:|:---:|:---:|:---:|
|haproxy-01|192.168.160.2|4|2 GB|40 GB|CentOS 7.X Minimal|
|haproxy-02|192.168.160.3|4|2 GB|40 GB|CentOS 7.X Minimal|

192.168.160.4 IP adresi de 3. IP adresi olarak tanımlanmıştır. Makinelere root kullanıcısı ile erişildiği varsayılmaktadır.

`root` ile işlem yapmamak için makinelere `devops` adında bir kullanıcı tanımlanıyor.

```shell
>
$ adduser devops
$ passwd devops
$ usermod -aG wheel devops
```

Makineler clone olabilirler. Clone makinelerde **machine-id** aynı olacağı için ileride başımıza dert olabilir. Bunun için aşağıdaki komutlar ile **machine-id** değerini tekilleştirebiliriz.

```shell
>
$ cat /etc/machine-id
$ rm -f /etc/machine-id
$ systemd-machine-id-setup
$ cat /etc/machine-id
```

Makinelerde SELinux'un kapatılması clusterın doğru çalışması için gereklilik olduğu için aşağıdaki kod ile kapatılabilir.

```shell
>
$ setenforce 0
$ sed -i 's/^SELINUX=.*/SELINUX=permissive/g' /etc/selinux/config
```

Bu işlemlerden sonra makine mutlaka restart edilmelidir.

## Gerekli Kullanıcıların Tanımlanması

Güvenlik sebebiyle HAProxy ve cluster için kullanılacak Keep Alived için ayrı kullanıcılar açılmaktadır.

```shell
> sudo su
$ groupadd -g 1985 haproxy
$ useradd -g 1985 -u 1985 -d /var/lib/haproxy -s /sbin/nologin -c haproxy haproxy
$ useradd -g users -M keepalived_script
```

## Gerekli Dosyaların İndirilmesi

Yükleme yapılması için gereken kaynak kodların indirilmesi.

```shell
> curl https://www.lua.org/ftp/lua-5.4.4.tar.gz > lua-5.4.4.tar.gz
> curl http://www.haproxy.org/download/2.5/src/haproxy-2.5.7.tar.gz > haproxy-2.5.7.tar.gz
> curl https://www.keepalived.org/software/keepalived-2.2.7.tar.gz > keepalived-2.2.7.tar.gz

> tar xf lua-5.4.4.tar.gz
> tar xf haproxy-2.5.7.tar.gz 
> tar xf keepalived-2.2.7.tar.gz
```

## Gerekli Kütüphanelerin Kurulması

Kaynak kodların derlenmesi için bazı kütüphanelerin yüklenmesi gerekmektedir.

```shell
> sudo su
$ yum install gcc openssl-devel readline-devel systemd-devel make pcre-devel net-tools kernel-headers url libnl3-devel net-snmp-devel -y
$ yum update -y
```

## Lua'nın Derlenmesi

Lua HAProxy içerisinde özelleştiş scriptler yazmak için kullanılabiliyor. İleride ihtiyaç olacağı için kuruluma dahil edildi.

```shell
> sudo su
$ cd lua-5.4.4
$ make INSTALL_TOP=/opt/lua-5.4.4 linux install
```

## HAProxy'nin Derlenmesi

HAProxy kod üzerinden derlenirken Lua'nın derlendiği yerin parametre olarak geçmesi gerekliliğinden dolayı ikinci sırada kurulmaktadır.

```shell
> sudo su
$ cd haproxy-2.5.7
$ make USE_NS=1 USE_TFO=1 USE_OPENSSL=1 USE_ZLIB=1 USE_LUA=1 USE_PCRE=1 USE_SYSTEMD=1 USE_LIBCRYPT=1 USE_THREAD=1 TARGET=linux-glibc LUA_INC=/opt/lua-5.4.4/include LUA_LIB=/opt/lua-5.4.4/lib
$ make PREFIX=/opt/haproxy install
```

## KeepAlived'ın Derlenmesi

HAProxy'nin cluster olarak çalışması sağlayacak olan uygulamanın kurulumu.

```shell
> sudo su
$ cd keepalived-2.2.7
$ ./configure --prefix=/
$ make
$ make install
```

## Failover Scripti

KeepAlived HAProxy'nin çalışma durumuna göre iki makine arasında fail-over yapmaktadır. Ancak HAPrxoy uygulamasının çalıştığını anlaması için bir script ile kontrol etmesi gerekmektedir.

```shell
> sudo su
$ vi /usr/local/bin/failover.sh
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
>
$ chmod a+rx /usr/local/bin/failover.sh
```

## HAProxy'nin Konfigüre Edilmesi

HAProxy'nin doğru çalışabilmesi için doğru şekilde ayarlanması gerekmektedir. Kod üzerinden derleme yoluyla kurulum yapıldığı için de otomatik yapılan her şeyin manuel yapılması gerekmektedir.

### Servis Dosyası

HAProxy'nin servis dosyası oluşturulmalıdır. Bu sayede `systemctl` komutu ile kontrol edilebilir.

```shell
> sudo su
$ vi /etc/systemd/system/haproxy.service
```

```ini
[Unit]
Description=HAProxy 2.5.7
After=syslog.target network.target

[Service]
Type=notify
EnvironmentFile=/etc/sysconfig/haproxy
ExecStart=/opt/haproxy/sbin/haproxy -f $CONFIG_FILE -p $PID_FILE $CLI_OPTIONS
ExecReload=/bin/kill -USR2 $MAINPID
ExecStop=/bin/kill -USR1 $MAINPID

[Install]
WantedBy=multi-user.target
```

### Process Tanımı

HAProxy çalışırken hangi parametrelerle çalışacağının belirlenmesi için process tanımı yapılmalıdır.

```shell
> sudo su
$ vi /etc/sysconfig/haproxy
```

```ini
# Command line options to pass to HAProxy at startup
# The default is:
CLI_OPTIONS="-Ws"

# Specify an alternate configuration file. The default is:
CONFIG_FILE=/etc/haproxy/haproxy.conf

# File used to track process IDs. The default is:
PID_FILE=/var/run/haproxy.pid
```

### HAProxy Konfigürasyonu

HAProxy'in hangi servisleri nereye yönlendireceği ile ilgili tanımların yapılması gerekmektedir.

```shell
> sudo su
$ mkdir /etc/haproxy/
$ mkdir /etc/haproxy/errors
$ mkdir /etc/haproxy/certificates
$ vi /etc/haproxy/haproxy.conf
```

```nestedtext
##################################################
#                    Global                      #
##################################################
global
    daemon
    maxconn     5000
    user        haproxy
    group       haproxy
    chroot      /var/lib/haproxy
    log 127.0.0.1 local0          #traffic logs
    log 127.0.0.1 local1 notice   #event logs

    #SSL option
    tune.ssl.default-dh-param 2048
    ssl-server-verify none
    ssl-default-bind-options no-sslv3

    #Multithreading
    nbproc 1
    nbthread 4
    cpu-map auto:1/1-4 0-3
##################################################


##################################################
#                   Defaults                     #
##################################################
defaults
    log global
    mode http
    option httplog
    option logasap
    timeout connect 4s
    timeout client 5s
    timeout server 86400s
    timeout http-request 30s
    timeout http-keep-alive 5s
    timeout queue 60s

    #server defaults
    default-server inter 1s rise 2 fall 4
    grace 3000

    #request
    option redispatch 1
    retries 2
##################################################


##################################################
#                  Monitoring                    #
##################################################
listen stats
    bind *:1985
    mode http
    stats enable
    stats uri /stats
    stats refresh 3s
    stats show-node
    option dontlog-normal
##################################################


##################################################
#                    Frontend                    #
##################################################

##################################################


##################################################
#                    Backend                     #
##################################################

##################################################


##################################################
#                     Users                      #
##################################################

##################################################
```

Konfigürasyonun doğrulanması için aşağıdaki kodun çalıştırılması yeterlidir.

```shell
>
$ /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
```

### Firewall Tanımları

```shell
> sudo su
$ vi /etc/firewalld/services/haproxy.xml
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<service>
    <short>HAProxy</short>
    <description>HAProxy load-balancer</description>
    <port protocol="tcp" port="80"/>
    <port protocol="tcp" port="443"/>
    <port protocol="tcp" port="1985"/>
</service>
```

```shell
>
$ chmod 640 /etc/firewalld/services/haproxy.xml
```

### KeepAlived Konfigürasyonu

KeepAlived makine bazında ayrı ayrı ayarlanması gerekmektedir.

#### HAPROXY-01 Konfigürasyonu

```shell
> sudo su
$ vi /etc/keepalived/keepalived.conf
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
        192.168.160.4
    }
    track_script {
        chk_haproxy
    }
    smtp_alert true
}
```

#### HAPROXY-02 Konfigürasyonu

```shell
> sudo su
$ vi /etc/keepalived/keepalived.conf
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
        192.168.160.4
    }
    track_script {
        chk_haproxy
    }
    smtp_alert true
}
```

Aşağıdaki script ile KeepAlived konfigürasyonunu kontrol edebilirsiniz.

```shell
>
$ keepalived --config-test=keepalived.conf
```

### Servislerin Etkinleştirilmesi ve Çalıştırılmaları

Ayarlamalar yapıldığına göre artık çalıştırma zamanı.

```shell
> sudo su
$ chkconfig keepalived on
$ sudo systemctl enable firewalld
$ sudo systemctl start firewalld
$ firewall-cmd --permanent --add-service=haproxy
$ firewall-cmd --add-rich-rule='rule protocol value="vrrp" accept' --permanent
$ firewall-cmd --reload

$ systemctl enable haproxy
$ systemctl enable keepalived
$ systemctl start haproxy
$ systemctl start keepalived
```

## Test Edilmesi

İki tane sistemi kurduk. Öncelikle sistemleri tek tek denememiz lazım. Bunun için;

1. `http://192.168.160.2:1985/stats`
2. `http://192.168.160.3:1985/stats`

adreslerini ziyaret edin. Karşınıza HAProxy'nin statü sayfaları gelecektir. Sayfalarda makine isimlerinin doğru olduğuna emin olunmalı.

Sonrasında `http://192.168.160.4:1985/stats` adresi ziyaret edilir. KeepAlived haproxy-01 makinesi master olarak ayarlandığı için bu adres üzerinden haproxy-01 makinesindeki statü sayfasını geldiği doğrulanmalıdır.

Şimdi geldik fail-over testine. haproxy-01 makinesideki haproxy durulur.

```shell
> sudo su
$ systemctl stop haproxy
```

Sonrasında `http://192.168.160.4:1985/stats` adresi ziyaret edilir ve haproxy-02 makinesinin statü sayfasının geldiğin kontrol edilir.

```shell
>
$ systemctl start haproxy
```

Yukarıdaki komut çalıştırılır ve haproxy-01 makinesinin statü sayfası geldiği kontrol edilir.

Test edilme sırasında her fail-over ve recovery olduğunda keepalived konfigürasyon dosyasında belirlenmiş mail adresine mail olarak bilgilendirme yapılır.
