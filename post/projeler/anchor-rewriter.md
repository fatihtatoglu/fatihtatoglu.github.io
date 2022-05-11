---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-04-08T00:00:00.000Z
permalink: ./projeler/gulp-html-link-duzenleyicisi.html
language: tr

description: Kendi ihtiyacım için geliştirdiğim gulp eklentisi.
tags: enginaer gulp mocha chai plugin eklenti
category: projects
repo_url: https://github.com/fatihtatoglu/gulp-html-anchor-rewriter
repo_type: GitHub
---

# Gulp HTML Link Düzenleyicisi

Enginaer'i geliştirdikten sonra SEO'nun eksik olduğunu fark ettim. Bu eklenti ile HTML bağlantı elemanlarının **rel** ve **target** attributelarını düzenliyorum.

## Motivasyon

Kişisel web siteleri için SEO önemlidir. SEO eksikliği, web sitesinin yeterince ziyaretçi tarafından ziyaret edilmemesine neden olabilir. Kişisel web sitem için Enginaer'ı kullanmadan önce bunu hayal bile edemezdim. Kullandıktan sonra bu eklentiyi yazmam gerektiğine karar verdim. Normalde düzeltmek için bir kod parçası ekleyebilirdim. Ama bu sefer ellerimi kirletmeyi tercih ettim.

## Zorluklar

![NodeJS, Mocha, Chai, GitHub Actions, SonarCloud](../image/gulp-html-anchor-rewriter_tech.png "Proje için kullanılan teknolojiler")

Daha önce hiç Gulp eklentisi geliştirmedim. Hem örneklerden gördüğüm hem de okuduğum [kaynaklar](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md) bir Gulp eklentisi için, birim testi yazmak, diğer eklentilerin iç içe kullanılmaması gibi [önerilerin](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md) olduğunu buldum. Hem bir Javascript projesi için test yazmak ya da TDD ile ilerlemek en büyük zorluklarımdan biri oldu.

Özetle, kendi sorunum için çözüm bulmaya çalışırken, sonuç herkes için açık kaynak olarak sunulan bir Gulp eklentisi oldu.

## Destek

Projeyi herkesin kullanması için [MIT](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter/blob/master/LICENSE) lisansıyla kullanıma sundum. Proje ayrıca bir [NPM](https://www.npmjs.com/package/gulp-html-anchor-rewriter) paketi olarak da kullanılabilir. Kullanmak ve desteklemek için projenin [GitHub](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter) deposunu ziyaret edebilirsiniz.
