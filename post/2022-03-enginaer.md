---
layout: post
author: Fatih Tatoğlu
description: Enginaer site motorunu nereden çıktı, neden yazmak istedim, neleri başardım ve başıma neler geldi.
date: 2022-03-24T00:00:00.000Z
published: true
permalink: ./post/enginaer.html
tags: enginaer site_motoru gulp nodejs otomasyon markdown mustache markedjs
---

# Enginær

Bir geliştirici olarak bir kaç ayar yapayım ve sonrasında sadece yazayım ve canlıya alayım dediğim çok günüm oldu. Bu yazıda size bu günlerde bir tanesinde aklıma gelen ama daha yeni hayata geçirebildiğim bir araçtan veya site moturundan bahsedeceğim.

2012 yılında `enginar.in` adresi üzerinden yayına aldığım bir proje kendisi.

> **Enginær neki?**
>
> Aslında yeni bir şey değil. Yıllardır wordpress, blogger ve benzeri hizmetler kullanılmakta. Bunlara alternatif olarak geliştirilen bir sistemdir.
>
> Kendinize veya işletmenize ait bir site yapmak istiyorsanız ve fazla uğraşmak istemiyorsanız Enginær'ı kullanabilirsiniz. Kurulum ve kullanım kolaylığı, istediğiniz şekilde özelleştirmeler yapabilmeniz ve daha bir çok özellik Enginær ile sizin olacak.
>
> Tek yapmanız Enginær sistemini kuracağınız web sitesine karar vermek.

yukarıdaki yazıyı [Web Archive][1] üzerinden buldum. O zamanlar ilgi çekici bir yazı hazırlamışım ama yine de projeyi tamamlayamadığım için yayına almadım.

[Turbo C Teması][3] yazımda da bahsettiğim gibi 2021 yılının sonralarında web sitemin temasını değiştirmek istemekle başladı. Sonrasında bu temayı nasıl bir siteye çeviririm ile devam etti.

[gulp][2]'ın sitesini ziyaret ettiğimde bir görsel gördüm. Görselde markdown dokümanların HTML dokümanlara çevirilmesiyle ilgili olarak bir animasyon vardı. Daha öncesinde [notable][4] ile markdown üzerinden PDF dokümanlar oluşturduğum olmuştu. Bunun aynısını yazacağım sistemde de olması gerekiyordu. [GitHub Pages] kullanırken önerilen sistemlerden biri olan [Jekyll][14]'de benzer bir yapı ile çalıştığını gördüm.

Bu isteklerimi tek tek not ettim. Sonrasında bu notlarımı bir araya getirip çalışmaya başladım.

## Amaçlar & Hedef

1. Öncelikle kolay ayarlanabilmeli. Çok karmaşık ayarlamalar veye kurallar gerektirmemeli.
2. Temaya göre veya şablonlara göre HTML üretimini değiştirebilmeliyim.
3. Yazılar veya entryler markdown olmalı.
4. Sistem gulp uyumlu olmalı. Bu sayede HTML dosyalar oluşturulduktan sonra üzerlerinde ek güncellemeler veya işlemler yapılabilir.
5. Bir kere ayarladıktan sonra hızlı ve kolay kullanımlı olmalı.

## Çalışma Şekli

Çalışma şekli aslında çok basit. Sayfalar, yazılar ve şablonlar sisteme yükleniyor. Sonrasında HTML sayfaları oluşturuluyor. En son sistemin çıktısının peşine ek olarak bağlayacan gulp pluginleri ile sistem esnek ve genişletilebilir oluyor.

Çalışma şeklinin kontrol ettiğimde bütün amaçları ve hedefleri sağladığımı düşünüyorum.

Sistemin ana bileşeni [gulp][7] ve site motoruda onun üzerinde çalışıyor. Eklenen ek özellikler sayesinde de HTML dosyalarının oluşturulma aşamasında özelleştirmeler ve ayarlamalar yapılabiliyor.

## Kazanımlar ve Öğrenimler

Kendi sitemi, kendi istediğim tema ile yayınlayabileceğim bir sisteme sahip oldum. Ayrıca buna kolay ve hızlıca sahip oldum. Ek olarak sistemi [GitHub Actions][5]'a bağlayarak CI/CD sürecini de yapmış oldum. Tek yapmam gereken -sistemi bir kere ayarladıktan sonra- Markdown olarak istediğim yazıyı yazmak ve sonrasında `git push` komutunu çalıştırmak.

| Teknolojiler |
|-|
| ![Gulp](../image/logo-gulp.png "Gulp") ![Markdown](../image/logo-markdown.png "Markdown") ![MarkedJS](../image/logo-markedjs.png "MarkedJS") ![Mustache](../image/logo-mustache.png "Mustache") ![NodeJS](../image/logo-nodejs.png "NodeJS") ![GitHub Actions](../image/logo-github-actions.png "GitHub Actions") |

## Markdown

Bu format ile aslında sadece düm düz yazıyoruz. Sonunda elimizde sade ve anlaşılabilir bir doküman oluyor. Bu yüzden ben çok tercih ediyorum.

## Mustache

Eğer bir yerde şablon kullanmam gerekiyor ise mutlaka ilk tercihim [mustache][8] oluyor. Kullanımı kolay olmasının yanında esnek bir yapı sağlaması tercih etmemdeki en büyük nedenlerden biri.

## MarkedJS

Sistemi kurmak için mutlaka markdown objeleri HTML olarak işlemem gerekiyordu. Bunun için biraz araştırınca çoğunluğun önerisi olan [MarkedJS][11] kütüphanesini seçmemin doğru olacağını düşündüm. Geliştirilebilir bir plugin yapısına sahip olması ve kullanım kolaylığı doğru seçim yaptığımı gösteriyor.

Diğer teknolojileri veya araçları normalde de kullanıyorum. O yüzden çok değinmeyeceğim. Ama kendi ürettiğim ürünleri kullanarak başka bir ürün çıkartıyor olmak aynı bir mutluluk kaynağı.

Eğer sizde kullanmak isterseniz [Enginær'ın Github][13] sayfasını ziyaret edebilirsiniz. Herkesin kullanabilmesi için [MIT][14] lisansı ile paylaştım. Kullandıktan sonra geliştirilmesini istediğiniz özellikler veya hatalı kısımlar için issue açmanızı ve destek vermek için reporu yıldılamanızı rica ediyorum.

## Referanslar

1. [enginar.in Web Archive][1]
2. [Gulp][2]
3. [Fatih Tatoğlu - Turbo C Teması][3]
4. [NotableApp][4]
5. [GitHub Actions][5]
6. [NodeJS][6]
7. [Gulp][7]
8. [Mustache][8]
9. [GitHub Pages][9]
10. [MarkedJS][10]
11. [Markdown Project][11]
12. [Enginaer][12]
13. [Enginaer MIT License][13]
14. [Jekyll][14]

[1]: https://web.archive.org/web/20120520021450/http://enginar.in/
[2]: https://gulpjs.com/
[3]: https://blog.tatoglu.net/post/turboc-blog-theme.html
[4]: https://notable.app/
[5]: https://github.com/features/actions
[6]: https://nodejs.org/en/
[7]: https://gulpjs.com/
[8]: https://mustache.github.io/
[9]: https://pages.github.com/
[10]: https://marked.js.org/
[11]: https://daringfireball.net/projects/markdown/
[12]: https://github.com/fatihtatoglu/enginaer
[13]: https://github.com/fatihtatoglu/enginaer/blob/master/LICENSE
[14]: https://jekyllrb.com/
