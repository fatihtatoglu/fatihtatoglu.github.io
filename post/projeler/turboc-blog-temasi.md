---
layout: post
published: true
author: Fatih Tatoğlu
date: 2022-03-22T00:00:00.000Z
permalink: ./projeler/turboc-blog-temasi.html
language: tr

description: İlk programlamaya başladığımda kullanabileceğim sadece Turbo C/C++ vardı. Turbo C'yi baz alarak oluşturduğum site temasından bahsediyor olacağım.
tags: turboc turbocpp site_teması borland sass mustache gulp nodejs normalizecss github_actions github_pages
category: projects
repo_url: https://github.com/fatihtatoglu/blog-theme-turboc
repo_type: GitHub
---

# Turbo C/C++ Teması

![Turbo C/C++](../image/turboc_0001.png "Turbo C/C++")

Programlamaya başladığımda, kullanabileceğim yalnızca Turbo C/C++ vardı. Bu yazımda sizlere Turbo C/C++ tabanlı bir web sitesi temasını paylaşmak istiyorum.

## Motivasyon

> Liseye gittiğimde internet benim için çok yeniydi. İnternetsiz bir bilgisayarım vardı. İnterneti sadece internet kafelerde kullanma fırsatım oluyordu. Bilgisayarlar hakkında bilgi edinmek için bazı bilgisayar dergilerini takip ediyordum. Bir gün bir dergiden siyah bir kitapçık aldım. Kitapçığın başlığında "C Programlama Dili" yazıyordu ve bu benim merakımı harekete geçirdi. Kitapçığı olabildiğince hızlı okudum, ancak bu deneyimde bir şeylerin eksik olduğunu hissettim. Denemek zorundaydım. İnternette, bir Türk hacker grubu tarafından oluşturulmuş bazı ek notlarla birlikte Turbo C/C++ derleyicisini buldum.

Yukarıdaki hikaye aynı zamanda programlama ile tanışma hikayem.

Turbo C/C++'ı seviyorum çünkü bana kendi ellerimle bir şeyler yapma fırsatı verdi. Bu yüzden Turbo C/C++ tabanlı bir web sitesi teması programlamak istedim.

## Zorluklar

![Turbo C/C++](../image/turboc_0002.png "Turbo C/C++")

Bence en büyük zorluk, daha önce Turbo C/C++ kullanmış kullanıcılar için bir web uygulamasında benzer bir deneyim oluşturmaktı, çünkü web uygulamalarının ve masaüstü uygulamalarının kullanıcı deneyimleri tamamen farklı. Bunu başarmak için, kullanıcılara bunları kullanırken aynı deneyimi hissetmesini amaçladım.

Diğer bir zorluk ise temaya farklı renkler ve ekran duyarlı tasarım özellikleri eklemek. Bu istekler, **HTML5** ve **CSS3** ile geliştirilebilir, ancak **SASS** eklemek temayı daha uyumlanabilir hale getirecektir.

![SASS, normalize.css, Gulp, NodeJS, Mustache, GitHub Actions, GitHub Pages, Sonar Cloud](../image/turboc_tech.png "Proje Kütüphaneleri & Teknolojileri")

## Tema Özellikleri

Geliştirme sırasında bazı bileşenler ekledim, bunlar aşağıda listelenmiştir.

- Responsive tasarım
- Dört farklı renk
  - Su Yeşili
  - Mavi
  - Siyah
  - Beyaz
- Turbo C/C++ ortamı için uygun renk paleti 8 bittir
- Temanın unsurları
  - Tipografi
  - Buton
  - Metin kutusu
  - Metin alanı
  - Onay kutusu
  - Radyo düğmesi
  - Seçim kutusu
  - Tablo
  - Biçim
  - iletişim kutusu
  - Menü (Gezinme Çubuğu)
  - Bildirim Kutuları

## Destek

Temayı kendim için geliştirdim ancak [MIT](https://github.com/fatihtatoglu/blog-theme-turboc/blob/master/LICENSE "MIT Projesinin Lisansı") lisansı kapsamında herkesin erişmesi için paylaştım. Kullanmak için projenin [GitHub](https://github.com/fatihtatoglu/blog-theme-turboc "GitHub Projenin Adresi") adresini ziyaret edebilirsiniz. Tema ayrıca bir [NPM](https://www.npmjs.com/package/turboc_blog_theme.css) paketi olarak da kullanılabilir.
