---
id: sqbhqjk89b
lang: tr
title: "SHEVKY: Yazma Odaklı Minimal Statik Site Üretici"
subtitle: "Yazma sürecindeki engelleri kaldırmak için tasarlanmış sade bir SSG"
slug: shevky-minimal-statik-site-uretici
category: "teknik-notlar"
tags:
  - statik-site-uretici
  - minimal-ssg
  - markdown
  - yazma-odakli
  - geliştirici-blogu
  - nodejs
  - open-source
readingTime: 4
date: 2025-12-12
updated: 2025-12-13
pair: "shevky-static-site-generator"
canonical: ~/shevky-minimal-statik-site-uretici/
alternate: ~/en/shevky-static-site-generator/
description: "Yazmaya odaklanan minimal bir statik site üretici: SHEVKY. Markdown ile yaz, sade bir yapı kur ve engeller olmadan yayınla."
keywords:
  - statik site üretici
  - minimal ssg
  - markdown
  - yazma süreci
  - nodejs
featured: false
draft: false
cover: "/assets/images/shevky-cover.webp"
coverAlt: "Yazma odaklı minimal bir statik site üreticinin çalışma akışını gösteren sade bir görsel"
coverCaption: "SHEVKY, özellik eklemek yerine yazma sürecindeki engelleri kaldırmaya odaklanır."
template: "post"
layout: "default"
status: "published"
---
# SHEVKY: Yazma Odaklı Minimal Statik Site Üretici

Bu bir araç hakkındaki yazı değil. Yazı yazma sürecindeki engelleri kaldırmakla ilgili.

Uzun zamandır bir blog kurmaya çalıştım ama asla düzenli bir ritim veya sürdürülebilir bir yazma hızı yakalayamadım. WordPress, Medium, LinkedIn vb. denedim. Ama olmadı. Her seferinde bu doğru zaman derdim. Asla olmadı. Bir arkadaşım bana şöyle demişti: _"Sen bir şeyler paylaşmak istiyorsun. Tasarımın ya da motorunun mükemmel olması gerekmiyor."_

Bir süre, **Enginær** adında Node.js ile Gulp pipeline üzerine inşa edilmiş kendi statik site üreticisi üzerinde çalıştım. Motivasyon kaynağı aynıydı; yazma için bir yer yaratmak. Ama yaklaşık 3 yıldır ne güncelleme yaptım ne de hatalarını düzelttim.

Bazı dış kaynaklı projeleri tamamladıktan ve bir start-up'ta çalıştıktan sonra, özellikle landing page ve yarı dinamik web uygulamalar için içerik yönetim sistemlerinin (CMS) genellikle gerekli bir araç olduğu gerçeğini fark ettim. Bu gerekliliği benim blog yazma tutkumla birleştirdiğimde, **Enginær**'den edindiğim bilgilerle **SHEVKY**'yi geliştirdim.

## SHEVKY Nedir?

![SHEVKY Process Flow](/assets/images/shevky-process-flow.webp)

**SHEVKY**, basit ve hafif bir statik site üreticidir. Diğer birçoğu gibi, Markdown dosyalarını düz HTML'ye dönüştürür. Ancak **SHEVKY**, mevcut statik site üreticileri yeniden icat etme çabası değildir. Daha hızlı, daha akıllı ya da daha popüler olmaya çalışmıyor. Engelleri kaldırmak için tasarlanmış basit bir motordur. Mükemmel kurulumu beklemeyi bırakmak içindir. Başlamadan önce her şeyi hizalamayı bırakmaktır. **SHEVKY**, en azından benim bahanelerimi ortadan kaldırmak için vardır.

Bundan sonra, her şey kasıtlı olarak sıkıcıdır.

## Kurulum

**SHEVKY**, sıfırdan bir web sitesi başlatmak ve oluşturmak için bir CLI aracıdır.

```bash
npm install --save-dev shevky
```
Yüklemek için yukarıdaki komut yeterlidir. Kullanım, `npx shevky` komutuyla devam eder.

## Kullanım

Diğer CLI araçları gibi terminalden kullanılabilir. Tek ön koşul **Node.js v20**'dir; bu zaten çoğu bulut sağlayıcısı ve CI/CD hattı tarafından desteklenmektedir.

### Projeyi Başlatma

Basit bir şekilde başlamak için, projeyi aşağıdaki komutla başlatmayı tercih ederim:

```bash
npx shevky --init
```

Bu komut, basit bir demo web sitesi için gerekli klasörleri ve dosyaları oluşturur.

![SHEVKY Folder Structure](/assets/images/shevky-folder-structure.webp)

Şimdilik **SHEVKY**, klasör yapısı ve şablon mekanizması gibi bazı yapısal varsayımlarına bağlıdır. Ancak bunlar gelecekte değiştirilebilir. Önemli olan MVP kapsamını tamamlamaktır.

### Oluşturma

İçerik düzenlemeyi bitirdikten sonra, aşağıdaki komut çıktıyı statik bir HTML web sitesi olarak hazırlar:

```bash
npx shevky --build
```

HTML web sitesini `dist` klasörüne oluşturur. Daha sonra S3, GitHub Pages, AWS Amplify vb. gibi herhangi bir statik barındırma yapısına dağıtılabilir.

### Yazarken veya Geliştirirken

Yazarken veya geliştirirken, iş akışını basitleştirmek için iki bayrak ekledim: `--watch` ve `--dev`. `--dev` bayrağı zaten `--watch`'ı içerir; böylece herhangi bir değişiklik otomatik olarak yeniden oluşturmayı tetikler.

## Özellikler

Engelleri kaldırdıktan sonra, geri kalanı ikincildir. Özellikler yalnızca yazma eylemini desteklemek için vardır - başka bir şey değil.

**SHEVKY**, bazı gerekli özellikler sağlasa da basit bir SSG'dir. Kasıtlı olarak basit olmasına rağmen, bir SSG'den kişisel olarak ihtiyaç duyduğum temel gereksinimleri karşılar.

- RSS Üretimi
- Çoklu Dil Desteği
- Sitemap Üretimi
- Atom Beslemeleri
- Mustache ile Çalışan Şablon Sistemi
- Koleksiyon Üretimi
- Seri Üretimi
- Sosyal Medya Paylaşım Üretimi
- Açık Grafik Hazır Başlıklar
- SEO Dostu Başlıklar
- Kod Vurgulama

Gerekli bilgiler sağlandığı takdirde üretici yukarıdaki içerikleri oluşturur. Ayrıca, bu özelliklerin bazıları bayraklarla açılıp kapatılabilir.

Öte yandan, bir API'den içerik çekme ve siteyi statik HTML olarak üretme gibi içerik sunma özelliklerini eklemeyi planlıyorum.

## Neden Başka Bir Statik Site Üretici?

Bir noktada soru "ne kadar çok şey destekliyor?" olmaktan ziyade "aslında neden var?" sorusuna dönüştü. Dürüstçe söylemek gerekirse, çoğu ya benim ihtiyaçlarım için çok karmaşık ya da düşünme şeklime göre çok soyuttu.

## SHEVKY'yi Kimler Kullanabilir?

Kısa cevap: Programlama geçmişi olan kişiler. Çünkü bazı teknik bağlam gerektiriyor. **SHEVKY**, tasarım olarak ön kabullüdür ve bundan memnunum.

**SHEVKY**'nin GitHub deposunda ayrıntılı bir teknik dokümantasyon hazırladım. Teknik detayları, dokümantasyonu ve bazı örnekleri burada bulabilirsiniz.

**SHEVKY**'nin perde arkasındaki çalışma şekli hakkında meraklıysanız, teknik dokümantasyon GitHub deposunda yer alıyor. Yapılandırma, tasarım kararları gibi yapısal ayrıntıları kapsar.

**SHEVKY**, web siteleri oluşturmakla ilgili değil. Bahaneleri ortadan kaldırmak ve sonunda başlamakla ilgili.

## İlgili Bağlantılar

- [Enginær GitHub Deposu](https://github.com/fatihtatoglu/enginaer)
- [SHEVKY GitHub Deposu](https://github.com/fatihtatoglu/shevky)
