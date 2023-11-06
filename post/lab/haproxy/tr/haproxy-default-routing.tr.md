---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T20:25:53Z
permalink: ./lab/haproxy/default-routing.html
language: tr

title: Statik Yönlendirme
header: Statik Yönlendirme
description: Verimli yük dengeleme için CentOS 7.X'te HAProxy'yi kurun. Hazırlık, kurulum, yapılandırma ve güvenlik için adım adım talimatları izleyin. Sorunsuz bir dağıtım sağlayın.
tags: haproxy redirect statik_içerik statik_yönlendirme

category: lab
order: 3

group: haproxy
groupTitle: HAProxy
groupImage: ../../../../image/lab-haproxy.png
---

HAProxy, doğru yönlendirme kuralını bulduktan sonra gelen istekleri `backend` servislerine yönlendirir. Öte yandan herhangi bir yönlendirme kuralı bulamadığında isteğin sonlandırılması gerekir. Bunun için sıradan bir yöntem statik içerik kullanmaktır. Statik içerik, sunucu maliyetlerini azaltmak için arama motorlarına karşı kullanılabilir.

```shell
devops@haproxy-01:~$ sudo vi /etc/haproxy/haproxy.conf
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

Bundan sonra statik içerik oluşturulur.

```shell
devops@haproxy-01:~$ sudo vi /etc/haproxy/errors/503.http
```

```html
HTTP/1.0 503 Service Unavailable
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

Statik yanıt hazır. HAProxy, bir isteğin yönlendirmeyle eşleştirilememesi durumunda yukarıdaki HTML içeriğini 503 HTTP durum koduyla döndürecektir.

Bu değişikliği uygulamadan önce yapılandırma dosyasının doğrulanması gerekir.

```shell
devops@haproxy-01:~$ sudo /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
devops@haproxy-01:~$ sudo systemctl reload haproxy
```

Cluster ortamı var ise konfigürasyonun tüm sunuculara uygulanması gerekmektedir.
