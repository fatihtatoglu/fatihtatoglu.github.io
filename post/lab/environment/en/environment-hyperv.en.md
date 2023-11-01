---
layout: post
published: true
author: Fatih Tatoğlu
date: 2023-10-27T21:37:00Z
permalink: ./en/lab/environment/hyperv.html
language: en

title: Creating Virtual Machine with Hyper-V
header: Creating Virtual Machine with Hyper-V
description: Preparing a software development environment with Fatih's habits and preferences.
tags: powershell hyper-v virtual_machine virtual_switch

category: lab
group: environment
groupTitle: Development Environment
order: 2
---

After completing the preparation of the environment installation, I need a virtual machine to start development. I prefer to use Powershell instead of clicking many buttons.

## Network

To reach the Internet or communicate with the host and other virtual machines, the network settings should be done first.

```powershell
PS C:\Users\Fatih Tatoğlu> $natSwitch     = "NATSwitch"
PS C:\Users\Fatih Tatoğlu> $natIPAddress  = "172.19.85.1"
PS C:\Users\Fatih Tatoğlu> $natAddress    = "172.19.85.0/24"
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> New-VMSwitch -SwitchName $natSwitch -SwitchType Internal
PS C:\Users\Fatih Tatoğlu> New-NetIPAddress -IPAddress $natIPAddress -PrefixLength 24 -InterfaceAlias "vEthernet ($natSwitch)"
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> New-NetNAT -Name $natSwitch -InternalIPInterfaceAddressPrefix $natAddress
```

With the above commands, the virtual switch would be created. I selected the `172.19.85.0/24` IP range but it can be changed with wants and needs.

## Creating Virtual Machine

```powershell
PS C:\Users\Fatih Tatoğlu> $natSwitch = "NATSwitch"
PS C:\Users\Fatih Tatoğlu> $vmName = "fth-dev"
PS C:\Users\Fatih Tatoğlu> $workspacePath = "C:\\workspace\\machine\\"
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> $ramSize  = 8GB 
PS C:\Users\Fatih Tatoğlu> $diskSize = 50GB
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> New-VHD -Path "$workspacePath\\$vmName\\$vmName.vhdx" -SizeBytes $diskSize -Fixed -BlockSizeBytes 1MB
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> New-VM -Name $vmName -MemoryStartupBytes $ramSize -BootDevice VHD -VHDPath "$workspacePath\\$vmName\\$vmName.vhdx" -Path "$workspacePath" -Generation 2 -Switch $natSwitch
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> Set-VMFirmware $vmName -EnableSecureBoot Off
PS C:\Users\Fatih Tatoğlu> Set-VMProcessor -VMName $vmName -Count 2
PS C:\Users\Fatih Tatoğlu> Set-VM -Name $vmName -AutomaticCheckpointsEnabled $false -CheckpointType Disabled
PS C:\Users\Fatih Tatoğlu> Set-VMMemory -VMName $vmName -DynamicMemoryEnabled $true -MinimumBytes ($ramSize / 16) -StartupBytes ($ramSize / 8) -MaximumBytes $ramSize
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> Add-VMDvdDrive -VMName $vmName -Path "C:\\workspace\\iso\\linuxmint-21.2-xfce-64bit.iso"
PS C:\Users\Fatih Tatoğlu> 
PS C:\Users\Fatih Tatoğlu> $dvd = Get-VMDVDDrive -VMName $vmName
PS C:\Users\Fatih Tatoğlu> Set-VMFirmware -VMName $vmName -FirstBootDevice $dvd
PS C:\Users\Fatih Tatoğlu> Start-VM -Name $vmName
```

With the above commands, the virtual disk will be created. Then, the virtual machine will be arranged, and finally, the machine is started.

🔥 By changing the parameter, the different virtual machines can be created. On the other hand, those virtual machines are the base and empty machines. Don't forget to set its network settings manually.

If the below command is applied, the host machine will connect to the guest machine.

```powershell
PS C:\Users\Fatih Tatoğlu> $computer = hostname
PS C:\Users\Fatih Tatoğlu> vmconnect.exe $computer $vmName
```

## Virtual Machine Setting

I learned by experience with the different scenarios the network setting of the virtual machine may be tricky. In my environment, the DNS must be assigned the same as the host's gateway IP address. For example, if the host's gateway IP address is `192.168.6.1`. The virtual machine's DNS IP address must be `192.168.6.1`. The DNS server IP addresses can be used if a valid DNS server has been located.
