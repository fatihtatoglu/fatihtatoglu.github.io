# Header

## XS Akışı

- **Kontroller:** Tema (Light/Dark/System) ve dil (Türkçe/English) seçenekleri `.btn` tabanlı ikon butonlarıyla tanımlandı; arama alanı ve menü linkleri aynı utility katmanına bağlandı. Tema/dil tercihleri birinci taraf çerezleriyle kalıcılaştırıldı (`src/index.html`, `src/css/button.css`, `src/js/main.js`).
- **Sticky Shell:** Header`ı `site-header` olarak üstte, footer`ı `site-footer` olarak altta sabitleyip blur arka plan ve ekstra padding verdim; davranış `npm run build` ile doğrulandı.
- **Toggle Yenilemesi:** Tema seçimi tek butonlu üç durumlu kaydırıcıya, dil seçimi bayrak ikonlu toggleda toplandı. Yeni görünüm CSS/JS tarafında desteklendi; hover/focus sadeleştirildi.
- **Header Bar Refresh:** Markayı solda, tema/dil/menü butonlarını sağda tutan XS bar tasarlandı. Tüm kontroller `.btn btn--icon btn--md` varyantlarını kullanıyor; dil bayrakları border/box-shadow olmadan kapsülün içinde yüzüyor, güneş/ay ikonları 26 px. Menü kartı açılıp kapanıyor (`Escape` aramaya odaklıyor), linkler seçili durumu kaydediyor ve i18n altyapısı header metinlerini güncelliyor.
- **Çekmece Menü:** Drawer içi linkler `btn btn--fill btn--thick btn--tone-neutral menu-link` olarak hizalandı; aktif durumda brand rengini, hover’da hafif brand-50 arkaplanını kullanıyor. Focus hallerinde `box-shadow` ile belirginleşiyor.
- **Blur Overlay:** Menü açıldığında `menu-overlay` katmanı devreye girip tüm viewport'u blur + karartma ile kaplıyor; overlay'e tıklamak menüyü kapatarak drawer'ı öne çıkarıyor.

## Neler Oldu?

- Tema/dil butonları tek tuşla döngüsel çalışıyor; çerez tabanlı kalıcılık sağlandı.
- Menü butonu gizli çekmece açıyor, arama alanına odaklanıyor, `Escape` ve dış tıklamada kapanıyor.
- Menü linkleri aktif durumda kalıyor, hover/odak stilleri ayrıştırıldı.
- TR/EN JSON çevirileri (`src/lang/`) header metinlerine uygulandı, site adı linke dönüştürüldü.
- Görsel dil: minimalist güneş/ay/monitor SVG’leri, 26 px ikon boyutu, çerçevesiz bayrak kapsülleri ve `.btn` tabanlı menü/link kartları aynı ritimde çalışıyor.

## Neler Yapıldı?

- Tüm header davranışları `src/index.html`, `src/css/style.css`, `src/css/button.css`, `src/js/main.js` dosyalarında güncellendi.
- Build süreci `src/lang/` dosyalarını `dist/lang` içine kopyalayacak şekilde genişletildi.
- `_header.md` ve `project.md` logları sadeleştirildi; XS header detayları bu dosyada toplandı.

## Neler Yapılabilir?

1. **XS Gövde İçerikleri:** Header’daki linklerin yöneldiği blokları (teknik notlar, hayat & öğrenme, vb.) XS görünümü için tasarlamak.
2. **Menü Animasyonu:** Drawer açılışı için hafif bir geçiş/blur efekti eklemek, arka plan kliklerini daha görünür kılmak.
3. **Genişletilmiş i18n:** XS gövde ve footer kopyalarını da TR/EN JSON dosyalarına taşıyıp dil değişiminin tüm sayfada hissedilmesini sağlamak.

### Sonraki Adım

- XS gövde bloklarını inşa ederken bu header barını referans alıp menü etkileşimlerini genişletmek.
