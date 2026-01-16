---
id: s3dqhqcbtx
lang: tr
title: NVIDIA Jetson Orin Nano Kurulumu (JetPack, SD Kart & Sorunlar)
slug: nvidia-jetson-orin-nano-kurulumu
category: teknik-notlar
type: guide
tags:
  - nvidia-jetson
  - jetson-orin-nano
  - jetpack
  - embedded-ai
  - linux-arm
  - sdk-manager
  - micro-sd
  - nvme
readingTime: 17
date: 2026-01-14
updated: 2026-01-15
pair: nvidia-jetson-orin-nano-setup
canonical: ~/nvidia-jetson-orin-nano-kurulumu/
alternate: ~/en/nvidia-jetson-orin-nano-setup/
description: "Jetson Orin Nano kurulumu: JetPack 5.13-6.2, SD kart ve SDK Manager adımları, yaşanan sorunlar ve pratik çözümler."
keywords:
  - nvidia jetson orin nano kurulumu
  - jetpack kurulumu
  - embedded ai
  - linux arm
  - jetson setup
  - jetson orin nano setup
featured: true
cover: /assets/images/jetson-orin-nano-super-developer-kit.webp
coverAlt: NVIDIA Jetson Orin Nano Super Developer Kit
coverCaption: Jetson Orin Nano ile gömülü yapay zekâ denemeleri için ilk adım.
template: post
layout: default
status: published
---
# NVIDIA Jetson Orin Nano Kurulumu (JetPack, SD Kart & Sorunlar)

**Bu kılavuz kimler için?**

Bu kılavuz, Jetson Orin Nano'yu güvenilir bir şekilde kurmak ve yaygın hatalardan kaçınmak isteyen geliştiriciler, üreticiler ve yapay zeka meraklıları içindir. İdealize edilmiş dokümantasyon yerine pratik, deneyime dayalı çözümleri tercih ediyorsanız, bu kılavuz tam size göre.

Yapay zekâ alanında kendimi hâlâ öğrenme yolculuğunda görüyorum. Bu alanda kendimi geliştirmek ve imkânlarım dâhilinde katkı sunabilmek için elimden geleni yapıyorum. Hatta bununla ilgili olarak [Yapay Zekâ ile Uğraşmak: Bireysel Olarak Ne Yapabilirim?](https://tatoglu.net/yapay-zeka-ile-ugrasmak-bireysel-olarak-ne-yapabilirim/) yazımda biraz yüzeysel olarak da bahsetmiştim.

Bu yazımda yapay zekâ denemelerimde bana destek olacak olan bir cihazın kurulumunu anlatacağım.

## NVIDIA Jetson Orin Nano Nedir?

Yapay zekâ denildiğinde artık ilk aklımıza NVIDIA geliyor. Jetson Orin Nano da NVIDIA’nın bu alandaki ürünlerinden biri olarak konumlanıyor. Cihazın geliştirme amacı bireysel ve sanayiye hazır projelerde kullanılacak, yapay zekâ kasları güçlü olan bir gömülü bilgisayar platformu. İçerisinde bulunan CUDA ve Tensor çekirdekleri sayesinde çoğu laptop veya masaüstü bilgisayardan bile daha güçlü bir yapay zekâ hesaplama desteği sunuyor. Bunun yanında düşük enerji tüketimi ve küçük boyutu, yapay zekâ projelerine başlangıç için biçilmez bir kaftan olmasını sağlıyor.

![NVIDIA Jetson Orin Nano Super Development Kit](/assets/images/jetson-orin-nano-super-developer-kit.webp)

| Birim Adı | Özellikleri                                                             |
|----------:|:-----------------------------------------------------------------------:|
| GPU       | 1024 CUDA Çekirdeği                                                     |
| TPU       | 32 Tensor Çekirdeği                                                     |
| CPU       | 6 Çekirdekli ARM Cortex-A78AE 64Bit 1.5MB L2 + 4MB L3                   |
| Bellek    | 8GB 128Bit LPDDR5 102GB/s                                               |
| Depolama  | microSD kart yuvası ve iki harici NVMe desteği (Type 2230 ve Type 2280) |
| Güç       | 7W-25W                                                                  |
| Network   | 802.11ac/abgn Kablosuz Ağ Arayüzü Denetleyicisi                         |

Yukarıda önemli gördüğüm özelliklerini yazdığım cihazı ben 2025 Eylül ayında aldım. Ancak yeni zaman bulabildim ve başarılı kurulumun ardından hemen yazısını yazayım dedim.

Merak edenler için, cihazı NVIDIA Gömülü sistemlerinin Türkiye Distribütörü [OpenZeka](https://openzeka.com/urun/NVIDIA-jetson-orin-nano-developer-kit/)'dan aldım. Bugün itibariyle fiyatlara baktığımda benim aldığım ile arasında çok büyük bir fark göremedim. Yani neredeyse aynı fiyata şu anda satıyorlar. Ben alırken geliştirme setini ve yanında bir SSD disk ile aldım. Eğer alacaksanız güncel fiyatlar ve stok durumu için kontrol etmeyi unutmayın.

## Kurulum Ön Hazırlık

Kurulum yaparken bazı teknik bilgilere ve bazı donanımlara ihtiyacınız olacaktır. Bunların en önemlileri 100MB/s yazma hızında veya daha hızlı en az 64GB boyutunda olan bir microSD kart, DP 1.2 desteği olan bir ekran ve kablolu klavye. Bunlar olduktan sonra cihazı kuramama şansınız yok. Nereden mi biliyorum? Denedim ve sadece bunlarla kurabildiğim için.

Bunların yanında, internette yer alan kaynakları okuduğum için ek olarak; HDMI kablo, veri aktarabileceğim bir USB-A to USB-C kablo, yukarıdaki microSD karttan bir tane daha ve kablolu mouse da aldım. Ama sonuç olarak sadece yukarıda yazdığım 3 cihaz ile kurulumu tamamladım.

## Jetson Orin Nano Kurulumu (SD Kart Yöntemi)

Yazının uzun olacağını düşünerek öncelikle herkesin işine yarayacak olan bilgiyi baştan vereyim dedim. Sonrasında başımdan geçenleri de aktaracağım.

Öncelikle elinizde hangi işletim sisteminin yüklü olduğu önemli olmayan bir bilgisayar lazım. Bu bilgisayara; [SD Memory Card Formatter](https://www.sdcard.org/downloads/formatter/) ve [balenaEtcher](https://etcher.balena.io/) uygulamalarını indirip, kuruyoruz. Bu uygulamalar cihaza takacağımız microSD kartın içine uygun işletim sistemini aktarmamızı sağlayacaklar.

Sonrasında cihaza uygun JetPack sürümünü indiriyoruz. JetPack, NVIDIA'nın Ubuntu üzerine geliştirdiği ve içerisinde NVIDIA SDK ve sürücüleri olan özel bir dağıtım paketi olarak düşünebilirsiniz. İçerisinde cihazın çalışması için gereken donanım yazılımları da bulunuyor. Bu yüzden cihazınızın hangi versiyonda olduğunu bilmek önemli olacaktır.

Küçük bir ipucu olarak, eğer 2025 Ocak ayından sonra üretilmiş bir cihazınız varsa tahminen [JetPack 6.2](https://developer.NVIDIA.com/downloads/embedded/l4t/r36_release_v4.3/jp62-orin-nano-sd-card-image.zip) işinizi görecektir. Ama daha eski bir cihaz aldıysanız bu sefer [JetPack 5.13](https://developer.NVIDIA.com/downloads/embedded/l4t/r35_release_v5.0/jp513-orin-nano-sd-card-image.zip) ile yüklemeyi yapıp sonrasında 6.2'ye yükseltme yapmanız gerekecektir. Aksi durumda 25W olan gücü kullanamıyor olacaksınız cihaz üzerinde.

> **Ayırıcı Not:** Benim ortamım Windows 10 ve makinem üzerinde Hyper-V ile bir sürü sanal makine çalıştırıyorum.

İlk adımda SD Memory Card Formatter ile paketinden çıkarttığım microSD kartı formatladım. Sonrasında JetPack 6.2 için indirdiğim imajı balenaEtcher ile karta aktardım.

Sonraki adımda, Jetson Orin Nano'yu kutusundan çıkarttım. Türkiye için uygun olan güç kablosunu, kablolu klavyeyi ve DP 1.2 desteği olan ekranı bağladım.

İlk açılışta kocaman bir NVIDIA logosu beni karşıladı ve sonrasında klasik Linux yazıları akmaya başladı ve Ubuntu'nun yükleme sihirbazı karşıma çıktı. Gerekli bilgileri girdikten sonra kurulum tamamlandı.

Yazarken çok hızlı ilerledim ve sanki on dakikada bitmiş gibi hissettirdi, değil mi? Aslında bu kurulum noktasına gelmem dört günümü aldı. Dördüncü günün akşamında kurulumu tamamladım. Kullanıma hazır hale gelen cihazı fişe taktım ve ilerleyen yazılarda anlatacağım bir deneyi çalıştırmaya bıraktım.

## Kurulumda Karşılaşılan Sorunlar

Eğer ihtiyacınız cihazı kurmak ve kullanmak ise yukarıdaki kısım ihtiyacınızı karşılayacaktır. Ama zorlukları dinlemek isterseniz buyurun başlıyoruz.

Bir cihazı kurmadan önce genellikle YouTube, Medium gibi kaynaklarda kurulum ile ilgili içerik olup olmadığına bakıyorum. Çünkü hızlı ilerlemek için bazı tecrübelerin sadece sonuçlarını okumak yeterli oluyordu. Ama bu sefer öyle olmadı.

İzlediğim videolarda ve NVIDIA rehberlerinde iki kurulum yönteminden bahsediliyor. Bunlardan biri microSD kurulumu, diğeri de SDK Manager kurulumu. Bunların ikisinin de ayrı ayrı artı ve eksileri var ama işinize yarayacak hangisi ise onu kullanmanızı öneririm. Ama kısa özet olarak;

- SDK Manager kurulumu Windows + WSL + Hyper-V kombinasyonunda ciddi sorunlar çıkarabiliyor.
- Ubuntu Live ortamında disk alanı yetersiz kalabiliyor.
- En stabil yöntem, harici ekran ve klavye ile SD kart üzerinden kurulum oldu.

şeklinde maddeler haline getirebilirim.

| Kriter                | SDK Manager | SD Kart     |
|----------------------:|:-----------:|:-----------:|
| Ek ekran gereksinimi  | Hayır       | Evet        |
| Windows uyumu         | Sorunlu     | Sorunsuz    |
| İlk kurulum zorluğu   | Yüksek      | Düşük       |
| Tavsiye edilen yöntem | Ha          | Evet        |

**Kısa karar:** Elinizde ekran ve klavye varsa SD kart yöntemiyle ilerleyin.

### SDK Manager ile Jetson Orin Nano Kurulumu

İlk denemelerimi yaparken ek bir ekranım ve kablolu bir klavyem yoktu. Hatta veri aktarımı yapacağım USB kablom da yoktu ancak telefonum için kullandığım şarj kablosunun veri aktarabildiğini hatırlayınca direkt SDK Manager üzerinden (ek fiziksel donanım gerektirmeden) kurulum yapmayı denemek istedim.

SDK Manager NVIDIA'nın sağladığı ve NVIDIA Developer Platformu hesabınız ile giriş yaptığınız bir yazılım. Bu yazılım ile cihazınıza harici olarak bağlanıp donanım yazılımlarını ve gerekecek SDK yüklemelerini yapabiliyorsunuz.

Yükleme yapmak için 4 adımlı bir sihirbaz sizi karşılıyor.

İlk adımda, cihazı ve ek paketleri seçiyorsunuz. Bunun yanında cihaza uygun olacak JetPack sürümünü seçiyorsunuz.

İkinci adımda, zorunlu, önerilen ve ihtiyaç halinde yüklenmesi gereken paketleri seçiyorsunuz ve bunların yükleneceği dosya yolunu seçiyorsunuz.

Üçüncü adımda, seçilen paketler indiriyor ve cihaza aktarılmak için hazırlanıyor. Bu noktada cihazı Kurtarma (Recovery) moduna alarak Flash denen yükleme işlemine başlıyorsunuz. Eğer sorun çıkmazsa işlem 20-25 dakika sonunda tamamlanıyor ve hayırlı olsun adımına geçiyorsunuz.

#### Başımdan Geçenler

SDK Manager ile yükleme yapmak bana çok mantıklı geldi. Özellikle ekranım ve ek klavyem olmayınca ek masraf olmadan halledeceğimi düşündüm. Dokümanlara bakınca çok göremedim ama forumlarda SDK Manager ile yükleme yaparken özellikle Windows kullanıcılarının çoğunlukla başarısız olduklarını gözlemledim. Ama bir şekilde herkes sorusunun sonunda çözüldüğünü de söylemiş ama nasıl kısmını yazmamışlar.

![Jetson Orin Nano Pins](/assets/images/jetson-orin-nano-pins.webp)
İlk karşılaştığım zorluk cihazın Kurtarma (Recovery) moduna geçmesi için yapılması gereken kısa devre ile ilgili. Cihazın portlarını ters tarafta tuttuğunuzda, soğutma fanının altında gizlenmiş 12 tane pin var. Kurtarma moduna geçmesi için yukarıdaki görselde görünen `FC REC` ve hemen yanındaki `GND` pinlerinin kısa devre yapılması gerekiyor.

Evde ve bilgisayar parçalarım arasında jumper ararken PIC programlama kitlerimin birinde bir demet erkek dişi atlama kablosu buldum. Bundan bir jumper yapabilirim herhâlde diye düşünerek devam ettim.

Sorun çözüldü diye düşünürken, WSL yüklenmesi gerektiğini söyledi SDK Manager. Ben makinemde Hyper-V ile sanallaştırma yaptığım için WSL kısmına hiç girmemiştim. Ama bu cihaz için daldık içeri.

```powershell
wsl --install
```

Yukarıdaki komut ile kurulumu yaptım ve restart ettikten sonra makineyi tekrar denedim. Bu sefer de APX driver diye bir uyarı çıktı başıma. SDK Manager yükleme işlemini yaparken, WSL üzerinden cihaza bağlanmaya çalışıyor ve bunun için VirtualBox USB Driverlarını kullanıyor. Ancak WSL direkt bu USB driver'ını kullanamadığı için araya bir APX driverı gerekiyormuş. Onu da bir şekilde kurdum ve tekrar denedim. Bu sefer VirtualBox USB Driverı HyperV ile çakıştı.

Makinemdeki sanal makine sistemini bozamayacağım için kullanmadığım bir Windows 10 makine üzerine gereken bütün adımları tekrarlayarak ilerlemeyi seçtim. Tabi makine eski ve güncellemeleri de yapılmadığı için onları tamamlamamı istedi SDK Manager. Onları da tamamladıktan sonra tekrar dedim. Ama yine olmadı.

Sebebine bakarken NVIDIA rehberlerinde önerilen SDK Manager ortamının Ubuntu üzerinde olması gerektiğini gördüm. Bunun üzerine bir fikir ile live cd üzerinden belki kurulumu yaparım diye düşündüm.

[Rufus](https://rufus.ie/) kullanarak, Ubuntu 22.04 Desktop imajını ayrı bir USB bellek üzerine aktardım ve boot edip makinemde açtım. Makinemin RAM'i yeterli olacak düşüncesiyle SDK Manager'ı kurdum ve indirmeye başladım. Cihazı Kurtarma (Recovery) modunda bağladım ve aktarma işlemini başlattım. Ancak belli bir süre sonra cihazın hafızası yetmedi ve yetersiz disk uyarısı alarak hata verdi aktarım.

Ubuntu Live CD, makinemin RAM'ini yarı yarıya bölüşerek gereken alanın tamamını doldurmuş ve beklediğim gibi bir yükleme yapamamış oldum.

Bunun üzerine diğer Windows 10 makineyi formatlayıp Ubuntu kurmayı düşünürken, diğer yöntemi de bir denemenin faydalı olabileceğini düşündüm.

### SD Kart ile Jetson Orin Nano Kurulumu

NVIDIA rehberlerine bakarken aslında bu yöntem ile ilerlemem gerektiğini gördüm. Ancak harici ekran, kablolu klavye ve mouse almak da hiç içimden gelmedi. Ancak başka bir yol olmadığını anlayınca bu adım ile devam ettim.

Bu adım için en basitinden gerecek olanlar, bir kablolu klavye ve bir DP 1.2 desteği olan ekran. Eğer HDMI destekli bir ekranınız varsa bir tane dönüştürücü almanız da sizi kurtarabilir bu adımda.

Gerekenleri sağladıktan sonra SD Memory Card Formatter ile microSD kartı formatlayıp, sonrasında balenaEtcher ile uygun JetPack imajını aktarmanız yeterli olacaktır. Ama bana yine yetmedi.

#### Yine Olmadı

Öncelikle gittim bir tane ekran aldım. Ufak bir şey olsun dedim fiyatı uygun olunca 24" bir ekran aldım. Yine sadece ihtiyaçtan en basitinden bir Türkçe Q klavye aldım kablolu. Ama mouse almadım.

Ekranı alırken HDMI var mı diye satıcıya çok sordum. Çünkü cihazda HDMI olduğunu sanıyordum. Meğer DP 1.2 portu varmış. Şansıma eve gelip ekranı açınca DP 1.2 girişi olduğunu gördüm ve bir de kablosu olduğunu görünce çok rahatladım.

Sonra internetteki yazılara bakarak JetPack 5.13 sürümünü ve JetPack 6.2 sürümünü ayrı ayrı microSD kartlara aktardım. Amacım 5.13 ile kurulum yapıp sonrasında 6.2 ile de güncelleme yapmaktı.

JetPack 5.13 kartını taktık ekran geldi ama hemen sonrasında siyah ekranda kaldı. Bir süre bekledim ama yine olmadı. Cihazın gücünü çektim tekrar açtım. Yine denedim, yine olmadı. Üç denemeden sonra JetPack 6.2 ile deneme yapmaya karar verdim. Ama sonuç yine aynı oldu.

Sonra Jetson Orin Nano'ya NVMe bağladığımı hatırladım ve boot sırasında sorun olabileceğini düşündüm. JetPack 5.13 ile tekrar boot ettim bu sefer BIOS'a geçtim. Derinliklerde bir yerde (Boot Maintenance Manager > Boot Options > Change Boot Order) aradığımı buldum.

![Jetson Orin Nano BIOS Boot Sırası Değiştirme](/assets/images/jetson-orin-nano-bios-change-boot-order.webp)

Yükleme sırasını güncelledikten sonra JetPack 5.13 ile deneme yaptım. Daha önceki tecrübelerimden oluşan düşünce şöyle; eski versiyon da olsa desteği vardır. Ama yokmuş. Boot ekranına tekrar geldim belki bir ayar vardır diye.

![Jetson Orin Nano BIOS Anasayfası](/assets/images/jetson-orin-nano-bios-home.webp)

Ama ekranın üstündeki `36.4.3-...` kısmını görünce aklıma JetPack versiyonu geldi ve direkt JetPack 6.2 olan microSD kartı taktım ve çalıştırdım.

## Kurulum Sonrası

Dört günün sonunda kurulumu bitirdikten sonra, ilk işim ekran ve kablolu klavye bağımlılığından cihazı kurtarmak oldu.

Her Ubuntu bazlı yükleme sonrasında yaptığım gibi öncelikle versiyon kontrolü yaptım.

```bash
lsb_release -a
uname -r
```

Bu komutlardan

```bash
fatihtatoglu@tat-jetson:~$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 22.04.5 LTS
Release:        22.04
Codename:       jammy
fatihtatoglu@tat-jetson:~$
fatihtatoglu@tat-jetson:~$
fatihtatoglu@tat-jetson:~$ uname -r
5.15.148-tegra
fatihtatoglu@tat-jetson:~$
```

gibi bir çıktı alacaksınız.

Sonrasında güncellemeleri yapmaya başladım.

```bash
sudo apt update && sudo apt upgrade -y && sudo reboot
```

Sonra hazırda yüklenmiş olan ve kullanmayı düşünmeyeceğim uygulamaları sildim. Oyunlar, Libre Office, gEdit, vb. Bunlar yerine SSH Sunucusu kurulumunu yaptım.

```bash
sudo apt install -y openssh-server
sudo systemctl enable ssh
sudo systemctl start ssh
systemctl status ssh
```

Dışarıdan erişeceğim için `ip a` komutuyla makinenin IP adresini aldım ve bunu hazır ekran varken statik hale getirdim ve ilk SSH denemesini yaptım.

Ubuntu eğer Desktop sürümüyse ilk açılışı hep arayüz ile yapar bu da biraz zaman kaybettirecektir bana. Bu yüzden bunu da kapatmak için aşağıdaki komutu çalıştırdım.

```bash
sudo systemctl set-default multi-user.target
```

Şu noktaya kadar artık cihazım direkt SSH ile dışarıdan da erişilebilir hale gelmiş oldu. Ama birkaç yükleme ve ayar daha yapıyor olacağım.

### Python Yüklemeleri

İlerleyen yazılarda göreceğiniz gibi Python ile bazı geliştirmeler Jetson Orin Nano üzerinde çalışıyor olacak. Bunun için bazı gerekli kütüphaneleri şimdiden kurmak istedim.

```bash
sudo apt install -y build-essential cmake git curl wget htop tmux pkg-config python3-dev python3-venv python3-pip
```

Daha Yapay zekâ ile ilgili kütüphaneleri kurmadım ama çok yakında onları da ilgili yazılar da göreceksiniz.

### Swap Ayarlaması

Jetson Orin Nano her ne kadar güçlü bir cihaz olsa da bellek miktarı sınırlı. Özellikle derleme süreçleri, model indirme veya LLM çalıştırma gibi yük altında kalan işlemlerde swap alanı olmadan sistem kararsız hale gelebiliyor. Bunun için öncelikle NVMe diskini ayarlıyor olacağım ve onun üzerinde 16GB'lık bir Swap tanımı yapacağım.

İlk olarak hazır ekran varken, `Disks` üzerinden NVMe diskini formatladım ve partition oluşturmasını yaptım. Sonrasında `lsblk -f` komutundan partition için atanmış id değerini aldım ve `/etc/fstab` içine ekledim.

```ini
UUID=abcd-1234-efgh-5678  /mnt/nvme  ext4  defaults,noatime  0  2
```

Bağlanacağı dosya yolunu `sudo mkdir -p /mnt/nvme` ile oluşturdum ve test etmek için, `sudo mount -a` komutunu çalıştırdım. `df -H | grep nvme` ile de kontrol ettim.

```bash
sudo fallocate -l 16G /mnt/nvme/swapfile
sudo chmod 600 /mnt/nvme/swapfile
sudo mkswap /mnt/nvme/swapfile
sudo swapon /mnt/nvme/swapfile
```

Komutları ile Swap tanımını yaptık.

```bash
echo '/mnt/nvme/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Komutu ile de Swap alanının her açılışta otomatik bağlanmasını sağlamış olduk.

### Ollama Kurulumu ve Ayarlanması

Kurulum sonrasında cihazı yalnızca bir geliştirme kartı olarak değil, ağ üzerinden erişilebilen bir yapay zekâ servis noktası gibi kullanabilmek istedim. Bu yüzden LLM'leri lokal olarak çalıştırıp dışarıya açabilen bir çözüm olarak Ollama'yı tercih ettim.

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Komutu ile direkt Ollama kurulumunu yaptım. Sonrasında aşağıdaki komut ile de ilk deneme modelini indirmesini sağladım.

```bash
ollama pull tinyllama
```

Kurguladığım yapıda işletim sistemi microSD kart üzerinde kalacak ve diğer her şeyin NVMe üzerinde olmasını sağlamam lazım. Bunun için Ollama'nın önbelleğini ve model klasörlerini taşımam lazım.

```bash
mkdir -p /mnt/nvme/ollama
sudo systemctl stop ollama
ln -s /mnt/nvme/ollama ~/.ollama
sudo systemctl start ollama
```

Bunun yanında Ollama'nın dışarı da açılması gerekiyor.

```bash
sudo vi /etc/systemd/system/ollama.service
```

Yukarıdaki komuttan sonra açılan dosya içerisine; `Environment="OLLAMA_HOST=0.0.0.0:11434"` eklenmesi ile de Ollama her yerden gelen istekleri kabul eder duruma getiriliyor.

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
ss -lntp | grep 11434
curl http://127.0.0.1:11434/api/tags
```

## Kapanış Sözü

Yapay zekâ alanında kendimi bir adım daha ileriye taşımak için bu hamleyi başardım. Yeni denemeler ve yeni tecrübeler için attığım bu adım biraz yorucu oldu ancak yine de başardım diyebiliyorum.

Bunlara rağmen, söylemek istediklerim var. 2025 yılında hala ekran ve kablolu klavye ile kurulum yapmak, özellikle de yapay zekâ ile ilgili bir cihazda bu yöntemi kullanmak bana garip geliyor. Raspberry Pi kurulumu çok uzun zamandır microSD kart içine eklenen bir dosya ile ayarlanabiliyor ve ekrana bile ihtiyaç olmuyor. Benzer bir yaklaşımın, bu seviyedeki Yapay zekâ cihazlarında da standart hale gelmesini beklerdim.

Toparlamak gerekirse, başımdan geçen ve sonucu güzel olan bir anı oldu. Artık unutmam ve yoluma devam ederim diyeceğim bir başlangıç anım var. Sizlerin de benzer anıları varsa veya Jetson Orin Nano ile deneyimleriniz varsa paylaşmanızı çok isterim.

## Kaynaklar ve Ek Okumalar

- [Jetson Orin Nano Super Developer Kit - Initial Setup](https://medium.com/@matt.dixon1010/jetson-orin-nano-super-developer-kit-initial-setup-fccba1d46b09)
- [NVIDIA Jetson Orin Nano - SSD & MicroSD Setup Guide](https://www.youtube.com/watch?v=BaRdpSXU6EM)
- [Initial Setup Guide for Jetson Orin Nano Developer Kit](https://www.jetson-ai-lab.com/tutorials/initial-setup-jetson-orin-nano/)
