---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T14:07:13Z
permalink: ./lab/haproxy/setup.html
language: tr

title: HAProxy - Kurulum
header: HAProxy - Kurulum
tags: haproxy centos lua kurulum kurma kaynak_kod install yükleme

category: lab
group: haproxy
groupTitle: HAProxy
order: 1
---

Bu not, CentOS 7.X Minimal üzerine kaynaktan tek sunucu kurulumu HAProxy adımlarını içerir. Bu kurulum, HAProxy ile ilgili aşağıdaki notlara yardımcı olmak için bazı ekstra adımlar da içerir.

🔥 Bu not HAProxy 2.0.29 ve Lua 5.3.5 sürümü için yazılmıştır. Daha yeni sürümler farklı konfigürasyonlara sahip olabilir.

## Ön Hazırlık

|Özellik|Minimum Değer|
|---:|:---|
|**Sunucu Adı**|haproxy-01|
|**IP Adresi**|172.19.85.102|
|**Netmask**|255.255.255.0|
|**Gateway**|172.19.85.1|
|**CPU** ⭐|4|
|**Bellek** ⭐|2 GB
|**Disk**|40GB|
|**OS**|CentOS 7.X Minimal|
|**İnternet Erişimi**|Evet|

⭐: Kurulum işlemi sırasında kaynakları artırabilirsiniz.

Kurulum ve derleme işlemi sırasında bir **root** kullanıcısına gerek yoktur. Ancak, root ayrıcalıklarına sahip bir kullanıcıya ihtiyaç duyulacaktır. Notta, kurulum ve derleme işlemi için **devops** kullanıcısı kullanılmıştır. Eğer farklı bir kullanıcınız varsa, lütfen onu kullanın.

Kurulum sırasında engellemeleri önlemek için SELinux devre dışı bırakılmıştır.

```shell
devops@haproxy-01:~$ sudo setenforce 0
devops@haproxy-01:~$ sudo sed -i 's/^SELINUX=.*/SELINUX=permissive/g' /etc/selinux/config
```

## Kurulum Hazırlığı

Güvenlik nedeniyle, HAProxy için ayrı bir kullanıcı oluşturulmalıdır.

```shell
devops@haproxy-01:~$ sudo groupadd -g 1985 haproxy
devops@haproxy-01:~$ sudo useradd -g 1985 -u 1985 -d /var/lib/haproxy -s /sbin/nologin -c haproxy haproxy
```

Aşağıdaki dosyalar indirilmeli ve sıkıştırılmış dosyalardan çıkartılmalıdır.

```shell
devops@haproxy-01:~$ curl https://www.lua.org/ftp/lua-5.3.5.tar.gz > lua-5.3.5.tar.gz
devops@haproxy-01:~$ curl http://www.haproxy.org/download/2.0/src/haproxy-2.0.29.tar.gz > haproxy-2.0.29.tar.gz

devops@haproxy-01:~$ tar xf lua-5.3.5tar.gz
devops@haproxy-01:~$ tar xf haproxy-2.0.29.tar.gz 
```

HAProxy'yi oluşturmaya başlamadan önce, bazı zorunlu kütüphanelerin yüklenmesi gerekir.

```shell
devops@haproxy-01:~$ sudo yum install gcc openssl-devel readline-devel systemd-devel make pcre-devel net-tools kernel-headers url libnl3-devel net-snmp-devel -y
devops@haproxy-01:~$ sudo yum update -y
```

## Kurulum

Lua kütüphane yolu HAProxy derleme komutu için bir parametre olduğundan derleme işlemi Lua'nın derlenmesi ile başlar.

```shell
devops@haproxy-01:~$ cd lua-5.3.5
devops@haproxy-01:~$ sudo make INSTALL_TOP=/opt/lua-5.3.5 linux install
```

Artık HAProxy kaynaktan oluşturulabilir.

```shell
devops@haproxy-01:~$ cd ~
devops@haproxy-01:~$ cd haproxy-2.0.29
devops@haproxy-01:~$ sudo make USE_NS=1 USE_TFO=1 USE_OPENSSL=1 USE_ZLIB=1 USE_LUA=1 USE_PCRE=1 USE_SYSTEMD=1 USE_LIBCRYPT=1 USE_THREAD=1 TARGET=linux-glibc LUA_INC=/opt/lua-5.3.5/include LUA_LIB=/opt/lua-5.3.5/lib
devops@haproxy-01:~$ sudo make PREFIX=/opt/haproxy install
```

Yukarıdaki parametreler HAProxy'nin genel kullanımı için seçilmiştir, daha spesifik parametrelere ihtiyacınız varsa kaynak koddaki **INSTALL** dosyası içinde yer almaktadır. Lütfen değişen parametrelerin HAProxy performansını ve çalışma şeklini etkilediğini unutmayın.

## Konfigürasyon

HAProxy'yi oluşturduktan sonra, `systemctl` ile kontrol etmek için bir servis tanımı oluşturulmalıdır.

```shell
devops@haproxy-01:~$ sudo vi /etc/systemd/system/haproxy.service
```

```ini
[Unit]
Description=HAProxy 2.0.29
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

Şimdi, başlangıç parametrelerini ve seçeneklerini tanımlamak için işlem dosyası oluşturulmalıdır.

```shell
devops@haproxy-01:~$ sudo vi /etc/sysconfig/haproxy
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

Yapılandırma bölümündeki son adım, bir HAProxy yapılandırma dosyası oluşturmaktır. Bu yapılandırma dosyası proxy tanımlarını, servis ve sunucu tanımlarını içerir.

```shell
devops@haproxy-01:~$ sudo mkdir /etc/haproxy/
devops@haproxy-01:~$ sudo vi /etc/haproxy/haproxy.conf
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

Yapılandırma bölümünü tamamlamak için, HAProxy yapılandırmasını doğrulamak için gerekli bir komut vardır.

```shell
devops@haproxy-01:~$ sudo /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
```

Bu komut, HAProxy yapılandırma dosyasındaki herhangi bir yapılandırma değişikliğinden sonra çalıştırılmalıdır.

## Güvenlik

SELinux devre dışıdır, ancak ağ saldırılarını veya keşfedilebilirliği önlemek için güvenlik duvarı etkinleştirilmelidir. Port bazında bir tanımlama yapmak karmaşıklık yaratır, bu nedenle Güvenlik Duvarı için bir HAProxy hizmet tanımı oluşturmak daha iyidir.

```shell
devops@haproxy-01:~$ sudo vi /etc/firewalld/services/haproxy.xml
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

Normal trafik için `80` ve `443` portları eklenmiştir. HAProxy durum sayfası erişimi için `1985` portu eklenmiştir. Ek portlarınızı ileride bu dosyaya ekleyebilirsiniz. Ekledikten sonra Güvenlik Duvarını ve HAProxy'i yeniden başlatmak gereklidir.

```shell
devops@haproxy-01:~$ sudo chmod 640 /etc/firewalld/services/haproxy.xml
```

## Çalıştırma

```shell
devops@haproxy-01:~$ sudo systemctl enable firewalld
devops@haproxy-01:~$ sudo sudo systemctl start firewalld
devops@haproxy-01:~$ sudo firewall-cmd --permanent --add-service=haproxy
devops@haproxy-01:~$ 
devops@haproxy-01:~$ sudo firewall-cmd --reload
devops@haproxy-01:~$ sudo systemctl enable haproxy
devops@haproxy-01:~$ sudo systemctl start haproxy
```

Yukarıdaki komutlar ile HAProxy'e kalıcı erişim sağlanır ve HAProxy'nin servisi etkinleştirilir ve başlatılır. Eğer herhangi bir sorun yoksa HAProxy çalışmalıdır.

## Doğrulama

Kurulumdan sonra, kurulumu dahili ve harici olarak doğrulamalısınız.

```shell
devops@haproxy-01:~$ sudo systemctl status haproxy
```

Yukarıdaki komutlar dahili doğrulama için **Running** durumunu döndürmelidir. Harici doğrulama için, HAProxy durum sayfası için HAProxy yapılandırma dosyasında tanımlanan `http://172.19.85.102:1985/stats` adresini ziyaret edebilirsiniz.
