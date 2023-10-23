---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-08-07T17:54:27Z
permalink: ./en/lab/environment/auto-update.html
language: en

title: Auto Updates
header: Auto Updates
tags: mint ubuntu linux_mint apt update upgrade autoclean

category: lab
group: environment
groupTitle: Development Environment
order: 4
---

Whatever happens, an OS must be kept up-to-dated periodically. However, spending time on this may be needed extra time. So, defining an automatic process can be helpful. To provide this the below commands can be enough.

🔥 This note contains some commands tested on the Linux Mint 20.3 Xfce Edition. The different editions and versions may need extras.

```shell
fatihtatoglu@fth-linux:~$ sudo vim /etc/crontab
```

The below line must be added to the bottom of the file.

```nestedtext
@reboot root (/usr/bin/apt update -q -y >> /var/log/apt/cronupdate.log) && (/usr/bin/apt upgrade -q -y >> /var/log/apt/cronupdate.log) && (/usr/bin/apt autoclean -q -y >> /var/log/apt/cronupdate.log) && (/usr/bin/apt autoremove -q -y >> /var/log/apt/cronupdate.log)
```

Then restart the server.

```shell
fatihtatoglu@fth-linux:~$ sudo reboot
```

An explanation of the command is that, as a `root` user applies `update`, `upgrade`, `autoclean`, and `autoremove` commands. With those commands, the server checks and applies updates at every start of the OS.
