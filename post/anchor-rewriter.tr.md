---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-04-08T00:00:00.000Z
permalink: ./projects/gulp-html-anchor-rewriter.html
language: tr

description: Kendi ihtiyacım için geliştirdiğim gulp eklentisi ve bunu yaparken öğrendiklerim ile ilgili bir proje.
tags: enginaer gulp mocha chai plugin eklenti
category: projects
---

# Gulp HTML Link Düzenleyicisi

Enginaer'i geliştirdikten sonra SEO'nun eksik olduğunu fark ettim. Bu eklenti ile HTML bağlantı elemanlarının **rel** ve **target** niteliklerini düzenliyorum.

## Motivasyon

Kişisel web siteleri için SEO önemlidir. SEO eksikliği, web sitesinin yeterince ziyaretçi tarafından ziyaret edilmemesine neden olabilir. Kişisel web sitem için Enginaer'ı kullanmadan önce bunu hayal bile edemezdim. Sonunda SEO için bir bağlantı elemanını tekrar yazmaya ihtiyacım oldu.

Normalde, SEO'yu düzeltmek için bir kod parçası ekleyebilirim. Ama bu sefer ellerimi kirletmeyi tercih ettim. Öncelikle, bir Gulp eklentisinin nasıl geliştirileceğini bilmem gerekiyordu. Ardından, statik kod analizi ile bir derleme işlem hattı oluşturdum. Sonunda web sitem için kullandım.

Bu eklentiyi geliştirmek benim için çok öğreticiydi.

## Zorluklar

![NodeJS, Mocha, Chai, GitHub Actions, SonarCloud](../image/gulp-html-anchor-rewriter_tech.png "Proje için kullanılan teknolojiler")

Daha önce hiç Gulp eklentisi geliştirmedim. Eklenti belgelerini okuduktan sonra heyecanlandım. Gulp eklentileri için birim testleri zorunludur. Yani birim testi isteğe bağlı değilse, Test Odaklı Geliştirme ile geliştirebilirim.

Özetle, kendi sorunumu çözmeye başladım. Sonuç, herkes için açık kaynak olarak sunulan bir Gulp eklentisiydi.

## Destek

Projeyi herkesin kullanması için [MIT](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter/blob/master/LICENSE) lisansıyla kullanıma sundum. Proje ayrıca bir [NPM](https://www.npmjs.com/package/gulp-html-anchor-rewriter) paketi olarak da kullanılabilir. Kullanmak ve desteklemek için projenin [GitHub](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter) deposunu ziyaret edebilirsiniz.
