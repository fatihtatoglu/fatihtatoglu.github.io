# Project Log

## 2024-11-10 — XS Layout Skeleton

- Kurallara uygun renk/token sistemi ile XS başlık ve altlık iskeletini `src/index.html` içinde hazırladım; dil ve tema düğmeleri birinci taraf çerezleriyle kalıcı.
- Tailwind 4 tabanlı `src/css/style.css` dosyasında font importları, marka değişkenleri, erişilebilir kısayol ve kontrol butonu stillerini tanımladım.
- `src/js/main.js` ile tema/dil tercihlerini uygulayan küçük yardımcılar ve yıl göstergesi eklendi; `npm run build` ile çıktı doğrulandı.

### Sonraki Adım

- XS gövde bileşenlerini (içindekiler, öne çıkan yazı vb.) tasarlayıp ardından daha geniş kırılımlara geçmek.

> XS header çalışmalarının ayrıntıları artık `docs/_header.md` dosyasında tutuluyor.

## 2025-01-XX — SSG Planı

1. **Default Layout Soyutlaması**
   - `index.html`deki header/content/footer bloklarını parçalı Mustache layout’una taşı.
   - Content slot’unu post/policy/page/contact/category/label tiplerinin ortak alanlarını taşıyabilecek esneklikte tanımla.

2. **İçerik Şeması & Kaynak Dizini**
   - `content/{tr,en}/{posts,pages,...}` gibi dil bazlı klasör yapısı kur.
   - Front matter şeması: `title`, `slug`, `type`, `date`, `tags`, `summary`, `hero`, `og`, `seo` alanlarını zorunlu/opsiyonel olarak belirle.

3. **SSG Boru Hattı**
   - Markdown → HTML dönüşümü için parser seç (örn. Remark); TR/EN dosyaları destekle.
   - Mustache render katmanı: Front matter + global config + layout birleşip `/dist/{lang}/...` üretmeli.
   - Çoklu dil içeriklerini `locales/{lang}.json` üzerinden bileşen metinlerine enjekte et.

4. **Sayfa Tipleri & Rotalar**
   - Post/policy/page/contact/category/label için URL şablonları belirle.
   - Kategori/etiket liste sayfaları ve gerekiyorsa pagination davranışını tanımla.

5. **Meta Çıktılar**
   - RSS: TR ve EN için ayrı feed dosyaları.
   - Sitemap: hreflang içeren çok dilli URL listesi.
   - robots.txt: build sırasında domain/config’e göre üret.
   - SEO/Open Graph partial’ı: front matter’dan head meta paketini türet.

6. **Build & Watch Komutları**
   - `npm run build`: SSG, CSS/JS paketleme ve asset kopyalama adımlarını sıralı çalıştırmalı.
   - `npm run dev`: Markdown değişimini izleyip incremental rebuild sağlasın.
