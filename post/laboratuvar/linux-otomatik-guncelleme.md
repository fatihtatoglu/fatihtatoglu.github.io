---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-08-07T17:54:27Z
permalink: ./lab/linux/otomatik-guncelleme.html
language: tr

title: Linux - Otomatik Güncelleme
header: Linux - Otomatik Güncelleme
description: Ubuntu veya Mint makinemi her seferinde güncellemekle uğraşmak yerine bu işlemi otomatik olarak yaptırıyorum.
tags: mint ubuntu linux_mint apt update upgrade autoclean
---

İşletim sistemi ne olursa olsun mutlaka periyodik olarak güncellemelerini kontrol etmek gerektiğini düşünüyorum. Bu yüzden Linux Mint geliştirme ortamımın her zaman güncel kalmasını sağlamak için aşağıdaki tanımları yapmam yeterli oluyor.

```shell
fatihtatoglu@fth-linux:~$ sudo vim /etc/crontab
```

Açılan dosyanın en altına aşağıdaki komutu ekliyoruz.

```nestedtext
@reboot root (/usr/bin/apt update -q -y >> /var/log/apt/cronupdate.log) && (/usr/bin/apt upgrade -q -y >> /var/log/apt/cronupdate.log) && (/usr/bin/apt autoclean -q -y >> /var/log/apt/cronupdate.log) && (/usr/bin/apt autoremove -q -y >> /var/log/apt/cronupdate.log)
```

Sonrasında makineyi restart etmek yeterli oluyor.

```shell
fatihtatoglu@fth-linux:~$ sudo reboot
```

Komutun açıklaması olarak; her açılışta `root` user olarak `update`, `upgrade`, `autoclean` ve `autoremove` komutlarını çalıştır deniyor. Bu sayede makinem her zaman her açılışta en güncel paketleri almış oluyor.
