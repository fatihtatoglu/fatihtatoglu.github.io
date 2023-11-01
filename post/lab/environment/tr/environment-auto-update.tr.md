---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-08-07T17:54:27Z
permalink: ./lab/environment/auto-update.html
language: tr

title: Otomatik Güncellemeler
header: Otomatik Güncellemeler
description: Fatih'in alışkanlık ve tercihlerine uygun bir yazılım geliştirme ortamı hazırlamak.
tags: mint ubuntu linux_mint apt update upgrade autoclean

category: lab
group: environment
groupTitle: Geliştirme Ortamı
order: 4
---

Her ne olursa olsun, bir işletim sistemi periyodik olarak güncel tutulmalıdır. Ancak bunun için zaman harcamak ekstra zaman gerektirebilir. Bu yüzden otomatik bir süreç tanımlamak faydalı olabilir. Bunu sağlamak için aşağıdaki komutlar yeterli olacaktır.

🔥 Bu not Linux Mint 20.3 Xfce Sürümü üzerinde test edilmiş bazı komutları içermektedir. Farklı sürümler ve versiyonlar ekstralara ihtiyaç duyabilir.

```shell
fatihtatoglu@fth-linux:~$ sudo vim /etc/crontab
```

Aşağıdaki satır dosyanın en altına eklenmelidir.

```nestedtext
@reboot root (/usr/bin/apt update -q -y >> /var/log/apt/cronupdate.log) && (/usr/bin/apt upgrade -q -y >> /var/log/apt/cronupdate.log) && (/usr/bin/apt autoclean -q -y >> /var/log/apt/cronupdate.log) && (/usr/bin/apt autoremove -q -y >> /var/log/apt/cronupdate.log)
```

Ardından sunucuyu yeniden başlatın.

```shell
fatihtatoglu@fth-linux:~$ sudo reboot
```

Komutun açıklaması şudur: `root` kullanıcısı `update`, `upgrade`, `autoclean` ve `autoremove` komutlarını uygular. Bu komutlarla, sunucu işletim sisteminin her başlangıcında güncellemeleri kontrol eder ve uygular.
