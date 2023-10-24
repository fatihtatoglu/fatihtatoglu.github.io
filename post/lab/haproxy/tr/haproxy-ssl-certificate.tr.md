---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T19:03:27Z
permalink: ./lab/haproxy/ssl-certificate.html
language: tr

title: SSL Sertifika
header: SSL Sertifika
tags: haproxy ssl tls https sertifika pfx pem

category: lab
group: haproxy
groupTitle: HAProxy
order: 4
---

HAProxy, SSL yapılandırması geçerliyse SSL isteğini işleyebilir. Genellikle akış, isteğin `frontend` hizmetini karşılaması ve ardından `backend` hizmetine geçmesi şeklindedir. SSL/TLS sertifika tanımı `frontend` tarafında görülmektedir. HAProxy'yi yapılandırmadan önce SSL tanımlama stratejilerinin türlerini kontrol edelim.

## TLS / SSL Offloading

![TLS / SSL Offloading](../../../../image/tls-offloading.png "TLS Offloading - [HAProxy Encryption Strategies](https://www.haproxy.com/documentation/aloha/latest/security/tls/encryption-strategies/)")

Bu stratejiyle HAProxy, istemci ile kendisi arasındaki mesajları şifreler, ancak kendisi ile arka uç sunucuları arasındaki iletişim şifrelenmez. SSL/TLS sertifikası HAProxy sunucularında saklanır.

## TLS / SSL Passthrough

![TLS / SSL Passthrough](../../../../image/tls-passthrough.png "TLS Passthrough - [HAProxy Encryption Strategies](https://www.haproxy.com/documentation/aloha/latest/security/tls/encryption-strategies/)")

Bu stratejiyle HAProxy, şifreleme veya şifre çözme işlemini uygulamaz. Bu işlemden backend sunucuları sorumludur. İstek, doğru yönlendirme kuralıyla eşleştirildikten sonra herhangi bir işlem yapılmadan yalnızca backend sunucusuna iletilir.

## TLS / SSL Bridging

![TLS / SSL Bridging](../../../../image/tls-bridging.png "TLS Bridging - [HAProxy Encryption Strategies](https://www.haproxy.com/documentation/aloha/latest/security/tls/encryption-strategies/)")

Bu stratejiyle HAProxy tüm mesajları şifreler. İstek HAProxy'ye ulaşır ve HAProxy, header doğrulama gibi bazı işlemler için isteğin şifresini çözer. Daha sonra istek, backend sunuculara iletilmek üzere HAProxy tarafından şifrelenir. SSL/TLS sertifikası her iki tarafta da, HAProxy ve backend sunucularda tutulmalıdır.

## Konfigürasyon

```shell
devops@haproxy-01:~$ sudo vi /etc/haproxy/haproxy.conf
```

```nestedtext
...
##################################################
#                    Frontend                    #
##################################################
frontend https_in
    mode http
    bind *:443 ssl crt /etc/haproxy/certificates/certificate-cert-key.pem

    ...

    default_backend be_default
##################################################


##################################################
#                    Backend                     #
##################################################
backend be_default
    mode http

    errorfile 503 /etc/haproxy/errors/503.http
##################################################
...
```

Yukarıdaki yapılandırmayla HAProxy, SSL / TLS isteklerini işleyebilir ve bunları "arka uç" sunucularına iletebilir. Yapılandırmayı doğrulamadan önce SSL/TLS sertifikasının belirtilen konumda PEM formatında bulunması gerekir. HAProxy, PEM dosyasının genel ve özel anahtarı sırayla içermesini ister. Bu işlem için aşağıdaki komutlar faydalı olabilir.

```shell
devops@haproxy-01:~$ sudo su
root@haproxy-01:/home/devops# openssl pkcs12 -in certificate.pfx -nocerts -out certificate_priv.pem -nodes
root@haproxy-01:/home/devops# openssl pkcs12 -in certificate.pfx -nokeys -out certificate_public.pem -nodes
root@haproxy-01:/home/devops# cat certificate_public.pem certificate_priv.pem > certificate-cert-key.pem
root@haproxy-01:/home/devops# mv certificate-cert-key.pem /etc/haproxy/certificates/certificate-cert-key.pem
```

Komut, önce özel ve genel anahtarları pfx dosyasından çıkarır. Özel ve genel anahtarlarınız ayrı ayrı varsa aşağıdaki talimatları kullanabilirsiniz.

```shell
devops@haproxy-01:~$ sudo su
root@haproxy-01:/home/devops# cat certificate_public.pem certificate_priv.pem > certificate-cert-key.pem
root@haproxy-01:/home/devops# mv certificate-cert-key.pem /etc/haproxy/certificates/certificate-cert-key.pem
```

Bu değişikliği uygulamadan önce yapılandırma dosyasının doğrulanması gerekir.

```shell
devops@haproxy-01:~$ sudo /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
devops@haproxy-01:~$ sudo systemctl reload haproxy
```

Cluster ortamı var ise konfigürasyonun tüm sunuculara uygulanması gerekmektedir.
