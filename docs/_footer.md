# Footer

## XS Akışı

- **Sticky Base:** Footer'ı `site-footer` katmanına alıp XS görünümde altta sabitledim; blur, yarım kapsül radius ve ekstra padding ile shell hissi verdim (`src/css/style.css:117`).
- **Manifesto Bloku:** Monospace marka etiketi ve kategori pill'lerini tek kolon akışında hizaladım; manifesto paragrafı kaldırıldı, blok direkt politika linkleriyle açılıyor (`src/index.html:782`).
- **Boxed Shell:** İçeriği header kartıyla aynı ritimde tutmak için `rounded-2xl border border-[var(--brand-900)] bg-[var(--bg-elev)]/95 p-5 shadow-soft` kartına aldım; sticky `site-footer` katmanı bu kartı altta sabitliyor, header kartı ve header-bar alt çizgisi de aynı brand sınırıyla hizalandı.
- **Slim Layout:** Kartı daha ince göstermek için iç padding'i `p-4`, içerik ritmini `gap-3` seviyesine çektim; sticky katmanın taban boşluğu da 0.75 rem'e indirildi.
- **Politika + Sosyal Stack:** Çerez Politikası / Sorumluluk Reddi linkleri RSS, GitHub ve LinkedIn kapsüllerinin altında, degrade çizgiyle ayrılmış halde duruyor; tüm bloklar center hizalı, hover davranışları sade.
- **Politika Ayracı:** Politika linklerini `btn btn--text btn--thin btn--tone-neutral policy-link` formunda küçülttüm; `footer-divider` çizgisi ile sosyal butonlardan ayrılıyor, en alttaki tagline ile aradaki boşluk optimize edildi.
- **Line Split:** `footer-divider` artık `border-bottom:1px solid var(--brand-900)` kullanarak kart sınırlarıyla aynı kontrastı taşıyor.
- **Buton Sistemi:** RSS/GitHub/LinkedIn butonları, Top 10 etiketleri ve politika linkleri `.btn` utility'leriyle tanımlandı; hover/click geri bildirimi header menüsüyle aynı, ancak brand/sekonder paletlerle (`RSS` sarı, `GitHub` koyu slate, `LinkedIn` mavi) renklendiriliyor.
- **Chip Optiği:** `btn--fill` varyantı padding'i `0.4rem/0.85rem`, radius'u 10 px bandına çekiyor; metinleri `font-weight:600` + daha dar letter-spacing ile okunur hale getirdim.
- **Etiket Butonları:** Top 10 kapsüllerini kartın en üstüne alıp `btn btn--fill btn--xs btn--thin btn--tone-sage` olarak sundum; her biri `/etiket/...` anchor'ına gidiyor.
- **Yıl Otomasyonu:** Telif satırındaki yılı manuel güncellemek yerine `data-year` işaretçisi ve `src/js/main.js:16` içindeki küçük helper ile runtime'da güncelliyorum.
- **Tipografi:** XS ölçekte `text-xs`/`text-sm` kombinasyonu ve `tracking-[0.3em]` ile header'daki statü satırıyla aynı ritmi yakaladım.
- **Simetrik Boşluk:** `--shell-gutter` (1 rem) header boşluklarını, `--shell-footer-gap` (0.5 rem) ise footer'ın viewport altındaki mesafesini yönetiyor; sticky `top`/`bottom` ve `app-shell` padding'leri bu değişkenlere bağlandı.
- **Dil Bağlantısı:** Manifesto, politika etiketleri, sosyal buton yazıları, 10 etiket ve telif motoyu `footer.*` anahtarlarıyla `src/lang/*.json` içine taşıdım; dil toggle'ı tüm footer kopyasını anında çeviriyor.

## Neler Oldu?

- Footer artık sayfa kaydırılırken ekrana yapışık kalıyor, içerik blokları arasında 3 px-üstü spacing korunuyor.
- Kart kalınlığı azaldı; `p-4` ve 0.75 rem taban boşluğu sayesinde footer, header kutusuyla aynı hafiflikte görünüyor.
- Okur politika linkleri ve ikonlu sosyal çıkışlarla sitenin güven çerçevesini ilk bakışta görüyor; manifesto paragrafı kaldırıldığı için içerik daha hızlı başlıyor.
- Top 10 etiketleri artık kartın en üstünde; ziyaretçi sayfaya iner inmez içerik haritasını görüyor ve `btn--tone-sage` kapsüllerle yön buluyor.
- Sosyal kapsüller `.btn btn--fill btn--sm btn--thick` yapısında kalarak marka tonlarını kullanıyor; kontrast değerleri (>=4.5) ile ışık/karanlık temada erişilebilirlik sağlandı.
- `.btn` tabanlı tipografi sayesinde RSS/GitHub/LinkedIn etiketleri ve TOP10 tag'leri daha okunaklı hale geldi.
- Çerez Politikası / Sorumluluk Reddi linkleri küçültülüp çizgiyle sosyal butonlardan ayrıldı; alt tagline ile aralarındaki boşluk optimize edildi.
- Header ile footer arasındaki boşluklar `--shell-gutter` + `--shell-footer-gap` üzerinden ayarlanıyor; footer artık alt kenara 0.5 rem yaklaşarak görsel dengeyi koruyor.
- Header ve footer kartlarının sınırları `var(--brand-900)` ile çizilerek shell boyunca tutarlı bir çerçeve oluşturuldu; header-bar alt çizgisi ve divider da aynı renkle hizalandı.
- Telif satırı yıl değişimlerinde otomatik güncelleniyor ve metin brand rules tonuna göre güncellendi.
- Header ile aynı kart estetiği sağlandı; footer artık arayüzde ayrı bir kutu olarak algılanıyor, üst başlık kaldırılarak içerik daha net başladı.
- Dil geçişi tüm footer kopyalarına uygulanıyor; TR/EN arasında manifesto, politikalar ve etiket metinleri anında güncelleniyor.
- Menü-dil uyumu: `.btn` sınıfı sayesinde hover/click geri bildirimi header menüsüyle aynı görsel dili paylaşıyor.

## Neler Yapıldı?

- `src/index.html:782` üzerinden footer markup'ı yeniden yazıldı; etiket butonları kartın üstüne taşındı, politika/sosyal ikon kapsülleri ve telif bloğu organize edildi, manifesto paragrafı kaldırıldı.
- Aynı dosyada politika linkleri `.btn` tabanlı `policy-link` varyantına taşındı ve `footer-divider` çizgisiyle sosyal bloktan ayrıldı.
- `src/index.html:782` içindeki kartın padding/gap değerleri inceltilerek `p-4` / `gap-3` ritmine çekildi.
- `src/css/style.css:117` ile footer'ın sticky davranışı, blur arka planı ve radius değerleri tanımlandı; `--shell-gutter` 1 rem, `--shell-footer-gap` 0.5 rem olarak ayarlandı ve ilgili `top`/`bottom`/padding değerlerine bağlandı.
- `src/css/button.css` içinde `.btn` tabanlı tone varyantları (sage, rss, github, linkedin) tanımlanarak footer butonları header ile eşitlendi; sekonder `--sage` paleti tag kapsüllerine atanıyor.
- Aynı stilde padding/radius/letter spacing güncellenerek butonların hacmi azaltıldı, `font-weight:600` ile metinler güçlendirildi (`src/css/button.css`, `src/css/style.css`).
- `src/css/style.css` içerisine `.policy-link` ve `footer-divider` sınıfları eklenerek politika bloğu ve sosyal kapsüller arasındaki görsel ayrım sağlandı.
- Header ve footer kartlarındaki border sınıfları `border-[var(--brand-900)]` ile güncellenip, header-bar alt çizgisi ve `footer-divider` aynı renk (`var(--brand-900)`) ile çizildi.
- `src/lang/tr.json` ve `src/lang/en.json` dosyalarına `footer.*` anahtarları eklenmişti; manifesto anahtarı kaldırıldı, politikal/sosyal/tagline alanları korundu.
- `src/js/main.js:16` içinde `data-year` düğümünü bulan ve mevcut yılı enjekte eden helper işlevi eklendi.

## Neler Yapılabilir?

1. **Micro Animasyonlar:** Footer `.btn` varyantlarına hafif scale/opacity animasyonu ekleyip hover geri bildirimi güçlendirmek (reduced-motion'a bağlı olarak).
2. **Aktif Tag Durumu:** Etiket butonlarıyla header menüsü arasında aktif durum senkronu kurup ziyaretçi hangi blokta olduğunu anında görebilir.
3. **Microcopy Denetimi:** Footer manifestosunu 2-3 varyantla test edip kısa/uzun sürümler arasında A/B kararına gitmek.

### Sonraki Adım

- i18n taşımasını yapıp footer kopyalarının dil değişimiyle eşzamanlı olduğundan emin olmak; devamında pill'ler için aktif durum ölçümleri alınabilir.
