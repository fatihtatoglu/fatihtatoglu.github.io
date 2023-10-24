---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T18:41:00Z
permalink: ./en/lab/haproxy/cluster.html
language: en

title: Cluster
header: Cluster
tags: haproxy keepalived centos failover high_availability

category: lab
group: haproxy
groupTitle: HAProxy
order: 2
---

This note contains a cluster setup that has two HAProxy servers.

🔥 This note is written for KeepAlived 2.2.7 version. Newer versions may have different configurations.

## Preliminary Preparation

|Property|Master Server|Slave Server|
|---:|:---|:---|
|**Server Name**|haproxy-01|haproxy-02|
|**IP Address**|172.19.85.102|172.19.85.103|
|**Netmask**|255.255.255.0|255.255.255.0|
|**Gateway**|172.19.85.1|172.19.85.1|
|**CPU** ⭐|4|4|
|**Memory** ⭐|2 GB|2 GB|
|**Disk**|40GB|40 GB|
|**OS**|CentOS 7.X Minimal|CentOS 7.X Minimal|
|**Internet Access**|Yes|Yes|

⭐: You can increase the resources during the installation process.

There is no need to have a **root** user during the setup and build process. However, a user with root privileges will be needed. In the note, the **devops** user is used for the setup and build process. If you have a different user, please use that.

Moreover, the cluster needs a dedicated IP address to serve the master node. So, in this note, the `172.19.85.104` will be used as a virtual IP address.

## Setup Preparation

The following file should be downloaded and extracted in the first server.

```shell
devops@haproxy-01:~$ curl https://www.keepalived.org/software/keepalived-2.2.7.tar.gz > keepalived-2.2.7.tar.gz

devops@haproxy-01:~$ tar xf keepalived-2.2.7.tar.gz
```

The following file should be downloaded and extracted in the second server.

```shell
devops@haproxy-02:~$ curl https://www.keepalived.org/software/keepalived-2.2.7.tar.gz > keepalived-2.2.7.tar.gz

devops@haproxy-02:~$ tar xf keepalived-2.2.7.tar.gz
```

## Build

The build process is automatic and needs to run the below commands in the master and slave servers.

```shell
devops@haproxy-01:~$ cd ~
devops@haproxy-01:~$ sudo su
root@haproxy-01:/home/devops# 
root@haproxy-01:/home/devops# cd keepalived-2.2.7
root@haproxy-01:/home/devops# ./configure --prefix=/
root@haproxy-01:/home/devops# make
root@haproxy-01:/home/devops# make install
root@haproxy-01:/home/devops# exit
devops@haproxy-01:~$
```

```shell
devops@haproxy-02:~$ cd ~
devops@haproxy-02:~$ sudo su
root@haproxy-02:/home/devops# 
root@haproxy-02:/home/devops# cd keepalived-2.2.7
root@haproxy-02:/home/devops# ./configure --prefix=/
root@haproxy-02:/home/devops# make
root@haproxy-02:/home/devops# make install
root@haproxy-02:/home/devops# exit
devops@haproxy-02:~$
```

## Configuration

Before starting with the configuration section, the KeepAlived library's working style should be understood. The library listens to the master and slave nodes at the same time. If the master node faces problems, it updates the slave node's IP address with the virtual IP address. When the master node is again alive or available, the library updates the master node's IP address. To do this, the library needs a failover script.

### Failover Script

The failover script checks the haproxy service status. The script must be added to all the servers.

```shell
devops@haproxy-01:~$ sudo vi /usr/local/bin/failover.sh
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

The KeepAlived library runs with root privileges, so the failover script must be updated its privileges.

```shell
devops@haproxy-01:~$ sudo chmod a+rx /usr/local/bin/failover.sh
```

Let's continue with the configuration of the servers. The master and slave nodes' configurations are different. They are shared below.

### Master Server

```shell
devops@haproxy-01:~$ sudo vi /etc/keepalived/keepalived.conf
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
        172.19.85.104
    }
    track_script {
        chk_haproxy
    }
    smtp_alert true
}
```

After adding the configuration file to validate it, the below command can be used.

```shell
devops@haproxy-01:~$ sudo keepalived --config-test=keepalived.conf
```

### Slave Server

```shell
devops@haproxy-02:~$ sudo vi /etc/keepalived/keepalived.conf
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
        172.19.85.104
    }
    track_script {
        chk_haproxy
    }
    smtp_alert true
}
```

After adding the configuration file to validate it, the below command can be used.

```shell
devops@haproxy-02:~$ sudo keepalived --config-test=keepalived.conf
```

## Security

If you remember, the firewall is already arranged for the HAProxy. Now, the below command should be beneficial to permit the KeepAlived library.

```shell
devops@haproxy-01:~$ sudo firewall-cmd --add-rich-rule='rule protocol value="vrrp" accept' --permanent
devops@haproxy-01:~$ sudo firewall-cmd --reload
```

```shell
devops@haproxy-02:~$ sudo firewall-cmd --add-rich-rule='rule protocol value="vrrp" accept' --permanent
devops@haproxy-02:~$ sudo firewall-cmd --reload
```

## Turning Key

```shell
devops@haproxy-01:~$ sudo chkconfig keepalived on
devops@haproxy-01:~$ sudo systemctl enable keepalived
devops@haproxy-01:~$ sudo systemctl start keepalived
```

```shell
devops@haproxy-02:~$ sudo chkconfig keepalived on
devops@haproxy-02:~$ sudo systemctl enable keepalived
devops@haproxy-02:~$ sudo systemctl start keepalived
```

## Validation

First of all, all the servers must be tested individually. For this;

1. `http://172.19.85.102:1985/stats`
2. `http://172.19.85.103:1985/stats`

the above addresses should be visited over the browser. The status page of the HAProxy services must be shown.

Next, the `http://172.19.85.104:1985/stats` address should be visited over the browser and the master server's status page must be shown.

So far, everything seems okay, if any problems didn't occur. In the next step, let's play with the HAProxy service status.

```shell
devops@haproxy-01:~$ sudo systemctl stop haproxy
```

With the above command, the HAProxy service on the master server is turned off.After visiting the `http://172.19.85.104:1985/stats` address again, the expectation is the slave's status page is shown.

Finally, when the below command runs, everything should be in the initial state.

```shell
devops@haproxy-01:~$ sudo systemctl start haproxy
```

By the way, if you check the configuration files, you can see an email address. So, after every failover status changes, you receive an email. Please don't forget to update the email address. Otherwise, my email may be locked.
