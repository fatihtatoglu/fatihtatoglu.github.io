---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T19:03:27Z
permalink: ./kendime-notlar/lab/haproxy/ssl-sertifikasi-ekleme.html
language: tr

description: HAProxy kendisine gelen SSL trafiğini de yönetebilmektedir. Bunun için ilk adım sertifika ayarlaması.
tags: haproxy ssl tls https sertifika
---

# HAProxy - SSL Sertifikası Ekleme

HAProxy kendisine gelen SSL isteklerini de karşılayabilmektedir. Bu istekleri `backend` servislerine doğru aktarmak için `frontend` servislerinde doğru tanımların yapılması gerekmektedir.

HAProxy konfigürasyon dosyasını aşağıdaki gibi güncelliyoruz.

```shell
> sudo vi /etc/haproxy/haproxy.conf
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

Bu ayar sayesinde artık 443 portundan gelen SSL isteklerini istediğiniz `backend` servisine aktarabilirsiniz. Konfigürasyonu doğrulamadan önce sertifikanın belirttiğiniz yerde olmasını sağlamamız gerekiyor. HAProxy hem public hem de private key'in aynı dosyada peş peşe olmasını istiyor. Bunun için aşağıdaki komutları çalıştırabilirsiniz.

Ben bu işlemleri yaparken hep elimde pfx uzantılı sertifika dosyası oluyordu. Eğer sizin elinizde farklı formatlarda varsa mutlaka pem formatına ayarlamanız gerekecek.

```shell
> sudo su
$ openssl pkcs12 -in certificate.pfx -nocerts -out certificate_priv.pem -nodes
$ openssl pkcs12 -in certificate.pfx -nokeys -out certificate_public.pem -nodes
$ cat certificate_public.pem certificate_priv.pem > certificate-cert-key.pem
$ mv certificate-cert-key.pem /etc/haproxy/certificates/certificate-cert-key.pem
```

Bu ayar uygulanmadan önce doğruluğu kontrol edilmeli ve sonrasında servisler güncellenerek yayına alınmalıdır.

Eğer cluster bir yapınız varsa iki makinede de aynı geliştirmenin yapılması gerekmektedir.

```shell
sudo /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
sudo systemctl reload haproxy
```
