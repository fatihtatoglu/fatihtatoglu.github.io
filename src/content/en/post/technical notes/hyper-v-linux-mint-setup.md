---
id: awe08f1q57
lang: en
title: "Hyper-V: Linux Mint Dev VM on Windows (Guide)"
slug: hyper-v-linux-mint-setup
category: technical-notes
schemaType: post
tags:
  - hyper-v
  - linux-mint
  - windows-10
  - virtualization
  - nat-networking
  - vhdx
  - vscode
  - docker
  - nodejs
  - security-ssh-ufw
readingTime: 18
date: 2022-12-06
updated: 2025-10-28
pair: gelistirme-ortami-kurulumu
canonical: ~/en/hyper-v-linux-mint-setup/
alternate: ~/gelistirme-ortami-kurulumu/
description: "Build a clean Linux Mint dev VM on Windows with Hyper-V: NAT networking, VHDX tuning, Docker, VS Code, Node/Go/.NET, plus SSH & UFW hardening."
keywords:
  - hyper-v linux
  - windows vm
  - linux mint xfce
  - developer workstation
  - nat switch
  - vhdx block size
  - ext4
  - docker on mint
  - vscode linux
  - node.js nvm
  - go install
  - dotnet ubuntu
  - github gpg
  - aws cli v2
featured: true
cover: /assets/images/development-environment.webp
coverAlt: Linux Mint desktop in a Hyper-V window on Windows, with Docker, Python, Go, NodeJS, .NET and GitHub icons as desktop items
coverCaption: Isolated Linux Mint development environment on Windows via Hyper-V
template: post
layout: default
status: published
---
# Development Environment Setup

Despite my colleagues' pressure, I’m still doing development work at home using Linux virtual machines on Windows.

This configuration provides clean, isolated, customizable, portable, and backupable development environments. It also keeps the host machine tidy and prevents any libraries, applications, or tools installed just for testing from leaving residue on the main system.

However, it also has some drawbacks, such as network management, keeping the virtual operating systems up-to-date, file transfer, and disk management.

At the end of this article, you’ll find the steps to set up a development environment using Hyper-V on Windows 10 Professional or Enterprise.

## Prerequisites and Version Matrix

|Component / Tool|Tested Version|Notes / Requirements|
|---|---|---|
|**Host OS**|Windows 10 Enterprise 22H2|Hyper-V must be active, virtualization enabled in BIOS|
|**Hyper-V**|10.0.22621|"Hyper-V Management Tools" and "Hyper-V Platform" enabled|
|**Guest OS**|Linux Mint 21.3 XFCE (Ubuntu 22.04 based)|`UBUNTU_CODENAME`=jammy|
|**PowerShell**|7.4.4|Updated version via Winget|
|**VS Code**|1.94.0|Version installed via apt repo|
|**Docker**|27.2.0|Ubuntu repository is used for Mint|
|**NodeJS / NVM**|Node 22.11.0 / NVM 0.40.3|Activates after restart|
|**Go**|1.25.3|Manual download and tar.gz installation|
|**.NET SDK**|8.0 / 9.0|Via apt or PPA:dotnet/backports|
|**AWS CLI**|v2.17.0|Installation via zip method|
|**Python**|3.10.12|Comes with Mint|

## Necessary Adjustments

Most of the features and tools that a developer needs or would make their work easier on Windows come disabled and uninstalled by default. First, these need to be enabled.

### Installing Hyper-V

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-All" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Tools-All" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Powershell" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Hypervisor" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Services" -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-Clients" -NoRestart
```

These commands install the Hyper-V service and the necessary management tools.

### PowerShell Update

```powershell
winget install Microsoft.Powershell --accept-package-agreements --accept-source-agreements
```

This command installs a more up-to-date version of PowerShell than the one that comes built into Windows.

### Folder View

```powershell
Push-Location
Set-Location HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced
Set-ItemProperty . HideFileExt "0"
Set-ItemProperty . Hidden "1"
Pop-Location
```

This command makes file extensions visible and also ensures that hidden files are visible. This is totally optional. I consider it important to have this setting on my host machine, so I’m sharing it here.

### Disabling UAC

```powershell
New-ItemProperty -Path HKLM:Software\Microsoft\Windows\CurrentVersion\policies\system -Name EnableLUA -PropertyType DWord -Value 0 -Force
```

This is another one of those suggested commands that you can perform. User Account Control (UAC) is a tool used to prevent unauthorized access on Windows. Disabling it could allow unauthorized code to run on your machine. I recommend considering this risk before performing the operation. On my machine, I prefer to have an antivirus software that provides protection similar to UAC but is configurable, so I disable the UAC feature.

## Hyper-V Network Adjustment

Before setting up the environment, you need to allocate a network for Hyper-V and provide internet access. In this step, I’ll be using the `172.19.85.0/24` network. You can choose any IP configuration you prefer. This parameter has been made parametric.

```powershell
$natSwitch     = "LAN-85"
$natIPAddress  = "172.19.85.254"
$natAddress    = "172.19.85.0/24"

New-VMSwitch -SwitchName $natSwitch -SwitchType Internal
New-NetIPAddress -IPAddress $natIPAddress -PrefixLength 24 -InterfaceAlias "vEthernet ($natSwitch)"

New-NetNAT -Name $natSwitch -InternalIPInterfaceAddressPrefix $natAddress
```

This command creates an internal virtual switch, performs NAT to the host machine using the specified address, and gains internet access. It’s important to note that a gateway value should not be entered for the virtual switch created for the virtual adapter.

## Creating a Virtual Machine

Now that the network adjustments have been made, you can proceed to creating a virtual machine.

```powershell
$natSwitch = "LAN-85"
$vmName = "fth-template"
$workspacePath = "C:\\workspace\\machine\\"
$isoPath = "C:\\workspace\\iso\\linuxmint-21.3-xfce-64bit.iso"

$cpu = 2
$ramSize  = 8GB
$diskSize = 50GB

New-VHD -Path "$workspacePath\\$vmName\\$vmName.vhdx" -SizeBytes $diskSize -Fixed -BlockSizeBytes 1MB

New-VM -Name $vmName -MemoryStartupBytes $ramSize -BootDevice VHD -VHDPath "$workspacePath\\$vmName\\$vmName.vhdx" -Path "$workspacePath" -Generation 2 -Switch $natSwitch

Set-VMFirmware $vmName -EnableSecureBoot Off
Set-VMProcessor -VMName $vmName -Count $cpu
Set-VM -Name $vmName -AutomaticCheckpointsEnabled $false -CheckpointType Disabled
Set-VMMemory -VMName $vmName -DynamicMemoryEnabled $true -MinimumBytes ($ramSize / 16) -StartupBytes ($ramSize / 8) -MaximumBytes $ramSize

Add-VMDvdDrive -VMName $vmName -Path "$isoPath"

$dvd = Get-VMDVDDrive -VMName $vmName
Set-VMFirmware -VMName $vmName -FirstBootDevice $dvd
Start-VM -Name $vmName
```

Different virtual machines can be installed using the parameters in the above command. I’ll explain a bit more detailed what this command does.

### Virtual Machine Settings

When creating the virtual machine, we create it as Gen 2. Gen 2 allows Hyper-V to perform virtualization using the physical resources that the host machine also uses. If we had used Gen 1, the CPU, RAM, and other hardware would be in the virtualization layer, causing the virtual machine to slow down.

Because the `SecureBoot` feature is not recommended on Linux machines, it’s disabled. As a personal preference, I also disable the `Checkpoint` feature to make the virtual machine take up less space. The disadvantage of this is that Hyper-V cannot receive checkpoints, so a restore operation cannot be performed later.

### Disk Block Size Adjustment

Microsoft Hyper-V recommends that Linux operating systems run faster with virtual disks consisting of 1MB blocks. This value is the default 32MB and configured for Windows operating systems. To support this, it also recommends using an `ext4` format consisting of 4096 groups for Linux.

The reason for this recommendation is to grow the virtual disk by smaller pieces instead of larger ones when it needs to grow, optimizing disk usage on the host machine. The reason for the Linux suggestion is to reduce the ratio of allocated but unused disk space.

### Disk Type Adjustment

In addition to block adjustment on the disk, I prefer to make adjustments in the disk type as well. For this, I set the disks as `-Fixed` when creating the virtual machine. With this parameter, the specified amount of space is reserved for that virtual disk on the host machine. This reduces the installation time of the virtual machine.

### RAM and CPU Adjustment

The CPU setting for the virtual machine is done by giving a core value to the `$cpu` variable. The `$ramSize` variable is given the maximum possible memory value. When defining, an adjustment is made to ensure that the value given starts with 1/8 of the given value and can be up to the maximum given value. This way, the virtual machine requests and receives the necessary amount of RAM when it needs it.

### DVD Boot

The operating system ISO file to be installed is provided as a DVD for the first installation using the `$isoPath` variable and added to the boot order.

## Virtual Machine Installation

In those times when I initially set up this environment structure, I used to install Ubuntu on each machine and continue. Later, due to my desire to install more compact virtual machines, I updated my virtual machines with Linux Mint.

Linux Mint is a distribution based on Ubuntu, taking up less space and supporting Ubuntu packages. I prefer to use it because it's both Ubuntu and not Ubuntu for my purpose. While installing Linux Mint, it offers different desktop structures, but I still choose the smaller Xfce version.

After the virtual machine starts, a setup screen will appear shortly, follow the steps on this screen to complete the installation. Then you can continue reading from here for further customization.

### Cleanup

Every Linux operating system, unless otherwise specified, comes with some pre-installed software. Most of this software is built with the end user in mind. Since I don't typically use these, I perform a preliminary cleanup with the following commands.

```bash
sudo apt remove --purge -y libreoffice* redshift warpinator pix hexchat thunderbird transmission-gtk webapp-manager celluloid hypnotix rhythmbox timeshift simple-scan vim-tiny hplip youtube-dl xfce4-dict
```
After cleaning, I also clean up the remaining parts and perform updates.

```bash
sudo apt clean && sudo apt autoremove && sudo apt update && sudo apt upgrade -y
```

As with any major operation, a restart will be required.

```bash
sudo reboot
```

### Basic Software

```bash
sudo apt install -y openssh-server vim git
```

I'm installing 3 software that I’ve determined to be necessary in all the developer machines I’ve built so far with this command.

- OpenSSH Server: To share files
- Vim: Text editor used in CLI
- Git: Version control tool used to get and send code.

### Security

Even though it's a virtual machine, the code and information contained within it may be important or confidential depending on the work being done. Therefore, I think virtual machines should use basic security tools.

```bash
sudo systemctl start ssh
sudo systemctl enable ssh
sudo systemctl status ssh
sudo ufw allow ssh
sudo ufw enable
sudo ufw reload
```
This command adjusts the firewall software and enables the SSH service within the virtual machine. Thanks to these settings, unauthorized requests from outside are prevented from reaching the virtual machine.

### Network Settings

The last setting required for the virtual machine to run independently is the network configuration. This can be done via GUI or CLI. I will only explain what needs to be done basically.

Since Hyper-V doesn’t provide a DHCP server, we need to manually assign an IP address to our virtual machine.

**Device:** eth0
**Method:** Manual
**Address:** 172.19.85.XXX
**Netmask:** 24
**Gateway:** 172.19.85.254
**DNS servers:** 1.1.1.1,8.8.8.8

The values above are what will be used. You need to enter a value between 2-253 for the `XXX` field. If you have a different netmask value, you must choose an IP address accordingly.

In simple terms, we entered `172.19.85.254` as the gateway to connect the virtual machine to the internet. As remembered, this is the NAT address used when connecting our virtual switch to the host machine. Thus, the virtual machine can directly access the internet.

After making network changes, you need to ensure that the changes are applied by running the following command.

```bash
sudo service NetworkManager restart
```

## Developer Environment

The preparations for the virtual machine structure are complete. The virtual machine is now ready for use. Let's start installing development tools according to needs and requests.

### VS Code

I like to use VS Code as an IDE when developing. I prefer it because of its flexibility and ability to be developed by adding plugins. It’s also a reason why it’s free.

```bash
sudo apt install dirmngr ca-certificates software-properties-common apt-transport-https -y

curl -fSsL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor | sudo tee /usr/share/keyrings/vscode.gpg > /dev/null

echo deb [arch=amd64 signed-by=/usr/share/keyrings/vscode.gpg] https://packages.microsoft.com/repos/vscode stable main | sudo tee /etc/apt/sources.list.d/vscode.list

sudo apt update && sudo apt install -y code
```
The above command installs VS Code manually from the apt repositories.

When working with VS Code on Linux, it tries to understand if there are any changes in the files by following them. When the number of files increases significantly, the `ENOSPC` error starts to be received. The following command needs to be run to fix this.

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf

sudo sysctl -p
```

### Docker

Even if it’s a virtual machine, I prefer to use docker when I need to temporarily use some software. The important thing to note when installing Docker is that Linux Mint is based on Ubuntu.

Normally, the part defined as `VERSION_CODENAME` in the script is used as `UBUNTU_CODENAME` for Linux Mint. Because Linux Mint updates its version information with the `VERSION_CODENAME` value and using it will cause Docker to not find the relevant package. Therefore, the `UBUNTU_CODENAME` value is used.

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$UBUNTU_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
```

This command cleans up any packages that may have been installed previously and makes preparations.

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
This command performs the installation and then the following command is used to bring the services into operation.

```bash
sudo systemctl enable docker.service && sudo systemctl enable containerd.service
```

Currently, you can only access Docker commands with `sudo`. If you want to access it without `sudo`, you need to run the following commands.

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

In this command, the `$USER` value represents the user who is currently logged in. If you want to add a different user, you need to write the desired username instead of `$USER`.

It may be necessary to restart the terminal you are using for this operation to take effect.

### NodeJS

With the hype it has been receiving lately, NodeJs, which is used for development, requires some installations as well.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
sudo reboot
```

This command installs NVM (Node Version Manager), which allows you to easily manage NodeJs versions. A restart is required after this process.

After the restart, you can install the desired version by running the following command:

```bash
nvm install 22.11.0
nvm use 22.11.0
```

This command will load `node` and `npm` onto the machine and make them ready for use. However, if you want to install a package manager like `yarn`;

```bash
corepack enable yarn
```

run this command. With this command, `yarn` will also be installed on the machine.

### Go

Let's look at how to install the Go programming language, which has been getting a lot of attention lately. The installation is quite simple. For example, the following command needs to be run:

```bash
sudo rm -rf /usr/local/go
wget https://go.dev/dl/go1.25.3.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.25.3.linux-amd64.tar.gz
```

After the installation, add the following line to the `$HOME/.profile` or `/etc/profile` file. A restart will be useful again.

```bash
export PATH=$PATH:/usr/local/go/bin
```

### .NET

Installing .NET is as simple as installing other languages. However, there are some differences between versions, so you need to pay attention.

```bash
sudo apt install -y ca-certificates libc6 libgcc-s1 libgssapi-krb5-2 libicu70 liblttng-ust1 libssl3 libstdc++6 zlib1g
```

The above command installs the libraries needed for .NET. Then, run the appropriate command according to the version.

#### .NET 6.0

```bash
sudo apt update && sudo apt install -y dotnet-sdk-6.0 aspnetcore-runtime-6.0 dotnet-runtime-6.0
```

#### .NET 8.0

```bash
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0 aspnetcore-runtime-8.0 dotnet-runtime-8.0
```

#### .NET 9.0

```bash
sudo add-apt-repository ppa:dotnet/backports
sudo apt-get update && sudo apt-get install -y dotnet-sdk-9.0 aspnetcore-runtime-9.0 dotnet-runtime-9.0
```

After the installations are complete, you can add the following code snippet to the `~/.bashrc` file for command completion support.

```bash
# bash parameter completion for the dotnet CLI
function _dotnet_bash_complete() 
{ 
	local cur="${COMP_WORDS[COMP_CWORD]}" IFS=$'\n' # On Windows you may need to use use IFS=$'\r\n'
	local candidates 
	
	read -d '' -ra candidates < <(dotnet complete --position "${COMP_POINT}" "${COMP_LINE}" 2>/dev/null) 
	
	read -d '' -ra COMPREPLY < <(compgen -W "${candidates[*]:-}" -- "$cur") 
} 

complete -f -F _dotnet_bash_complete dotnet
```

### Git & GitHub

I keep all my developments on GitHub. In fact, I also host my [blog](https://github.com/fatihtatoglu/fatihtatoglu.github.io) there.

There are some things that are mandatory and recommended when working with Git and GitHub. Since I consider these as part of the development environment, I want to share them.

```bash
git config --global user.name "Fatih Tatoğlu"
git config --global user.email "fatihtatoglu@gmail.com"

git config --global init.defaultBranch master
git config --global commit.gpgsign true
git config --global tag.gpgSign true
```

The first two lines of the above command are a necessity for Git, and the other lines are my recommendations. Don’t forget to adjust the values according to yourself.

```bash
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long
gpg --armor --export <key-id>

git config --global user.signingkey <key-id>
```

This is the first step in the process of generating a PGP key to enable code signing. In this step, copy the value of the key generated between `-----BEGIN PGP PUBLIC KEY BLOCK-----` and `-----END PGP PUBLIC KEY BLOCK-----`.

Press the "New GPG key" button on [GitHub Keys](https://github.com/settings/keys) and write the copied value in the "Key" field on the opened window. You can write whatever you want in the "Title" field.

Now your code will be signed from your machine.

In addition, I recommend using a PAT for development to avoid sharing token information openly.

- repo
- write:packages
- read:org
- write:public_key
- write:gpg_key
- workflow
- write:ssh_signing_key

A classic token with a maximum lifespan of 1 year will do the job. You can get this token from [GitHub Developer Tokens](https://github.com/settings/tokens).

For ease of use and to prevent sensitive information from appearing in history, you can add the following lines to the `~/.bashrc` file:

```bash
export GH_USERNAME=fatihtatoglu
export GH_TOKEN=ghp_....
```

This allows you to clone with `git clone http://$GH_USERNAME:$GH_TOKEN@github.com/fatihtatoglu/...` without explicitly sharing the token information.

### AWS

When developing for AWS, I often use the AWS CLI. Running the following command installs AWS CLI V1 for Ubuntu and Mint:

```bash
sudo apt install awscli -y
```

However, because it has more features and is newer, I prefer to install AWS CLI V2 using the following command.

### Python

Python has become the standard when working with artificial intelligence these days. Therefore, it may be necessary to install Python as well.

The good thing is that Linux Mint comes with Python 3.10 by default. It’s enough for me to just install the necessary tools on top of it.

```bash
sudo apt update && sudo apt upgrade && sudo apt install python3 python3-venv -y
```

## Troubleshooting

I’ve scattered solutions for potential issues throughout this article, but to consolidate them in the below.

### ENOSPC Error

This error appears when VS Code runs out of limits while watching files on Linux.

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf

sudo sysctl -p
```

Running this command increases the watch limit.

### Running Docker Commands Without `sudo`

After installing Docker, it won’t allow you to perform operations without `sudo` privileges.

You can solve this problem using the following command:

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

### No Network Access / Unable to Get an IP Address

If your virtual machine cannot access the network or obtain an IP address after you’ve completed the setup, check the following steps:

- Is the **Gateway** value set to `172.19.85.254`?
- Has the **DNS** value been assigned correctly?
- Does the **IP Address** conflict with another virtual machine?

### Linux Mint Won’t Boot

This may be because `Secure Boot` was left enabled.

```bash
$vmName = "fth-template"
Set-VMFirmware $vmName -EnableSecureBoot Off
```

After running this command, `Secure Boot` will be disabled. However, the virtual machine needs to be restarted for it to take effect.

### Snapshot / Checkpoint

We disable the snapshot/checkpoint feature during installation, which prevents restore operations.

However, if you want to create a backup, you can enable this parameter or take a backup of the virtual machine using `Export-VM`.

## Closing Remarks

I often need different development environments every day. Having a simple and mostly pre-defined guideline for this makes my job much easier. Especially being able to run a small machine without paying any extra fees is very appealing.

The same thing can be done with different virtualization layers, and even a complete lab setup can be created. There are no obstacles to that. I’m just saving these options for other articles.

If you would like to contribute, you can share the steps you need or use, or forward this article to people who you want to read it, or leave your likes and comments.

## Resources & Further Reading

- [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v)
- [Running VSCode On Linux: Hitting My Watcher Limit And What To Do About It](https://dev.to/stephencweiss/running-vscode-on-linux-hitting-my-watcher-limit-and-what-to-do-about-it-52i0)
- [Install .NET SDK or .NET Runtime on Ubuntu](https://learn.microsoft.com/en-us/dotnet/core/install/linux-ubuntu-install?tabs=dotnet9&pivots=os-linux-ubuntu-2204)
- [Installing or updating to the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)