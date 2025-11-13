# Post Template (TR)

Üç örnek yazının (`swot-analizi-nedir.md`, `gelistirme-ortami-kurulumu.md`, `aws-lambda-google-sheets-baglantisi.md`) ortak alanlarını baz alarak yeni bir gönderi hazırlarken aşağıdaki şablonu kullan. Front matter kısmını eksiksiz doldur; içerik bölümündeki başlıklar ihtiyaca göre güncellenebilir.

## Front Matter

```md
---
id: xxxxxxxx00          # 8-12 karakterlik benzersiz kimlik (harf + rakam).
lang: tr                # İçerik dili; varsayılan Türkçe.
title: "Başlığın Kendisi"
slug: seo-uyumlu-url
category: kategori-adi  # Örn: yasam-ogrenme, teknik-notlar.
type: guide             # Örn: guide, technical, opinion.
tags:
  - kelime-1
  - kelime-2
readingTime: 10         # Dakika cinsinden tahmini okuma süresi.
date: 2025-01-15        # Yayın tarihi (YYYY-MM-DD).
updated: 2025-01-15     # Son güncelleme tarihi.
pair: en-post-slug      # Dil eşleştirmesi yoksa kaldır.
canonical: ~/slug/
alternate: ~/en/paired-slug/
description: 150 karakteri geçmeyen özet.
keywords:
  - birincil anahtar kelime
  - ikincil anahtar kelime
featured: false         # Anasayfada öne çıkacaksa true.
draft: false            # Yayınlanmaya hazır değilse true.
cover: ~/assets/images/cover.webp        # Kapak yoksa alanı kaldır.
coverAlt: Kapak görseli için alternatif metin.
coverCaption: Kısa açıklama veya kaynak bilgisi.
template: post
layout: default
status: published       # Taslak aşamasında "draft" ile eşleşecek şekilde update et.
---
```

## İçerik İskeleti

```md
# Başlık (H1 ile front matter başlığı birebir veya çok yakın olsun)

> 1-2 cümlelik özet paragraf veya önemli not (opsiyonel).

## Problem / Arka Plan
- Neden bu yazı var? Hangi ihtiyaca cevap veriyor?

## Çözüm / Yaklaşım
- Temel yöntemleri, adımları veya bakış açısını anlat.
- Gerekirse kod blokları, listeler, tablolar ekle.

## Detaylı Bölümler
### Alt Başlık
- Uzun anlatımlar için alt başlıklar kullan.

### Görsel / Diyagram (Opsiyonel)
```mermaid
%% Diyagram gerekiyorsa bu blok içinde tut.
```

## Sonuç / CTA
- Yazıyı toparla, varsa aksiyon çağrısı ekle.
- İlgili kaynaklar veya başka yazılara bağlantı ver.
```

Bu şablon, tag/okuma süresi/tarih/cover/category/type gibi kritik alanların hiçbirini atlamadan yeni gönderiler oluşturmanı sağlar. Gerekli olmayan front matter satırlarını (örneğin `cover`, `pair`, `alternate`) tamamen silebilirsin; boş bırakma.
