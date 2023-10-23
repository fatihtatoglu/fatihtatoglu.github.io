---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-06-12T22:00:42Z
permalink: ./en/lab/environment/dev-setup-mint.html
language: en

title: Creating Development Environment with Linux Mint
header: Creating Development Environment with Linux Mint
tags: mint ubuntu linux_mint development development_environment

category: lab
group: environment
groupTitle: Development Environment
order: 3
---

Having numerous development environments with virtual machines provides extra advantages, such as separating the personal and working setup or trying different languages and tools. However, building an environment from scratch takes so much time. So, I have a base installation for every Linux virtual machine.

I prefer a small and easy to get used to distribution rather than a big one. Linux Mint is a small and powerful distribution that is based on Ubuntu. It supports many Ubuntu features and packages. To keep the environment small, I select **Xfce Edition**. The other editions are more beautiful and funny, but I like the most compact one.

🔥 This note contains some commands tested on the Linux Mint 20.3 Xfce Edition. The different editions and versions may need extras.

Although Linux Mint is a small distribution, before starting to build the base development environment, I chose to remove some useless applications.

```shell
fatihtatoglu@fth-linux:~$ sudo apt remove --purge -y libreoffice* thunderbird rhythmbox transmission-gtk simple-scan timeshift vim-tiny hplip youtube-dl hypnotix warpinator
fatihtatoglu@fth-linux:~$ sudo apt clean
fatihtatoglu@fth-linux:~$ sudo apt autoremove
```

## Generic Operations

After completing this operation, there are five last steps to complete the base installation. These steps should be completed before starting to differentiate the environments. As a suggestion, after completing these steps, the guest machine's disk should be cloned as a base image for all other virtual servers.

### Updates

Before adding new software, every time I prefer to update the system to the latest version by updating OS-based updates to make the system more stable and secure. Usually, the first update can take a longer time.

```shell
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ sudo apt upgrade -y
```

### SSH Connection

To connect the guest machine, the SSH is used from the host machine. So, the SSH server is an essential part of the installation. After the installation with the below command, the root authentication must be disabled. For a more secure system, certification-based authentication can be preferred.

```shell
fatihtatoglu@fth-linux:~$ sudo apt install -y openssh-server
```

### Text Editor & Generic Drivers

When using a virtual machine, the most used tool in the command line environment may be a text editor. That's why I chose to install my popular text editor `vim` with the generic drivers. By the way, for anything other than general use, installing the generic drivers should be sufficient.

```shell
fatihtatoglu@fth-linux:~$ sudo apt install vim -y
fatihtatoglu@fth-linux:~$ sudo apt install --install-recommends linux-generic-hwe-20.04 -y
```

### Security

Making a server more secure cannot be think without a well-configured software base firewall. I prefer using `ufw` in Ubuntu and Mint Linux to manage the incoming and outgoing network traffic.

```shell
fatihtatoglu@fth-linux:~$ sudo systemctl status ssh
fatihtatoglu@fth-linux:~$ sudo systemctl enable ssh
fatihtatoglu@fth-linux:~$ sudo ufw allow ssh
fatihtatoglu@fth-linux:~$ sudo ufw enable
fatihtatoglu@fth-linux:~$ sudo ufw reload
```

### Screen Resolution

Using the Linux distributions with the Hyper-V, many times I experienced problem with screen resolution. Also, Mint Linux needs to arrangement for this.

```shell
fatihtatoglu@fth-linux:~$ sudo vi /etc/default/grub
```

After opening the file, the following line **`GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"`** will change with this line **`GRUB_CMDLINE_LINUX_DEFAULT="quiet splash video=hyperv_fb:1920x1080"`**. Then the file must be saved and restart the system. I arrange the screen size with my laptop's active screen size.

```shell
fatihtatoglu@fth-linux:~$ sudo update-grub
fatihtatoglu@fth-linux:~$ sudo reboot
```

## Development Environments

After completing all the steps for the base server, let's jump into the different development environment preparations. Some steps can be duplicated, but all the steps must be applied for a proper installation.

🔥 Before using the below environment recipes, please be aware of the versions of the tools. The current command is tested for **Mint Linux 20.3 Xfce Edition**.

### C# Development Environment

A classic Microsoft DotNet environment, for me, contains **PowerShell**, **Git**, **VSCode**, and related plugins for it.

```shell
fatihtatoglu@fth-linux:~$ sudo apt-get install -y wget apt-transport-https software-properties-common
fatihtatoglu@fth-linux:~$ wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
v sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
fatihtatoglu@fth-linux:~$ rm -f packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ 
fatihtatoglu@fth-linux:~$ wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ rm packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ 
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ 
fatihtatoglu@fth-linux:~$ sudo apt install code git powershell dotnet-sdk-6.0 aspnetcore-runtime-6.0 dotnet-runtime-6.0 -y
```

### Go Development Environment

For me, the Go development environment contains **Git**, **Go**, **VsCode**, and related plugins for the VsCode.

```shell
fatihtatoglu@fth-linux:~$ wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
v sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
fatihtatoglu@fth-linux:~$ rm -f packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo apt install apt-transport-https -y
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt install code git -y
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget https://go.dev/dl/go1.18.3.linux-amd64.tar.gz
fatihtatoglu@fth-linux:~$ sudo su
root@fth-linux:/home/fatihtatoglu# rm -rf /usr/local/go && tar -C /usr/local -xzf go1.18.3.linux-amd64.tar.gz
root@fth-linux:/home/fatihtatoglu# exit
fatihtatoglu@fth-linux:~$ export PATH=$PATH:/usr/local/go/bin
```

The tricky point of the installation of the Go is setting the `GOPATH` environment variable every time.

```shell
fatihtatoglu@fth-linux:~$ sudo vi ~/.bashrc
```

To do this, the `.bashrc` file is opened by the above command to edit, and then the below line is added to the bottom of the file and saved.

```text
export PATH=$PATH:/usr/local/go/bin
```

### Fatih's Development Environment

Usually, I develop multiple applications at the same time, so I need various tools. With the below command, my current environment can be prepared.

```shell
fatihtatoglu@fth-linux:~$ sudo apt-get install -y wget curl apt-transport-https software-properties-common
fatihtatoglu@fth-linux:~$ wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
fatihtatoglu@fth-linux:~$ sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
v sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
fatihtatoglu@fth-linux:~$ rm -f packages.microsoft.gpg
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ rm packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ curl -fsSL https://deb.nodesource.com/setup_16.x |sudo -E bash -
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$ sudo dpkg -i packages-microsoft-prod.deb
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt-get remove docker docker-engine docker.io containerd runc
fatihtatoglu@fth-linux:~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
fatihtatoglu@fth-linux:~$ echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu focal stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ sudo apt install code git dotnet-sdk-6.0 aspnetcore-runtime-6.0 dotnet-runtime-6.0 nodejs powershell ca-certificates gnupg lsb-release docker-ce docker-ce-cli containerd.io -y
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo usermod -aG docker $USER
fatihtatoglu@fth-linux:~$ newgrp docker
fatihtatoglu@fth-linux:~$ sudo systemctl enable docker.service
fatihtatoglu@fth-linux:~$ sudo systemctl enable containerd.service
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ wget https://go.dev/dl/go1.18.3.linux-amd64.tar.gz
fatihtatoglu@fth-linux:~$ sudo su
root@fth-linux:/home/fatihtatoglu# rm -rf /usr/local/go && tar -C /usr/local -xzf go1.18.3.linux-amd64.tar.gz
root@fth-linux:/home/fatihtatoglu# exit
fatihtatoglu@fth-linux:~$ export PATH=$PATH:/usr/local/go/bin
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo vi ~/.bashrc
```

Add the below line to the bottom of the file.

```text
export PATH=$PATH:/usr/local/go/bin
```

In that environment, I can develop Front-end and back-end applications for my routine in my personal and professional life. For example, I used this in Yemeksepeti.

### Delivery Hero Environment

This is a unique case for Delivery Hero. The above environment seems enough. However, a VPN connection should be crucial when all the resources are in the AWS cloud to provide a more secure environment. Adding a VPN client to the **Fatih's Development Environment** becomes the **Delivery Hero Environment**.

```shell
fatihtatoglu@fth-linux:~$ sudo apt install build-essential qtcreator qt5-default -y
fatihtatoglu@fth-linux:~$ sudo add-apt-repository ppa:yuezk/globalprotect-openconnect
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ sudo apt update
fatihtatoglu@fth-linux:~$ sudo apt install -y globalprotect-openconnect
```

## Last But Not Least

After completing all the installation and after restarting the system, don't forget to check the installation. For example, the below commands can be used.

```shell
fatihtatoglu@fth-linux:~$ git --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ node --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ npm --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ go version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ docker --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ dotnet --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ pwsh --version
fatihtatoglu@fth-linux:~$
fatihtatoglu@fth-linux:~$ code --version
```
