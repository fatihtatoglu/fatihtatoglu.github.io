---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T14:07:13Z
permalink: ./lab/haproxy/kurulum.html
language: tr

title: HAProxy - Kurulum
header: HAProxy - Kurulum
description: HAProxy'nin kaynak kodu üzerinden kurulması ve basit ayarlarının yapılması.
tags: haproxy centos lua kurulum install
---

Bu notumda CentOS 7.X Minimal üzerine HAProxy kurma notlarımı bulabilirsiniz. Kurulum kaynak kodlar üzerinden yapılacak şekildedir.

## Ortamın Hazırlanması

Öncelikle yükleme yapacağımız ortamın hazırlanması gerekiyor. Kurulum için 1 tane CentOS makine gerekiyor. Örnek kurulum için makine özellikleri aşağıdaki gibidir.

|Makine Adı|IP Adresi|CPU|RAM|Disk|OS|
|:---:|:---:|:---:|:---:|:---:|:---:|
|haproxy-01|172.19.85.102|4|2 GB|40 GB|CentOS 7.X Minimal|

**root** ile işlem yapmamak için makineye **devops** adında bir kullanıcı tanımlanıyor. **devops** kullanıcısı sadece makineye login olmak için kullanılıyor. Eğer başka kullanıcınız varsa bu adımı geçebilirsiniz.

```shell
fatihtatoglu@fth-linux:~$ sudo adduser devops
fatihtatoglu@fth-linux:~$ sudo passwd devops
fatihtatoglu@fth-linux:~$ sudo usermod -aG wheel devops
```

Makine clone olabilir. Eğer sıfırdan kurulum yapıldıysa bu adımı geçebilirsiniz. Clone makinede **machine-id** aynı olacağı için ileride başımıza dert olabilir. Bunun için aşağıdaki komutlar ile **machine-id** değeri tekilleştirilebilir.

```shell
fatihtatoglu@fth-linux:~$ sudo cat /etc/machine-id
fatihtatoglu@fth-linux:~$ sudo rm -f /etc/machine-id
fatihtatoglu@fth-linux:~$ sudo systemd-machine-id-setup
fatihtatoglu@fth-linux:~$ sudo cat /etc/machine-id
```

HAProxy çalışırken SELinux'a ihtiyaç duymamaktadır. İlerleyen kurulumlarda da sorun olmaması adına SELinux aşağıdaki komutlar ile kapatılmaktadır.

```shell
fatihtatoglu@fth-linux:~$ sudo setenforce 0
fatihtatoglu@fth-linux:~$ sudo sed -i 's/^SELINUX=.*/SELINUX=permissive/g' /etc/selinux/config
```

Bu işlemlerden sonra makine mutlaka restart edilmelidir.

## Kullanıcı Tanımlama

Güvenlik sebebiyle HAProxy için ayrı kullanıcı açılmaktadır.

```shell
fatihtatoglu@fth-linux:~$ sudo groupadd -g 1985 haproxy
fatihtatoglu@fth-linux:~$ sudo useradd -g 1985 -u 1985 -d /var/lib/haproxy -s /sbin/nologin -c haproxy haproxy
```

## Dosyaların İndirilmesi

HAProxy kurulumunu kaynak kod üzerinden yapacağımız için kaynak kodları ve gereken destek kodlarının da indirilmesi için aşağıdaki komutlar çalıştırılır.

```shell
fatihtatoglu@fth-linux:~$ curl https://www.lua.org/ftp/lua-5.3.5.tar.gz > lua-5.3.5.tar.gz
fatihtatoglu@fth-linux:~$ curl http://www.haproxy.org/download/2.0/src/haproxy-2.0.29.tar.gz > haproxy-2.0.29.tar.gz

fatihtatoglu@fth-linux:~$ tar xf lua-5.3.5tar.gz
fatihtatoglu@fth-linux:~$ tar xf haproxy-2.0.29.tar.gz 
```

Bu yazıyı yazarken HAProxy 2.0.29 ve Lua 5.3.5 sürümü vardı. Kurulum yapmadan önce mutlaka son kararlı sürümü tercih edilmesini öneriyorum. Bu sayede olası güvenlik açıkları ya da tehtidleri ile daha az karşılaşıyor olursunuz.

## Gerekli Kütüphanelerin Kurulması

Kaynak kodların derlenmesi için bazı kütüphanelerin yüklenmesi gerekmektedir.

```shell
fatihtatoglu@fth-linux:~$ sudo yum install gcc openssl-devel readline-devel systemd-devel make pcre-devel net-tools kernel-headers url libnl3-devel net-snmp-devel -y
fatihtatoglu@fth-linux:~$ sudo yum update -y
```

## Lua'nın Derlenmesi

Lua HAProxy içerisinde özelleşmiş scriptler yazmak için kullanılabiliyor. İleride ihtiyaç olacağı için kuruluma dahil edildi.

```shell
fatihtatoglu@fth-linux:~$ cd lua-5.3.5
fatihtatoglu@fth-linux:~$ sudo make INSTALL_TOP=/opt/lua-5.3.5 linux install
```

## HAProxy'nin Derlenmesi

HAProxy kod üzerinden derlenirken Lua'nın derlendiği yerin parametre olarak geçmesi gerekliliğinden dolayı ikinci sırada kurulmaktadır.

```shell
fatihtatoglu@fth-linux:~$ cd ~
fatihtatoglu@fth-linux:~$ cd haproxy-2.0.29
fatihtatoglu@fth-linux:~$ sudo make USE_NS=1 USE_TFO=1 USE_OPENSSL=1 USE_ZLIB=1 USE_LUA=1 USE_PCRE=1 USE_SYSTEMD=1 USE_LIBCRYPT=1 USE_THREAD=1 TARGET=linux-glibc LUA_INC=/opt/lua-5.3.5/include LUA_LIB=/opt/lua-5.3.5/lib
fatihtatoglu@fth-linux:~$ sudo make PREFIX=/opt/haproxy install
```

HAProxy versiyon ilerlettikçe kurulum sırasında bazı parametreler değişmektedir. Bu parametreler HAProxy'nin çalışma şeklini değiştireceği için mutlaka ihtiyaç ve sürüme göre tekrar kontrol edilmelidir. Bu bilgiyi HAProxy'nin kaynak kodunu indirdiğiniz dosyanın içerisindeki **INSTALL** dokümanında bulacaksınız.

## HAProxy'nin Konfigüre Edilmesi

HAProxy'nin doğru çalışabilmesi için doğru şekilde ayarlanması gerekmektedir. Kod üzerinden derleme yoluyla kurulum yapıldığı için de otomatik yapılan her şeyin manuel yapılması gerekmektedir.

### Servis Dosyası

HAProxy'nin servis dosyası oluşturulmalıdır. Bu sayede `systemctl` komutu ile kontrol edilebilir.

```shell
fatihtatoglu@fth-linux:~$ sudo vi /etc/systemd/system/haproxy.service
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

### Process Tanımı

HAProxy çalışırken hangi parametrelerle çalışacağının belirlenmesi için process tanımı yapılmalıdır. Servis tanımı yapılırken bu dosya da **EnvironmentFile** ile dahil edilmektedir. Eğer bu dosyayı tanımlamak istemiyorsanız servis tanımı sırasında buradaki tanımları vermeniz gerekmektedir.

```shell
fatihtatoglu@fth-linux:~$ sudo vi /etc/sysconfig/haproxy
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

HAProxy'in hangi servisleri nereye yönlendireceği ile ilgili tanımların yapılması gerekmektedir. Bu genel kurulum için bir şablon niteliğindedir. İhtiyaçlar doğrultusunda değiştirilmelidir.

```shell
fatihtatoglu@fth-linux:~$ sudo mkdir /etc/haproxy/
fatihtatoglu@fth-linux:~$ sudo vi /etc/haproxy/haproxy.conf
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
fatihtatoglu@fth-linux:~$ sudo /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
```

Konfigürasyon dosyasında yapılacak her hangi bir değişiklik sonrasında bu komutun değişikliklerin yayına alınmadan önce çalıştırılması daha güvenli olacaktır. Hatalı bir durumda HAProxy servisi duracağı için kesintiler oluşabilir.

### Firewall Tanımları

Eğer makinede firewall açıksa mutlaka HAProxy için gereken tanımların yapılması gerekmektedir. Bu tanımları ihtiyaçlar doğrultusunda güncellemek gerekeceği unutulmamalıdır.

```shell
fatihtatoglu@fth-linux:~$ sudo vi /etc/firewalld/services/haproxy.xml
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
fatihtatoglu@fth-linux:~$ sudo chmod 640 /etc/firewalld/services/haproxy.xml
```

### Servislerin Etkinleştirilmesi ve Çalıştırılmaları

Gereken derlemeler ve ayarlama dosyaları hazırlandıktan sonra sistemi ayağa kaldırmak için aşağıdaki komutların çalıştırılması yeterli olacaktır.

```shell
fatihtatoglu@fth-linux:~$ sudo systemctl enable firewalld
fatihtatoglu@fth-linux:~$ sudo sudo systemctl start firewalld
fatihtatoglu@fth-linux:~$ sudo firewall-cmd --permanent --add-service=haproxy
fatihtatoglu@fth-linux:~$ 
fatihtatoglu@fth-linux:~$ sudo firewall-cmd --reload
fatihtatoglu@fth-linux:~$ sudo systemctl enable haproxy
fatihtatoglu@fth-linux:~$ sudo systemctl start haproxy
```

## Test Edilmesi

Kurulum tamamlandı artık test edilmesi gerekiyor. Bu testi yapmanın en basit yolu da HAProxy'nin bize sağladığı detaylı dashboard ekranının kontrol edilmesi. Kurulumu yaptığımız makineye IP adresi üzerinden browser ile **`http://172.19.85.102:1985/stats`** adresi ile erişebiliriz.
