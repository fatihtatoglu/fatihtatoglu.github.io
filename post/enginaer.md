---
layout: post
author: Fatih Tatoğlu
description: Enginaer site motorunu projesinin amacı ve arkasındaki motivasyonun kaynağını açıklamaya çalışacağım.
date: 2022-03-24T00:00:00.000Z
published: true
permalink: ./projects/enginaer.html
tags: enginaer site_motoru gulp nodejs otomasyon markdown mustache markedjs
category: projects
---

# Enginær

2012 yılında yapmak istediğim ve bunun için aşağıdaki cesur sözleri de söylediğim projem. Yakın zamanda tekrar aklıma geldi ama bu sefer yayına alabilecek motivasyonu kendimde bulabildim.

> **Enginær neki?**
>
> Aslında yeni bir şey değil. Yıllardır wordpress, blogger ve benzeri hizmetler kullanılmakta. Bunlara alternatif olarak geliştirilen bir sistemdir.
>
> Kendinize veya işletmenize ait bir site yapmak istiyorsanız ve fazla uğraşmak istemiyorsanız Enginær'ı kullanabilirsiniz. Kurulum ve kullanım kolaylığı, istediğiniz şekilde özelleştirmeler yapabilmeniz ve daha bir çok özellik Enginær ile sizin olacak.
>
> Tek yapmanız Enginær sistemini kuracağınız web sitesine karar vermek.

## Motivasyon

Blog yazmak ve bildiklerimi bir şekilde paylaşmak hep yapmak istediğim ama bir o kadarda başaramadığım noktalardan bir tanesi. Bu sefer yeniden başlamak için çok farklı bir yol seçtim. Daha önceden alışıla gelmiş blog sistemlerinin aksine daha ***poor man's solution*** denebilecek bir yol seçmek istedim.

Statik bir sayfa üzerinden yazdıklarımın yayına alındığı ve bu işlemin mühendislik kokan bir işlem ile yapıldığını hayal ettim. Bunu yapabilecek bir yapı aramak yerine ellerimi de kirletip kendimin yazmasının çok daha eğlenceli olacağını düşündüm. Bu motivasyon ile yola çıktım ama 2012 yılında söylediğim büyük lafları da biraz desteklemenin iyi olacağını da unutmamaya çalıştım.

Sonuçta 2012 yılında hayal ettiğimden çok daha farklı bir ürün çıkmış bile olsa, çıkardığım üründen mutlu olduğumu söyleyebilirim.

## Zorluklar

Blog yazmanın en zor kısmı sürekli olmasını sağlamak. Süreklilik sağlamak için düşündüğümde, en çok zamanı yazıyı yazarken harcadığımı tespit ettim. Yazıların konularını belirle, araştır, araştırmaları detaylandır ve sonrasında kendi cümlelerinle konuyu içine sinecek şekilde özetle. Süreç uzun ancak bu kısım aynı zamanda en eğlenceli kısım.

Yazı yazma dışında; temayı ayarlamak, sayfaların görünüşünü düzenlemek ya da sayfalarda ufak eklemeler için eklenti aramakla geçiyordu. Bu kısmı ne kadar kolay yapabilirim diye düşünürken bu kısmın şablonlar ile oluşturulmasını sağlayacak bir yapı kurabileceğimi düşündüm.

![Gulp, Markdown, MarkedJS, Mustache, NodeJS, GitHub Actions, Glob, Sonar Cloud](../image/enginaer.png "Proje için kullanılan teknolojiler")

Bunun yanında sistem çok basit ayarlanmalı ve daha sonrasında neredeyse hiç ayarlamaya ihtiyaç duymadan çalışabilmeliydi. Tıpkı yazılım projelerinde olduğu gibi CI/CD pipeline'ı ile yayına çıkması aradığım mühendislik dokunuşunu da sağlayacaktı.

Proje ile ilgili düşünürken çok kararsız kaldığımı farkkettim. Bu yüzden aşağıdaki gibi bana yol gösterecek bir amaç listesi oluşturdum. Bu listeyi oluşturduktan sonra nelere odaklanmam gerektiğini ve nasıl bir sistem kurmam gerektiğini de kafamda netleştirmiş oldum.

1. Kolay ayarlanabilmeli. Çok karmaşık ayarlamalar veye kurallar gerektirmemeli.
2. Ayarladıktan sonra hızlı ve kolay kullanımlı olmalı.
3. Yazılar veya entryler markdown olmalı.
4. HTML çıktılar şablonlar ile değiştirilebilir olmalı.
5. Sistem gulp uyumlu olmalı. Bu sayede HTML dosyalar oluşturulduktan sonra üzerlerinde ek güncellemeler veya işlemler yapılabilir.

## Çalışma Şekli

Enginær ayarlaması kolay ve bir kere ayarladıktan sonra sadece yazılarınızı eklemek ile yayına çıkartabileceğiniz bir statik site motoru. Bu en baştan beri sağlamak istediğim yapıydı ve şu anda bu siteninde ayakta olmasını sağlayarak kendime ve sizlere de bu yapının çalıştığını ispat etmiş oluyorum.

Sistem bazı basit adımların sırayla yapılması ile çalışıyor. Bu adımlar;

- Sistemin ihtiyacı olan, şablonlar, sayfalar, mesajlar, sayfa eklentileri ve tema yardımcılarının bulunduğu yerleri konfigürasyon olarak veriyoruz.
- Konfigürasyon dosyalarında belirlenen kaynakların sisteme yüklenmesi.
- Son adım olarak sistemin işini yapması için statik sayfaların oluşturulması.

Sistem sayfalarda bulunan metadata bilgilerini kullanarak statik bir web sayfası oluşturuyor. Ancak sayfaları kaydetmiyor. Bu işlemi gulp üzerinde yapılması gerekiyor. Bunun en büyük sebebi de çıkan HTML dosyların farklı gulp eklentileri ile özelleştirilmesine olanak sağlayabiliyor olmak. Örneğin; çıktıların sıkıştırılması veya çıktırların içerisindeki css ve js dosyalarının sonuna versiyon numarası eklenerek istemci cache'inin devre dışı bırakılması vb. gibi işlemler.

## Destek

Herkesin kullanabilmesi için projeyi [MIT](https://github.com/fatihtatoglu/enginaer/blob/master/LICENSE) lisansı ile paylaştım. Proje aynı zamanda [NPM](https://www.npmjs.com/package/enginaer) olarak kullanımda. Proje geliştirilmeye devam ettiğim için destekleriniz çok önemli. Bu yüzden desteklerinizi projenin [GitHub](https://github.com/fatihtatoglu/enginaer/) adresi üzerinden bekliyorum. Eğer zaman ayırıp test ederseniz ve hataları da issue olarak iletirseniz beni daha da mutlu etmiş olursunuz.

## Referanslar

1. [Web Archive - enginar.in 2012](https://web.archive.org/web/20120520021450/http://enginar.in/ "Web Archive - enginar.in 2012")
2. [Writing a Gulp Plugin](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md "Writing a Gulp Plugin")
3. [Glob](https://github.com/isaacs/node-glob "Glob")
