---
layout: post
author: Fatih Tatoğlu
description: Kendi ihtiyacım için geliştirdiğim gulp eklentisi ve bunu yaparken öğrendiklerim ile ilgili bir proje.
date: 2022-04-08T00:00:00.000Z
published: true
permalink: ./projects/gulp-html-anchor-rewriter.html
tags: enginaer gulp mocha chai plugin eklenti
category: projects
---

# Gulp HTML Link Düzenleyicisi

Kendi sitemi enginær site motoru ile oluştururken SEO kısmında çok sıradışı bir ihtiyacım olduğunu farkkettim. Bu yüzden kendim için bir gulp eklentisi geliştirdim. Bu plugin ile bir HTML dosyasındaki **a** elementlerine **rel** ve **target** eklemesi yapılabiliniyor.

## Motivasyon

Enginær'ı geliştirirken SEO ile ilgili bir konu hiç aklıma gelmedi. Ancak kendi sitemde kullanırken (yani bu site) SEO nun ne kadar önemli olduğunu hatırladım. Bir gulp eklentisi buldum sitemap.xml dosyasını oluşturdum. Enginær'ın şablonlarını özelleştirerek link ayarlamalarını yaptım ancak en sonunda siteden dışarı doğru giden bağlantıların **rel** linki olmadığını ve bu linklerinde sitenin içinde açılmasını engellemek için **target** özelliği eklemem gerekliliğini belirledim. Ancak bunu yapan bir eklenti bulamadım.

Aradığım eklentiyi bulamadığım zaman, aklımın içindeki bir ses bunu kendimin geliştirmesinin eğlenceli olabileceğini söyledi. Bu sefer bu sesi takip etmek istedim ve kolları sıvadım. Amacım bir HTML dosyasındaki bazı **a** elementlerine **rel** ve **target** özelliği eklemek.

## Zorluklar

![NodeJS, Mocha, Chai, GitHub Actions, SonarCloud](../../image/gulp-html-anchor-rewriter_tech.png "Proje için kullanılan teknolojiler")

Daha önce sadece Enginær ile gulp eklentisi geliştirme tecrübem olmuştu. Bu proje biraz daha kolay olacağı için kendimce kendime bir zorluk çıkartmam gerektiğini düşündüm ve bir gulp eklentisinin nasıl yazılması gerektiği ile ilgili araştırmalara başladım. Gulp'ın GitHub adresinde çok güzel bir doküman buldum. Bu dokümanı takip ederek güzel bir eklenti yazabileceğimi düşünerek işe başladım.

Dokümanda eklentilerin mutlaka test edilmesi gerektiği yazıyordu. NodeJS ya da JavaScript ile daha önce hiç unit test yazmamış biri olarak bu da güzel bir zorluk olacağı için devam ettim. **Mocha** ve **Chai** kütüphanelerini araştırmalarımda buldum ve bunları biraz araştırdıktan sonra çok zor olmadıklarına karar vererek devem ettim. Eklentiyi geliştirdim, üstüne bir iki düzeltme de yaptım ve sonrasında her unit test eklediğim projemde olduğu gibi projenin code coverage oranını merak ettim. Bunu da **IstanbulJS** ile sağladm.

Projenin basit olması ve hızlı ilerlemesinden sonra bir ekleme daha yapmam gerektiğini düşündüm. Madem projeyi bitirdim o zaman bir CI/CD yapısı ve buna entegre bir statik kod analizi eklemenin öğretici olacağını düşündüm. Statik kod analizi dediğimde ilk aklıma gelen **SonarQube** olduğu için proje de **SonarCloud** tercih ettim. Zaten **GitHub Actions** ile oluşturduğum pipeline da otomatik olarak **SonarCloud**'a entegre olunca ışık hızında halletmiş oldum.

Bir iki tarama sonrasında, hesaplanan code coverage değerlerini **SonarCloud**'a akmadığını gördüm. Bunun içinde ufak bir araştırma sonrasında, otomatik yerine **GitHub Actions** içerisinden manuel işlenmesi ile de bu sorunu çözmüş oldum.

Gün sonunda çok sıradışı bir ihtiyaç ile yola çıktım ama öğrendiklerim ve kazandığım tecrübe çok değerli. Bunun gibi projeler yapmaya ve kendimi zorlamaya devam ediyor olacağım.

Projeyi herkesin kullanabilmesi için [MIT](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter/blob/master/LICENSE, "Projenin MIT Lisansı") lisansı ile yayına aldım. Erişiminin kolay olması için de [NPM](https://www.npmjs.com/package/gulp-html-anchor-rewriter "Projenin NPM adresi") üzerinden herkesin kullanımına açtım. İstediğiniz gibi kullanabilirsiniz. Eğer destek olmak veya katkı sağlamak isterseniz projenin [GitHub](https://github.com/fatihtatoglu/gulp-html-anchor-rewriter "Projenin GitHub Adresi") adresini ziyaret edebilir ve yıldız bırakabilirsiniz. Kullanım sırasındaki sorunları da mutlaka issue olarak girmenizi de rica ediyorum.

## Referanslar

1. [Writing a Gulp Plugin](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md "Writing a Gulp Plugin")
2. [Scan your code with SonarCloud](https://github.com/SonarSource/sonarcloud-github-action "Scan your code with SonarCloud")
3. [SonarCloud HowTo](https://asus-aics.github.io/DeveloperGuide/pages/020_sonar_cloud/ "SonarCloud HowTo")
