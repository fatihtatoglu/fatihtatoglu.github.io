---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T20:25:53Z
permalink: ./en/lab/haproxy/default-routing.html
language: en

title: HAProxy - Static Routing
header: Static Routing
description: Set up HAProxy on CentOS 7.X for efficient load balancing. Follow step-by-step instructions for preparation, installation, configuration, and security. Ensure a smooth deployment.
tags: haproxy redirect static_content

category: lab
order: 3

group: haproxy
groupTitle: HAProxy
groupImage: ../../../../image/lab-haproxy.png
---

HAProxy routes the incoming requests to the `backend` services after finding the correct routing rule. On the other hand, when it cannot find any routing rule, the request must be ended. An ordinary method for this is using static content. The static content can be used against the search engines to reduce server costs.

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

After this, the static content is created.

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

The static response is ready. The HAProxy will return the above HTML content with a 503 HTTP status code if a request cannot be matched by routing.

Before applying this change, the config file must be validated.

```shell
devops@haproxy-01:~$ sudo /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
devops@haproxy-01:~$ sudo systemctl reload haproxy
```

If there is a cluster environment, the configuration must be applied to all servers.
