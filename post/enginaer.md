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

Bir geliştirici olarak, *her gün tekrar eden işlemlerin bir kaç ayar sonrasında sadece basit tetiklemeler ile otomatik hale gelmeli* dediğim çok günlerim oldu. Bu yazıda size bu günlerden bir tanesinde aklıma gelen ama daha yeni hayata geçirebildiğim bir araçtan bahsediyor olacağım.

2012 yılında `enginar.in` adresi üzerinden yayına almayı planladığım bir proje kendisi.

> **Enginær neki?**
>
> Aslında yeni bir şey değil. Yıllardır wordpress, blogger ve benzeri hizmetler kullanılmakta. Bunlara alternatif olarak geliştirilen bir sistemdir.
>
> Kendinize veya işletmenize ait bir site yapmak istiyorsanız ve fazla uğraşmak istemiyorsanız Enginær'ı kullanabilirsiniz. Kurulum ve kullanım kolaylığı, istediğiniz şekilde özelleştirmeler yapabilmeniz ve daha bir çok özellik Enginær ile sizin olacak.
>
> Tek yapmanız Enginær sistemini kuracağınız web sitesine karar vermek.

yukarıdaki yazıyı [Web Archive][1] üzerinden buldum. O zamanlar ilgi çekici bir yazı hazırlamışım ama projeye hiç başlamadım.

[Turbo C Teması][3] yazımda da bahsettiğim gibi 2021 yılının sonralarında web sitemin temasını değiştirmek istemekle başladı. Sonrasında bu temayı nasıl bir siteye çeviririm ile devam etti. Kafamda çok fazla düşünce vardı ama hangisinin tam olarak istediğim sonuca beni götereceğinden emin değildim. Bu yüzden biraz etrafa bakmak istedim.

[gulp][2]'ın sitesini ziyaret ettiğimde bir animasyon gördüm. Animasyon, markdown dokümanların HTML dokümanlara çevirilmesiyle ilgiliydi. Daha öncesinde [notable][4] ile markdown üzerinden PDF dokümanlar oluşturduğum aklıma geldi. [GitHub Pages] kullanırken önerilen sistemlerden biri olan [Jekyll][13]'de benzer bir yapı ile çalıştığını gördüm. Buna benzer bir yapınında mutlaka bu sistem olması gerektiğini düşündüm.

[gulp][2] geliştirme sırasında bana büyük bir kolaylık sağlıyor. Bu sisteminde gulp üzerinde olması veya gulp içinde olması gerektiğini düşünerek, *bir gulp eklentisi nasıl yazılır?* konusunu araştırmaya başladım.

Bu isteklerimi tek tek not ettim. Araştırmalarımı yaptım ve sonrasında tam olarak ne istediğimi çok net kararlaştırmış oldum.

## Amaçlar & Hedef

Projeye başlarken bir amacım olursa bu sefer hem projeyi hayata geçirebilirim hem de takip edeceğim bir çerçeve olabilir diye düşündüm. Kafamdaki proje aşağıdaki listede yer alan özellikleri mutlaka karşılamayıldı.

1. Kolay ayarlanabilmeli. Çok karmaşık ayarlamalar veye kurallar gerektirmemeli.
2. Ayarladıktan sonra hızlı ve kolay kullanımlı olmalı.
3. Yazılar veya entryler markdown olmalı.
4. HTML çıktılar şablonlar ile değiştirilebilir olmalı.
5. Sistem gulp uyumlu olmalı. Bu sayede HTML dosyalar oluşturulduktan sonra üzerlerinde ek güncellemeler veya işlemler yapılabilir.
6. Sadece gereken kadar geliştirme yapılmalı. Çok ileriyi düşünmeye şu anda gerek yok.

## Kazanımlar ve Öğrenimler

Kendi sitemi, kendi istediğim tema ile yayınlayabileceğim bir sisteme sahip oldum. Ayrıca buna kolay ve hızlıca sahip oldum. Ek olarak sistemi [GitHub Actions][5]'a bağlayarak CI/CD sürecini de hazırlanmış oldu. Tek yapılması gereken -sistemi bir kere ayarladıktan sonra- Markdown olarak istenilen yazıyı yazmak ve sonrasında `git push` komutunu çalıştırmak.

| Teknolojiler |
|-|
| ![Gulp](../image/logo-gulp.png "Gulp") ![Markdown](../image/logo-markdown.png "Markdown") ![MarkedJS](../image/logo-markedjs.png "MarkedJS") ![Mustache](../image/logo-mustache.png "Mustache") ![NodeJS](../image/logo-nodejs.png "NodeJS") ![GitHub Actions](../image/logo-github-actions.png "GitHub Actions") |

Eğer sizde kullanmak isterseniz [Enginær'ın Github][11] sayfasını ziyaret edebilirsiniz. Herkesin kullanabilmesi için [MIT][12] lisansı ile paylaştım. Kullandıktan sonra geliştirilmesini istediğiniz özellikler veya hatalı kısımlar için issue açmanızı ve destek vermek için reporu yıldılamanızı rica ediyorum.

## Referanslar

1. [enginar.in Web Archive][1]
2. [Gulp][2]
3. [Fatih Tatoğlu - Turbo C Teması][3]
4. [NotableApp][4]
5. [GitHub Actions][5]
6. [NodeJS][6]
7. [Mustache][7]
8. [GitHub Pages][8]
9. [MarkedJS][9]
10. [Markdown Project][10]
11. [Enginaer][11]
12. [Enginaer MIT License][12]
13. [Jekyll][13]

[1]: https://web.archive.org/web/20120520021450/http://enginar.in/
[2]: https://gulpjs.com/
[3]: https://blog.tatoglu.net/post/turboc-blog-theme.html
[4]: https://notable.app/
[5]: https://github.com/features/actions
[6]: https://nodejs.org/en/
[7]: https://mustache.github.io/
[8]: https://pages.github.com/
[9]: https://marked.js.org/
[10]: https://daringfireball.net/projects/markdown/
[11]: https://github.com/fatihtatoglu/enginaer
[12]: https://github.com/fatihtatoglu/enginaer/blob/master/LICENSE
[13]: https://jekyllrb.com/
