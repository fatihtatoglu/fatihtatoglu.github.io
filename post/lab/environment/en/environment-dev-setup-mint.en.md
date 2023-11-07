---
layout: post
published: true
author: Fatih Tatoğlu
date: 2023-10-27T21:44:00Z
permalink: ./en/lab/environment/dev-setup-mint.html
language: en

title: Creating Development Environment with Linux Mint
header: Creating Development Environment with Linux Mint
description: Preparing a software development environment with Fatih's habits and preferences.
tags: mint ubuntu linux_mint development development_environment

category: lab
order: 3

group: environment
groupTitle: Building Development Environment
groupImage: ../image/lab-environment.jpg
---

Having numerous development environments with virtual machines provides extra advantages, such as separating the personal and working setup or trying different languages and tools. However, building an environment from scratch takes so much time. So, I have a base installation for every Linux virtual machine.

I prefer a small and easy to get used to distribution rather than a big one. Linux Mint is a small and powerful distribution that is based on Ubuntu. It supports many Ubuntu features and packages. To keep the environment small, I select **Xfce Edition**. The other editions are more beautiful and funny, but I like the most compact one.

🔥 This note contains some commands tested on the Linux Mint 21.2 Xfce Edition. The different editions and versions may need extras.

Although Linux Mint is a small distribution, before starting to build the base development environment, I chose to remove some useless applications.

```shell
fatihtatoglu@fth-dev:~$ sudo apt remove --purge -y libreoffice* thunderbird rhythmbox transmission-gtk simple-scan timeshift vim-tiny hplip youtube-dl hypnotix warpinator hexchat xfce4-dict
fatihtatoglu@fth-dev:~$ sudo apt clean
fatihtatoglu@fth-dev:~$ sudo apt autoremove
```

## Generic Operations

After completing this operation, there are some last steps to complete the base installation. These steps should be completed before starting to differentiate the environments. As a suggestion, after completing these steps, the guest machine's disk should be cloned as a base image for all other virtual servers.

### Updates

Before adding new software, every time I prefer to update the system to the latest version by updating OS-based updates to make the system more stable and secure. Usually, the first update can take a longer time.

```shell
fatihtatoglu@fth-dev:~$ sudo apt update
fatihtatoglu@fth-dev:~$ sudo apt upgrade -y
```

### SSH Connection

To connect the guest machine, the SSH is used from the host machine. So, the SSH server is an essential part of the installation. After the installation with the below command, the root authentication must be disabled. For a more secure system, certification-based authentication can be preferred.

```shell
fatihtatoglu@fth-dev:~$ sudo apt install -y openssh-server
```

### Text Editor & Generic Drivers

When using a virtual machine, the most used tool in the command line environment may be a text editor. That's why I chose to install my popular text editor `vim` with the generic drivers. By the way, for anything other than general use, installing the generic drivers should be sufficient.

```shell
fatihtatoglu@fth-dev:~$ sudo apt install vim -y
fatihtatoglu@fth-dev:~$ sudo apt install --install-recommends linux-generic-hwe-22.04 -y
```

### Security

Making a server more secure cannot be think without a well-configured software base firewall. I prefer using `ufw` in Ubuntu and Mint Linux to manage the incoming and outgoing network traffic.

```shell
fatihtatoglu@fth-dev:~$ sudo systemctl status ssh
fatihtatoglu@fth-dev:~$ sudo systemctl enable ssh
fatihtatoglu@fth-dev:~$ sudo ufw allow ssh
fatihtatoglu@fth-dev:~$ sudo ufw enable
fatihtatoglu@fth-dev:~$ sudo ufw reload
```

## Development Environments

After completing all the steps for the base server, let's jump into the different development environment preparations. Some steps can be duplicated, but all the steps must be applied for a proper installation.

🔥 Before using the below environment recipes, please be aware of the versions of the tools. The current command is tested for **Mint Linux 21.2 Xfce Edition**.

### Fatih's Development Environment

Usually, I develop multiple applications at the same time, so I need various tools. With the below command, my current environment can be prepared.

```shell
fatihtatoglu@fth-dev:~$ echo "Prepare Environment"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ sudo apt install -y software-properties-common apt-transport-https wget curl gnupg ca-certificates
fatihtatoglu@fth-dev:~$ sudo apt remove -y --purge docker docker-engine docker.io containerd runc
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "Add Repositories"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> vscode"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ wget -O- https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor | sudo tee /usr/share/keyrings/microsoft.gpg
fatihtatoglu@fth-dev:~$ echo deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/vscode stable main | sudo tee /etc/apt/sources.list.d/vscode.list
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> powershell & dotnet"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo deb [arch=amd64,armhf,arm64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/22.04/prod/ jammy main | sudo tee /etc/apt/sources.list.d/microsoft.list
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> nodejs"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ NODE_MAJOR=20
fatihtatoglu@fth-dev:~$ echo "deb [arch=amd64 signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> docker"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
fatihtatoglu@fth-dev:~$ echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> python"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ curl "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xF23C5A6CF475977595C89F51BA6932366A755776" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/deadsnakes.gpg
fatihtatoglu@fth-dev:~$ echo deb [signed-by=/usr/share/keyrings/deadsnakes.gpg] https://ppa.launchpadcontent.net/deadsnakes/ppa/ubuntu jammy main | sudo tee /etc/apt/sources.list.d/deadsnakes.list
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "> go"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ wget https://go.dev/dl/go1.21.3.linux-amd64.tar.gz -O go1.21.3.linux-amd64.tar.gz
fatihtatoglu@fth-dev:~$ sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.21.3.linux-amd64.tar.gz
fatihtatoglu@fth-dev:~$ sudo rm go1.21.3.linux-amd64.tar.gz
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ export PATH=$PATH:/usr/local/go/bin
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ echo "Start installation"
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ sudo apt update && sudo apt upgrade -y
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ sudo apt install -y code git nodejs powershell docker-ce docker-ce-cli docker-compose-plugin containerd.io python3.12
fatihtatoglu@fth-dev:~$ 
fatihtatoglu@fth-dev:~$ sudo usermod -aG docker $USER
fatihtatoglu@fth-dev:~$ sudo systemctl enable docker.service
fatihtatoglu@fth-dev:~$ sudo systemctl enable containerd.service
```

The tricky point of the installation of the Go is setting the `GOPATH` environment variable every time.

```shell
fatihtatoglu@fth-dev:~$ sudo vi ~/.bashrc
```

To do this, the `.bashrc` file is opened by the above command to edit, and then the below line is added to the bottom of the file and saved.

```text
export PATH=$PATH:/usr/local/go/bin
```

In that environment, I can develop Front-end and back-end applications for my routine in my personal and professional life. For example, I used this in Yemeksepeti.

### Delivery Hero Environment

This is a unique case for Delivery Hero. The above environment seems enough. However, a VPN connection should be crucial when all the resources are in the AWS cloud to provide a more secure environment. Adding a VPN client to the **Fatih's Development Environment** becomes the **Delivery Hero Environment**.

```shell
fatihtatoglu@fth-dev:~$ sudo apt install build-essential qtcreator qt5-default -y
fatihtatoglu@fth-dev:~$ sudo add-apt-repository ppa:yuezk/globalprotect-openconnect
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ sudo apt update
fatihtatoglu@fth-dev:~$ sudo apt install -y globalprotect-openconnect
```

## Last But Not Least

After completing all the installation and after restarting the system, don't forget to check the installation. For example, the below commands can be used.

```shell
fatihtatoglu@fth-dev:~$ git --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ node --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ npm --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ go version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ docker --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ dotnet --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ pwsh --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ code --version
fatihtatoglu@fth-dev:~$
fatihtatoglu@fth-dev:~$ python3 --version
```
