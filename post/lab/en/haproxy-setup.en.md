---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T14:07:13Z
permalink: ./en/lab/haproxy/setup.html
language: en

title: HAProxy - Setup
header: HAProxy - Setup
tags: haproxy centos lua setup build source install
---

This note contains the steps of the single server setup HAProxy from source onto the CentOS 7.X Minimal. This setup includes some extra efforts for helping with the following notes about HAProxy.

🔥 This note is written for HAProxy 2.0.29 and Lua 5.3.5 version. Newer versions may have different configurations.

## Preliminary Preparation

|Property|Minimum Value|
|---:|:---|
|**Server Name**|haproxy-01|
|**IP Address**|172.19.85.102|
|**Netmask**|255.255.255.0|
|**Gateway**|172.19.85.1|
|**CPU** ⭐|4|
|**Memory** ⭐|2 GB|
|**Disk**|40GB|
|**OS**|CentOS 7.X Minimal|
|**Internet Access**|Yes|

⭐: You can increase the resources during the installation process.

During the setup and build process, no need to have a **root** user. However, a user with root privileges will be needed. In the note, the **devops** user is used for the setup and build process. If you have a different user, please use that.

To prevent the blockage during the setup, the SELinux will be disabled.

```shell
devops@haproxy-01:~$ sudo setenforce 0
devops@haproxy-01:~$ sudo sed -i 's/^SELINUX=.*/SELINUX=permissive/g' /etc/selinux/config
```

## Setup Preparation

Because of security reasons, a separate user should be created for HAProxy.

```shell
devops@haproxy-01:~$ sudo groupadd -g 1985 haproxy
devops@haproxy-01:~$ sudo useradd -g 1985 -u 1985 -d /var/lib/haproxy -s /sbin/nologin -c haproxy haproxy
```

The following files should be downloaded and extracted.

```shell
devops@haproxy-01:~$ curl https://www.lua.org/ftp/lua-5.3.5.tar.gz > lua-5.3.5.tar.gz
devops@haproxy-01:~$ curl http://www.haproxy.org/download/2.0/src/haproxy-2.0.29.tar.gz > haproxy-2.0.29.tar.gz

devops@haproxy-01:~$ tar xf lua-5.3.5tar.gz
devops@haproxy-01:~$ tar xf haproxy-2.0.29.tar.gz 
```

Before starting to build the HAProxy, some mandatory libraries must be installed.

```shell
devops@haproxy-01:~$ sudo yum install gcc openssl-devel readline-devel systemd-devel make pcre-devel net-tools kernel-headers url libnl3-devel net-snmp-devel -y
devops@haproxy-01:~$ sudo yum update -y
```

## Build

The build operation starts with the building Lua because the Lua library path is a parameter during the HAProxy build script.

```shell
devops@haproxy-01:~$ cd lua-5.3.5
devops@haproxy-01:~$ sudo make INSTALL_TOP=/opt/lua-5.3.5 linux install
```

Now, the HAProxy can be built from the source.

```shell
devops@haproxy-01:~$ cd ~
devops@haproxy-01:~$ cd haproxy-2.0.29
devops@haproxy-01:~$ sudo make USE_NS=1 USE_TFO=1 USE_OPENSSL=1 USE_ZLIB=1 USE_LUA=1 USE_PCRE=1 USE_SYSTEMD=1 USE_LIBCRYPT=1 USE_THREAD=1 TARGET=linux-glibc LUA_INC=/opt/lua-5.3.5/include LUA_LIB=/opt/lua-5.3.5/lib
devops@haproxy-01:~$ sudo make PREFIX=/opt/haproxy install
```

The above parameters are selected for the general usage of HAProxy, if you need more specific parameters the **INSTALL** file in the source code, is contained inside. Please be aware that changing parameters affect the HAProxy performance and working style.

## Configuration

After building the HAProxy, to control it with `systemctl`, a service definition must be created.

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

Now, the process file should be created to define the starting paramters and options.

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

The last step in the configuration section is creating a HAProxy configuration file that given in the process file. This configuration file contains the proxy definitions, service and server definitions.

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

To complete the configuration section, there is one required command to validate the HAProxy configuration.

```shell
devops@haproxy-01:~$ sudo /opt/haproxy/sbin/haproxy -c -V -f /etc/haproxy/haproxy.conf
```

This command should be executed after any configuration changes in the HAProxy configuration file.

## Security

The SELinux is disabled, but the firewall should be enabled to prevent network attacks or discoverability. Creating port by port creates complexity, so creating a HAProxy service definition for the Firewall should be better.

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

The `80` and `443` port is added for the normal traffic. The port `1985` is added for the HAProxy status page access. You can add your additional ports to that file in the future. After adding, the restart is required for the Firewall and HAProxy.

```shell
devops@haproxy-01:~$ sudo chmod 640 /etc/firewalld/services/haproxy.xml
```

## Turning Key

```shell
devops@haproxy-01:~$ sudo systemctl enable firewalld
devops@haproxy-01:~$ sudo sudo systemctl start firewalld
devops@haproxy-01:~$ sudo firewall-cmd --permanent --add-service=haproxy
devops@haproxy-01:~$ 
devops@haproxy-01:~$ sudo firewall-cmd --reload
devops@haproxy-01:~$ sudo systemctl enable haproxy
devops@haproxy-01:~$ sudo systemctl start haproxy
```

With the above commands, permanent access is given to HAProxy, and HAProxy's service is enabled and started. If there isn't any problem, the HAProxy should be worked.

## Validation

After the setup, you should validate the setup internally and externally.

```shell
devops@haproxy-01:~$ sudo systemctl status haproxy
```

The above commands should return the **Running** status for internal validation. For the external validation, you may visit the `http://172.19.85.102:1985/stats` address that is defined in the HAProxy configuration file for the HAProxy status page.
