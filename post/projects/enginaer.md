---
layout: post
author: Fatih Tatoğlu
published: false
date: 2022-03-24T00:00:00.000Z
permalink: ./projeler/enginaer.html
language: tr

title: Enginær
header: Enginær
description: Enginaer site motorunu projesinin amacı ve arkasındaki motivasyonun kaynağını açıklamaya çalışacağım.
tags: enginaer site_motoru gulp nodejs otomasyon markdown mustache markedjs
category: projects
repo_url: https://github.com/fatihtatoglu/enginaer
repo_type: GitHub
---

Enginær, basit bir statik web sitesi oluşturma motoru. Ayrıca, [2012](https://web.archive.org/web/20120626234836/http://enginar.in/ "Web Archive - Enginær") yılında aynı isimle ve amaçla tamamlayamadığım bir proje.

## Motivasyon

Bir yazılım geliştiricisi olarak normal programlardan daha fazla IDE kullanıyorum. Geliştirme sırasında genellikle komut satırında bir komut çalıştırırım. Sonuç beklendiği gibi ise, değişiklikleri repolara gönderirim.

Bu projeyi kodlama kararımın arkasındaki en büyük motivasyon, bir uygulama geliştirirken ki deneyimin aynısını yaşatmaya çalışmak.

## Zorluklar

Teknik tarafı bir yana, statik bir web sitesi oluşturmak düşünüldüğünden daha karmaşık. Ayrıca ek özellikler eklemek, projeyi ulaşılamaz bir hedefe dönüştürebilir.

Teknik olarak, başka bir zorluk da mümkün olduğunca basit kalmak. Motor özelleştirilebilir, uyumlu, basit ve genişletilebilir olmalı. Uyumluluğu sağlamak için motor bir Gulp eklentisi olarak geliştirildi. Özelleştirme için motora bir şablon sistemi eklendi. Ayrıca şablonları ve sayfa eklentileri ile desteklendi. Basit olması için gerekli kaynaklar, temel tanım bilgilerini içeren bir Markdown dosyası olması sağlandı. Genişletilebilirliği sağlamak için motorun çıktısı kaydedilmiyor. Böylece diğer Gulp eklentileri, motor işlemleri tamamladıktan sonra çalıştırılabilir.

![Gulp, Markdown, MarkedJS, Mustache, NodeJS, GitHub Actions, Glob, Sonar Cloud](../image/enginaer_tech.png "Proje Kütüphaneleri & Teknolojileri")

## Destek

Projeyi herkesin kullanması için [MIT](https://github.com/fatihtatoglu/enginaer/blob/master/LICENSE) lisansıyla kullanıma sundum. Proje ayrıca bir [NPM](https://www.npmjs.com/package/enginaer) paketi olarak da kullanılabilir. Projeyi daha da geliştirmek istediğim için desteğiniz önemli. Kullanmak ve desteklemek için projenin [GitHub](https://github.com/fatihtatoglu/enginaer) adresini ziyaret edebilirsiniz.
