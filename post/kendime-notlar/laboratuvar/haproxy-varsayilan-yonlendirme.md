---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T20:25:53Z
permalink: ./kendime-notlar/lab/haproxy/varsayilan-yonlendirme.html
language: tr

description: HAProxy yönlendirmeyi kurallara göre yapmaktadır. Ancak bazen kurallara uymayan isteklerde geldiğinde bunların da cevaplanması gerekmektedir.
tags: haproxy redirect static_content statik_icerik
---

# HAProxy - Varsayılan Yönlendirme

HAProxy gelen istekleri ayarlanan filtrelerden geçirerek ilgili `backend` servislerine yönlendirmektedir. Ancak eşleşme olmadığı zaman isteğin sonlanması için varsayılan bir cevap dönülmesi çok uygulanan bir yöntemdir. Bu yöntemi statik dosyalar için de kullanabiliriz. Özellikle arama motorlarının taramalarını bu şekilde sisteme yük getirmeden yapmasını sağlayabiliriz.

HAProxy konfigürasyon dosyasını aşağıdaki gibi güncelliyoruz.

```shell
> sudo vi /etc/haproxy/haproxy.conf
```

```nestedtext
...
##################################################
#                    Frontend                    #
##################################################
frontend http_in
    mode http
    bind *:80

    #logging
    option httplog

    #http options
    option http-server-close
    option forwardfor

    #redirection rules

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

Sonrasında statik içeriği oluşturuyoruz.

```shell
> sudo vi /etc/haproxy/errors/503.http
```

```html
HTTP/1.0 200 Found
Cache-Control: no-cache
Connection: close
Content-Type: text/html

<html>
    <head>
        <title>Fatih Tatoğlu</title>
    </head>
    <body>
        <h1>SERVICE UNAVAILABLE</h1>
        <p>The server is currently unable to handle the request due to a temporary overload or scheduled maintenance, which will likely be alleviated after some delay.</p>
    </body>
</html>
```

Artık varsayılan cevabımız hazırdır. Konfigürasyon dosyasında 503 HTTP statü değerini verdiğimiz için istemciye 503 olarak dönülecektir.

Bu ayar uygulanmadan önce doğruluğu kontrol edilmeli ve sonrasında servisler güncellenerek yayına alınmalıdır.

Eğer cluster bir yapınız varsa iki makinede de aynı geliştirmenin yapılması gerekmektedir.

```shell
> sudo /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
> sudo systemctl reload haproxy
```
