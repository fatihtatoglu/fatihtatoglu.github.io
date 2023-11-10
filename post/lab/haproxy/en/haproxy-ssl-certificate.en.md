---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T19:03:27Z
permalink: ./en/lab/haproxy/ssl-certificate.html
language: en

title: HAProxy - SSL Certificate
header: SSL Certificate
description: Set up HAProxy on CentOS 7.X for efficient load balancing. Follow step-by-step instructions for preparation, installation, configuration, and security. Ensure a smooth deployment.
tags: haproxy ssl tls https certificate pfx pem

category: lab
order: 4

group: haproxy
groupTitle: HAProxy
groupImage: ../../../../image/lab-haproxy.png
---

HAProxy can handle the SSL request if the SSL configuration is valid. Usually, the flow is that the request meets the `frontend` service, then it moves to the `backend` service. The SSL / TLS certification definition is seen on the `frontend` side. Before configuring the HAProxy, let's check the types of SSL definition strategies.

## TLS / SSL Offloading

![TLS / SSL Offloading](../../../../image/tls-offloading.png "TLS Offloading - [HAProxy Encryption Strategies](https://www.haproxy.com/documentation/aloha/latest/security/tls/encryption-strategies/)")

With this strategy, the HAProxy encrypts messages between the client and itself, but the communication is not encrypted between itself and the backend servers. The SSL/TLS certificate is stored on the HAProxy servers.

## TLS / SSL Passthrough

![TLS / SSL Passthrough](../../../../image/tls-passthrough.png "TLS Passthrough - [HAProxy Encryption Strategies](https://www.haproxy.com/documentation/aloha/latest/security/tls/encryption-strategies/)")

With this strategy, the HAProxy doesn't apply the encryption or decryption process. The backend servers are responsible for this operation. The request only conveys to the backend server without any operations, after matching with the correct routing rule.

## TLS / SSL Bridging

![TLS / SSL Bridging](../../../../image/tls-bridging.png "TLS Bridging - [HAProxy Encryption Strategies](https://www.haproxy.com/documentation/aloha/latest/security/tls/encryption-strategies/)")

With this strategy, the HAProxy encrypts all the messages. The request reaches the HAProxy, and HAProxy decrypts the request for some operations, such as header validation. Then, the request is encrypted by the HAProxy to convey to the backend servers. The SSL / TLS certificate must be kept on both sides, HAProxy and backend servers.

## Configuration

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

With the above config, the HAProxy can handle the SSL / TLS requests and convey them to the `backend` servers. Before validating the configuration, the SSL / TLS certificate must be located in the given location in the PEM format. HAProxy wants the PEM file contains the public and private key in order. For this operation, the below commands can be helpful.

```shell
devops@haproxy-01:~$ sudo su
root@haproxy-01:/home/devops# openssl pkcs12 -in certificate.pfx -nocerts -out certificate_priv.pem -nodes
root@haproxy-01:/home/devops# openssl pkcs12 -in certificate.pfx -nokeys -out certificate_public.pem -nodes
root@haproxy-01:/home/devops# cat certificate_public.pem certificate_priv.pem > certificate-cert-key.pem
root@haproxy-01:/home/devops# mv certificate-cert-key.pem /etc/haproxy/certificates/certificate-cert-key.pem
```

The command extracts the private and public keys first from the pfx file. You can use the below instructions if you have private and public keys separately.

```shell
devops@haproxy-01:~$ sudo su
root@haproxy-01:/home/devops# cat certificate_public.pem certificate_priv.pem > certificate-cert-key.pem
root@haproxy-01:/home/devops# mv certificate-cert-key.pem /etc/haproxy/certificates/certificate-cert-key.pem
```

Before applying this change, the config file must be validated.

```shell
devops@haproxy-01:~$ sudo /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
devops@haproxy-01:~$ sudo systemctl reload haproxy
```

If there is a cluster environment, the configuration must be applied to all servers.
