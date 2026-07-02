# Admin / Mini-CMS Tasarım Spesifikasyonu

Bu belge, **Celine Gelinlik** showcase sitesinin yönetim panelini (admin / mini-CMS) tanımlar. Panel, Next.js 16 (App Router) üzerinde `apps/web/app/(admin)/*` altında yaşar; içerik NestJS 11 + Prisma 7 API'sinden okunur/yazılır. Veri alanları için bkz. [Veri Modeli](DATA-MODEL.md).

## Tasarım felsefesi

Panel tek bir kişi için tasarlanıyor: butik sahibi **Seda**. Seda teknik değil. Her ekran, bir veritabanı formu gibi değil, elle doldurulacak bir kağıt gibi okunmalı. İlkeler:

- **Az seçenek, güvenli varsayılanlar, affedici akışlar.** Yanlış yapması zor olmalı.
- **Sade dil.** "Gelinlikler" (ürün değil), "Kaydet" (commit değil), "Yayınla" / "Gizle".
- **Yıkıcı işlemler her zaman iki kez sorar.**
- **Genel site desktop-first ve zarif; admin ise mağazada tek elle, telefonda kullanılan pratik bir araçtır.** Genel site masaüstü öncelikli olsa da **admin panel telefonda kusursuz çalışmalıdır** — Seda çoğu zaman dükkanda, elinde telefonla randevu ve gelinlik güncelleyecek.

Ana dönüşüm hedefi para değil bilgi akışıdır: gelen **atölye randevusu / WhatsApp** taleplerinin hiçbirinin kaçmaması. Panel bu hedefe göre önceliklenir.

---

## 1. Bilgi Mimarisi (ekranlar ve rotalar)

Tüm yönetim ekranları `(admin)` route group'u altında, ortak bir kimlik-doğrulamalı layout ile yaşar: masaüstünde kalıcı sol sidebar, mobilde alt tab bar + hamburger menü. Kimlik doğrulaması `apps/web/app/(admin)/layout.tsx` server component'inde yapılır (httpOnly cookie okunur); oturumsuz kullanıcılar `/admin/login`'e yönlendirilir.

Kanonik admin rotaları `/admin/*` altındadır:

| Rota | Ekran | Amaç |
|---|---|---|
| `/admin/login` | Giriş | E-posta + parola. `(admin)` layout'unun dışında (sidebar yok). |
| `/admin/forgot-password` | Parola sıfırlama talebi | E-posta ile sıfırlama linki gönderir. |
| `/admin/reset-password?token=` | Yeni parola belirle | Sıfırlama token'ını tüketir. |
| `/admin` → `/admin/dashboard` | Dashboard | Giriş sonrası açılan ekran. Durum özeti + kısayollar. |
| `/admin/gelinlikler` | Gelinlik listesi | Ana envanter (grid / tablo). |
| `/admin/gelinlikler/yeni` | Gelinlik oluştur | Boş editör (ilk kayıtta taslak otomatik oluşur). |
| `/admin/gelinlikler/[id]` | Gelinlik düzenle | Canlı önizlemeli tam editör. |
| `/admin/koleksiyonlar` | Koleksiyon listesi | Koleksiyonlar + gelinlik sayıları. |
| `/admin/koleksiyonlar/[id]` | Koleksiyon düzenle | Ad, kapak, açıklama, içindeki gelinliklerin sıralaması. |
| `/admin/randevular` | Randevu gelen kutusu | Durum pipeline'lı tablo. |
| `/admin/randevular/[id]` | Randevu detay | Talep detayı + WhatsApp aksiyonu (drawer da olabilir — bkz. §4). |
| `/admin/ayarlar` | Site ayarları | İletişim, sosyal, adres, hero, hakkında. |
| `/admin/hesap` | Hesap | Kendi parolasını değiştir; (sadece owner) personel yönetimi. |

> Genel site rotaları (`/`, `/koleksiyonlar`, `/koleksiyonlar/[slug]`, `/modeller` [etiket "GELİNLİKLER"], `/modeller/[dressSlug]`, `/ozel-dikim`, `/atolye`, `/randevu`, `/iletisim`, `/gercek-gelinler`) için bkz. [Sayfalar](PAGES.md). Bir gelinlik = "model / gelinlik"; genel sitede `/modeller/[dressSlug]` altında görünür.

### Ekran içerikleri

**Giriş (`/admin/login`)** — Celine Gelinlik logosu, e-posta alanı, parola alanı, "Parolayı göster" toggle'ı, "Parolamı unuttum" linki. Tek "Giriş yap" butonu. Kayıt (sign-up) yok; hesaplar sağlanır (bkz. §7).

**Dashboard (`/admin/dashboard`)** — Gösteriş metrikleri değil, "buna bakman gerekebilir" kartları:

- **Yeni randevu talepleri** — büyük sayı + "Görüntüle" → filtrelenmiş gelen kutusu. Bu en önemli karttır, en üstte durur.
- **Gelinlikler** sayısı + "Taslak" alt sayacı ("3 taslak henüz yayınlanmadı") — böylece hiçbir gelinlik yayınlanmadan unutulmaz.
- **Hızlı aksiyonlar** satırı: `+ Gelinlik ekle`, `Talepleri gör`, `Site bilgilerini düzenle`.
- Opsiyonel: son düzenlenen 4 gelinliğin küçük görselleri ("Son düzenlenenler") — çalışmaya hızlı dönüş için.

**Gelinlik listesi (`/admin/gelinlikler`)** — Varsayılan görünüm **küçük görselli grid** (Seda resimlerle düşünür); güç kullanımı için tablo toggle'ı.

- Her kart: kapak görseli, ad, durum rozeti (Taslak / Yayında), Öne çıkan yıldızı, koleksiyon etiketi. **Fiyat gösterilmez** — bu bir showcase sitesidir, fiyat yoktur.
- Üst bar: ada göre arama; filtre çipleri (Tümü / Yayında / Taslak / Öne çıkan); sıralama (En yeni, Ada göre, Manuel sıra).
- Ana buton: `+ Gelinlik ekle`.
- Kart hover / tap menüsü: Düzenle, Çoğalt, Yayınla / Gizle, Sil.
- Boş durum: sıcak bir illüstrasyon + "İlk gelinliğini ekle" CTA'sı.

**Koleksiyon listesi (`/admin/koleksiyonlar`)** — Koleksiyon kapağı, adı ve "N gelinlik" gösteren kartlar. `+ Yeni koleksiyon`. Koleksiyonlar sürükle-bırak ile sıralanır (bu sıra = genel sitedeki sıra).

**Randevu gelen kutusu** — bkz. §4. **Site ayarları** — bkz. §5.

---

## 2. Gelinlik Editörü UX'i (CMS'in kalbi)

Yerleşim: **masaüstünde iki panel** — solda form (kaydırılabilir), sağda **yapışkan (sticky) canlı önizleme** (genel gelinlik sayfasının birebir görünümü). Mobilde önizleme üstteki bir "Önizleme" sekmesine/butonuna çöker ve tam ekran açılır.

### Alanlar (yukarıdan aşağıya, gruplu)

**1. Temel bilgiler**
- **Ad** (metin, zorunlu) — taslak kaydetmek için gerçekten zorunlu olan tek alan.
- **Slug** — addan otomatik türetilir (`beyaz-zambak` gibi); Seda'ya gösterilir ama elle düzenlemesi gerekmez (gelişmiş alanda açılır). Genel sitede `/modeller/[dressSlug]` için kullanılır.
- **Kısa açıklama** (textarea, ~2 satır) — kartlarda görünür.
- **Detaylar** (minimal rich text: sadece kalın + liste) — kumaş, siluet, beden bilgisi. Araç çubuğu küçük tutulur; çok seçenek korkutur.

> **Fiyat alanı yoktur.** Celine Gelinlik'te fiyat, sepet veya e-ticaret bulunmaz. Talep her zaman atölye randevusuna / WhatsApp'a yönlendirilir.

**2. Fotoğraflar** — kritik etkileşim, aşağıda detaylı.

**3. Düzenle / organize**
- **Koleksiyon** — shadcn `Select` (tekli) veya çoklu combobox. İçinde "+ Yeni koleksiyon oluştur" satırı vardır; böylece koleksiyon eklemek için ekrandan çıkmaz.
- **Öne çıkan** — `Switch`, etiketi "Ana sayfada göster". Yardım metni: "Öne çıkan gelinlikler, ana sayfadaki vitrin şeridinde görünür."
- **Etiketler** (opsiyonel, Faz 2) — filtreleme için serbest metin.

**4. Yayın durumu** (editörün sağ üstünde, her zaman görünür / sticky)
- **Durum** — net bir segmented control veya `Switch`: **Taslak ↔ Yayında**, kelimelerle etiketli ("Sitende görünür" / "Gizli — yalnızca sen görürsün"). Etiketsiz çıplak toggle asla kullanılmaz.
- Kayıt durumu göstergesi (bkz. autosave, §3).

### Çoklu görsel yükleme + sürükleyerek sıralama — önerilen yaklaşım

**Öneri: sıralama için `@dnd-kit/core` + `@dnd-kit/sortable`, yükleme/kırpma hattı için Cloudinary Upload Widget.** Gerekçe:

- **Cloudinary Upload Widget** (ham dropzone → kendi API'nize değil), çünkü Seda'ya bedavaya şunları verir: çoklu dosya seçimi, sürükle-bırak, mobilde kamera ile çekim, ilerleme çubukları, istemci tarafı yeniden boyutlandırma, format dönüşümü **ve yerleşik kırpma**. Doğrudan Cloudinary'ye yükler (bir klasöre kilitli **unsigned upload preset**), böylece telefon fotoğraflarının büyük dosyaları NestJS sunucusuna hiç uğramaz. Dönen `publicId` + `secureUrl` saklanır ve tutarlı teslimat için Cloudinary anlık dönüşümler yapar (`f_auto,q_auto,c_fill,ar_4:5`).
- **dnd-kit** sıralama için; erişilebilir, dokunmatik dostu (kritik — Seda telefonda sıralar), pointer/klavye sensörleri var ve react-beautiful-dnd'ye göre daha hafif/güncel. Görsel grid'inin üzerinde `SortableContext` + `rectSortingStrategy` kullanılır.

Akış:
1. Seda **"Fotoğraf ekle"**'ye dokunur → Cloudinary widget açılır → galeriden seçer veya fotoğraf çeker. Aynı anda birden fazla seçebilir.
2. Her başarılı yükleme callback'inde görsel dizisine `{ id, publicId, url, alt: "", isCover }` eklenir ve gelinlik PATCH edilir.
3. Fotoğraflar **responsive küçük görsel grid'i** olarak render edilir; her biri bir dnd-kit sortable karo.
4. **Sürükleyerek sırala.** Grid'deki sıra = genel galerideki sıra. Mobilde uzun-bas-sonra-sürükle; kaydırırken kazara sürüklemeyi önlemek için **belirgin bir sürükleme tutamacı (drag handle)** ikonu.
5. Karo başına kontroller (hover'da / mobilde hep görünür): **Kapak yap** (yıldız), **Alt metni düzenle**, **Kırp**, **Sil** (onaylı).

**Cloudinary'ye UI seviyesinde bağımlı olmak istemezseniz** yedek: `react-dropzone` → NestJS'te kendi presigned-upload endpoint'iniz → görsel sunucu tarafında Cloudinary'ye kaydedilir, sıralama yine dnd-kit, kırpma için küçük bir kütüphane (`react-easy-crop`). Ancak teknik olmayan bir sahip ve küçük bir butik için Cloudinary widget pragmatik kazançtır: daha az kod, daha iyi mobil çekim, kırpma dahil.

### Kapak görseli
- **İlk görsel varsayılan olarak kapaktır** (sıfır konfig: hiçbir şey yapmazsa da çalışır).
- Bir **yıldız rozeti** kapağı işaretler; herhangi bir karonun yıldızına dokunmak onu kapağa yükseltir. Yeni kapak seçmek eskisini temizler.
- Kapak; liste kartlarında, koleksiyon kapaklarında ve sosyal paylaşım önizlemelerinde (OG image) görünen görseldir.

### Alt metin (alt text)
- Her karonun küçük bir "Açıklama ekle" alanı vardır. **Placeholder, gelinlik adıyla ön-doldurulur** ("{Gelinlik adı} fotoğrafı" gibi), böylece Seda atlasa bile makul bir alt metin her zaman bulunur — SEO ve erişilebilirlik için iyi, ona ekstra iş yüklemeden. Bkz. [SEO](SEO.md).

### Canlı önizleme
- Sağ panel, güncel form durumuyla (ad, güncel sıradaki galeri, kapak önde, açıklama) gerçek genel gelinlik component'ini render eder. ~300ms debounce.
- Durum Taslak iken **"Taslak" şeridi** overlay'i gösterir; böylece Seda gelinliği canlı sitede neden bulamadığını anlar.
- "Canlı sayfayı aç" linki yalnızca yayınlandıktan sonra görünür.

---

## 3. Teknik olmayan sahip (Seda) için affedici UX

**Mantıklı varsayılanlar (sormadan güvenli/açık olanı yap):**
- Yeni gelinlik **Taslak** olarak başlar — yarım gelinliği kazara yayınlayamaz.
- İlk yüklenen fotoğraf otomatik kapak olur.
- Alt metin gelinlik adından otomatik türetilir.
- Görsel en/boy oranı (aspect ratio) Ayarlar'da bir kez belirlenir, her yerde uygulanır.
- Koleksiyon opsiyoneldir; koleksiyonu olmayan gelinlik hiçbir koleksiyonda görünmez, o kadar.

**Autosave / taslak:**
- **Editör otomatik kaydeder**: yazma durunca ~1–2s debounce ile PATCH + blur'da kaydet. Sunucuda `draft` durumu tutulur, böylece kopan bağlantı veya kapanan sekme çalışmayı kaybettirmez.
- Durum kontrolünün yanında **kayıt-durumu çipi**: "Kaydediliyor…" → "Tüm değişiklikler kaydedildi ✓" + zaman damgası. Bu güven sinyalidir; Seda işinin güvende olup olmadığını asla merak etmemeli.
- **Yayınlama açık bir adımdır**, kaydetmeden ayrı. Autosave taslağı tutar; Seda hazır olunca bilinçli olarak Yayında'ya geçer.
- Görsel ekleme/sıralama için optimistic UI; hatada geri alma (rollback) + toast.

**Yıkıcı işlemlerde onay:**
- Gelinlik sil / fotoğraf sil / koleksiyon sil → shadcn `AlertDialog`: "'{ad}' silinsin mi? Bu geri alınamaz." Tek kırmızı buton Onayla'dır; Vazgeç varsayılan ve odaklıdır.
- **Gizleme (unpublish) yıkıcı değildir** (geri alınabilir), o yüzden korkutucu dialog gerekmez — sadece toast: "Sitenden gizlendi. [Geri al]".
- Bir koleksiyonu silmek, içindeki gelinliklere ne olacağını açıkça söyler (yalnızca grup dışı kalırlar, asla silinmezler).
- Ucuz sigorta olarak soft-delete + 30 gün "Son silinenler" kurtarma düşünülebilir (Faz 2).

**Görsel kırpma / oran rehberi (site tutarlı görünsün diye):**
- Gelinlikler için **tek bir dikey en/boy oranı — önerilen 4:5** (boydan gelinlikte gösterişli, mobilde uyumlu). Cloudinary kırpma adımında zorunlu tutulur, böylece her kart ve galeri görseli hizalanır.
- Kırpma dialog'u **sabit 4:5 çerçeve** gösterir; Seda içinde sürükler/zoom yapar — oran-dışı görsel üretemez.
- Teslimat `c_fill,g_auto,ar_4:5` kullanır; kırpılmamış görseller bile akıllıca (Cloudinary özneyi seçer) otomatik kırpılır — güvenlik ağı.
- Ayarlar'daki hero görseli kendi kırpma çerçevesiyle geniş oran (16:9 veya 21:9) kullanır.
- Nazik satır-içi ipucu: "Fotoğraflar dikey çekildiğinde, iyi ışıkta ve sade zeminde en iyi görünür."

**Mobil kullanılabilirlik (admin telefonda çalışmalı; genel site desktop-first kalır):**
- Admin layout **responsive ve dokunma-öncelikli**: alt tab bar (Dashboard / Gelinlikler / Talepler / Ayarlar), büyük dokunma hedefleri (≥44px), yapışkan ana aksiyon butonu.
- Gelinlik editörü mobilde tek kolona iner; önizleme yan panel değil sekmedir.
- Fotoğraf yükleme cihaz kamerasını doğrudan kullanır (Cloudinary widget çekimi destekler).
- Sıralama için dnd-kit touch sensor + görünür sürükleme tutamaçları (başparmakla).
- Formlar doğru input tiplerini kullanır (`type="email"`, `type="tel"`, telefon için `inputmode="tel"`) — doğru klavye açılsın.
- Toast ve dialog'lar mobilde alta yaslı (başparmak erişimi).

---

## 4. Randevu Gelen Kutusu

Masaüstünde shadcn `Table`; **mobilde yığılı kartlar** (tablolar telefona sığmaz — zarifçe bozulur/degrade eder).

**Sütunlar:** Durum rozeti · Ad · Talep zamanı (göreli: "2sa önce") · Tercih edilen tarih/saat · İlgilenilen gelinlik (talep bir gelinlik sayfasından geldiyse) · Telefon · hızlı aksiyonlar.

### Durum pipeline'ı: `Yeni → Arandı → Onaylandı → İptal`

- Durum, satır içinde doğrudan düzenlenebilir küçük bir dropdown/segmented rozettir — ilerletmek için detay açmaya gerek yok.
- Renk kodlu: **Yeni** = vurgulu/kalın (okunmamış hissi, nokta işareti), **Arandı** = nötr, **Onaylandı** = yeşilimsi/olumlu, **İptal** = soluk/gri.
- **Yeni satırlar açılana dek görsel olarak vurgulanır** (kalın, nokta); açılınca okundu işaretlenir ama Seda taşıyana dek durum değişmez.
- Üstte filtre çipleri: Tümü / Yeni / Arandı / Onaylandı / İptal. Varsayılan görünüm = Yeni + Arandı (aksiyon gerektirenler); Onaylandı ve İptal filtre arkasında.
- En yeni en üstte sıralanır.

**Detay görünümü** — satıra tıklamak masaüstünde bir **yan drawer (Sheet)**, mobilde tam ekran açar (rota değişiminden daha hafif hisseder, listeyi bağlamda tutar): ad soyad, telefon, e-posta, tercih tarih/saat, mesaj, bağlı gelinlik (küçük görsel + link), gönderim zaman damgası ve iç not alanı ("Aradım, mesaj bıraktım").

### Hızlı aksiyonlar: WhatsApp'tan yaz + tıkla-ara

- **"WhatsApp'tan yaz"** — her satırda ve detayda birincil yeşil buton:
  - `https://wa.me/{normalizedPhone}?text={prefilled}` linkini yeni sekmede açar.
  - **Önceden doldurulmuş mesaj şablonu** Ayarlar'dan gelir, kişiselleştirilir: "Merhaba {Ad}, Celine Gelinlik'e ve {Gelinlik} modelimize gösterdiğiniz ilgi için teşekkürler! Atölyemizi ne zaman ziyaret etmek istersiniz?"
  - Gelen telefon **E.164**'e normalize edilir (boşluk/parantez temizlenir, Ayarlar'daki varsayılan ülke kodu — TR için `+90` — uygulanır) ki link güvenilir çalışsın.
- **Tıkla-ara** (`tel:`) — ikincil buton, telefonda tek dokunuşla arama.
- Diğer ikincil aksiyonlar: E-posta (`mailto:`), Telefonu kopyala.
- WhatsApp'a tıkladıktan sonra otomatik olarak "Arandı olarak işaretle?" önerilebilir.

---

## 5. Site Ayarları Ekranı

Tek kaydırılabilir form, kartlara gruplu; aynı autosave + "kaydedildi ✓" deseniyle. Bu değerler genel sitenin header/footer/iletişim/ana sayfasını besler.

**İletişim**
- Telefon (tel, ülke kodu ipuçlu).
- WhatsApp numarası (E.164; ipucu: "Ülke kodunu ekleyin, ör. +90 5xx …"). Oluşan wa.me linkinin canlı önizlemesi + linki açan bir "Test et" butonu.
- E-posta (opsiyonel).

**Sosyal**
- Instagram URL'i (instagram.com/… linki doğrulanır; gösterim için handle da saklanır). Bkz. §6.
- Opsiyonel: Facebook, Pinterest, TikTok — ama Seda'nın gerçekten kullandıklarıyla sınırlı tutun; boş olanlar sitede gizlenir.

**Konum**
- Adres (çok satırlı) — kanonik: **İdealtepe Mah. Panaroma Sok. Defne Apt. No:5 D:7, Maltepe / İstanbul**.
- Google Maps linki — koordinat veya embed iframe istemek yerine (çok teknik) tek bir "Google Maps linkini yapıştır" alanı sunun ve embed'i ondan türetin. Küçük bir harita önizlemesi gösterin.

**İçerik**
- Hakkında metni (rich-ish textarea) — genel [Hakkımızda](PAGES.md) / ana sayfa bölümünde gösterilir.
- Butik adı + slogan (varsayılan: Celine Gelinlik).

**Marka / görsel**
- Hero görseli (geniş kırpma, §3) — ana sayfa hero'sunun canlı önizlemesiyle.
- Logo yükleme (opsiyonel).
- WhatsApp mesaj şablonu (§4'te kullanılır) — `{ad}` / `{gelinlik}` token'ları açıklamalı.

Her alan, nerede göründüğünü gösterir ("Sitenin footer'ında görünür") — tahmin yükünü azaltır.

---

## 6. Instagram Bağlantısı (kırılgan API bağımlılığı olmadan)

**Varsayılan (MVP): basit, güvenilir link.** Ayarlar'daki Instagram URL'i, header/footer'da bir Instagram ikonu ve "Instagram'da takip et" butonu olarak render edilir. Bu asla bozulmaz; token, inceleme süreci gerektirmez. Lansman için önerilen budur.

**Opsiyonel "son gönderiler" şeridi (progressive enhancement, zarifçe bozulmalı):**
- Ham Instagram Basic Display / Graph API'ye **doğrudan bağlanmayın** — uygulama incelemesi, ~60 günde dolan token'lar ve küçük bir butiğin sürdüremeyeceği business-account altyapısı gerektirir. Sessizce bozulur ve herkesi mahcup eder.
- Tercih sırasına göre pragmatik seçenekler:
  1. **Üçüncü taraf embed widget** (LightWidget, EmbedSocial, Behold, SnapWidget vb.) — Seda hesabını bir kez onların sitesinde bağlar, bir embed snippet/URL'ini bir Ayarlar alanına yapıştırır; biz `iframe` içinde render ederiz. Token yenilemeyi onlar üstlenir. Düşük bakım.
  2. **Manuel "öne çıkan Instagram" şeridi** — Seda admin'de 4–6 görsel seçer (fotoğraf yükleyiciyi yeniden kullanır), profiline link verir. Sıfır API, tam kontrol, her zaman marka-uyumlu. Genelde en güvenlisi ve canlı feed'den daha şık görünür.
  3. **Kendi sunucumuzda önbellekli feed** (yalnızca Faz 2+): bir NestJS cron'u Graph API'den çeker, JSON/görselleri cache'ler, site cache'ten okur. Bunda bile bir feature flag'e sarın ve fetch bayat/başarısızsa **her zaman basit linke düşün**. Ölü bir token sitenin bir bölümünü asla boşaltmasın.
- **Kural:** Instagram şeridi her zaman opsiyonel ve her zaman düz linke zarif fallback'lidir. Şerit kapalıyken de site eksiksiz görünmelidir.

---

## 7. Roller ve Güvenlik

**Hesaplar:** sağlanır (provisioned), self-servis değil. Herkese açık kayıt yok.
- **Owner (Seda)** — tam erişim: gelinlikler, koleksiyonlar, randevular, ayarlar ve personel yönetimi.
- **Staff (opsiyonel, bir-iki kişi)** — gelinlik/koleksiyon yönetir ve randevu ele alır ama **site ayarlarını değiştiremez** ve kullanıcı yönetemez. Basit iki-rollü RBAC yeterli; izin matrisi kurmayın.

**Giriş mekaniği:**
- E-posta + parola, NestJS API'ye karşı. Parolalar **argon2** ile hash'lenir. Sunucu **JWT (access + refresh)** üretir.
- Token'ları localStorage'da tutmak yerine **httpOnly, secure, SameSite cookie** önerilir (XSS'e dayanıklı; `(admin)/layout.tsx` server component'i cookie'yi okuyup rotaları temiz şekilde koruyabilir). Kısa ömürlü access + refresh; refresh ile rolling session.
- Giriş denemeleri rate-limit'lenir; genel hata mesajı "E-posta veya parola hatalı" (hangisi olduğunu sızdırma).
- "Beni hatırla" — Seda kendi telefonunda sürekli çıkış yapmasın diye uzun refresh penceresi.

**Parolamı unuttum (küçük işletme için pragmatik):**
- Standart self-servis e-posta sıfırlama: link talebi → süreli, tek kullanımlık token → yeni parola. Her zaman aynı mesaj: "Bu e-posta kayıtlıysa link gönderdik."
- Esasen tek kullanıcı olduğu için bir **güvenlik ağı** ekleyin: owner hesabının e-postası kurtarma kanalıdır ve Seda e-postasına erişimi kaybederse **geliştiricinin CLI/sunucu tarafından parolayı elle sıfırlayabileceği** dokümante bir yol vardır. İki kişilik dükkan için 2FA/SSO'ya boğulmayın; ancak **opsiyonel e-posta OTP / magic-link girişi** parolalardan daha dostça olabilir — değerlendirin.
- Minimal parola politikası (karmaşıklık gösterisi yerine uzunluk) uygulayın.

**Genel güvenlik:** yalnızca HTTPS; cookie-tabanlı mutasyonlarda CSRF koruması; her admin API rotasında sunucu tarafı yetkilendirme (istemcide gizlenmiş UI'ya asla güvenme); klasöre kilitli, boyut/format sınırlı Cloudinary **unsigned preset** (upload widget kötüye kullanılamasın). API dokümantasyonu **Swagger** ile sunulur. Bkz. [Mimari](ARCHITECTURE.md), [Deployment](DEPLOYMENT.md).

---

## 8. MVP vs Sonrası

**MVP (lansman — dükkan bununla çalışabilir):**
- Giriş + parola sıfırlama (yalnızca owner hesabı).
- Dashboard (yeni-talepler kartı + hızlı aksiyonlar).
- Gelinlikler: liste (grid), oluştur/düzenle, çoklu görsel yükleme + sürükle sıralama, kapak, alt metin, **Taslak/Yayında toggle'ı**, Öne çıkan toggle'ı, autosave, onaylı silme.
- Koleksiyonlar: oluştur/düzenle, gelinlik atama, tek kapak.
- Randevu gelen kutusu: tablo + **Yeni/Arandı/Onaylandı/İptal** durumu + detay drawer + **WhatsApp + tıkla-ara** hızlı aksiyonları.
- Site ayarları: telefon, WhatsApp, Instagram URL, adres + Maps linki, hakkında, hero görseli.
- Instagram = yalnızca **basit link**.
- Gelinlik görsellerinde zorunlu **4:5 kırpma**, hero'da geniş kırpma.
- Telefonda kullanılabilir admin.

**Faz 2 (lansmandan sonra, olsa iyi olur):**
- Staff rolü + kullanıcı yönetimi UI'ı.
- Opsiyonel OTP / magic-link girişi.
- Instagram son-gönderiler şeridi (üçüncü taraf widget veya manuel öne çıkan şerit).
- Gelinlik çoğaltma; toplu aksiyonlar (çoklu seçimle yayınla/gizle/sil); tüm gelinlik listesinin manuel sürükle-sırası.
- Soft-delete + "Son silinenler" kurtarma.
- Etiketler/filtreleme ve genel sitede arama.
- Koleksiyon sıralaması; genel sitede koleksiyon başına sıralama.
- Randevu geliştirmeleri: iç not geçmişi, WhatsApp sonrası otomatik "arandı" işaretleme, CSV dışa aktarma, yeni talepte Seda'ya opsiyonel e-posta/WhatsApp bildirimi.
- Temel analitik (gelinlik başına görüntülenme, gelinlik başına talep) — hangi gelinliğin öne çıkarılacağına karar vermek için.
- Çok dillilik (next-intl: TR birincil, EN opsiyonel) ve per-gelinlik SEO alanları (meta / OG image) — bkz. [SEO](SEO.md).
- Birden fazla kişi düzenlemeye başlayınca aktivite log'u / audit trail.

Ayrıca bkz. [Yol Haritası](ROADMAP.md).

---

**Bir bakışta ana öneriler:** Cloudinary Upload Widget (çoklu yükleme + kamera + kırpma, doğrudan buluta) + **dnd-kit** (dokunma dostu sıralama); **ilk görsel = kapak, varsayılan Taslak, görünür "kaydedildi ✓" ile autosave**; zorunlu **4:5** gelinlik kırpması; randevular durum-pipeline'lı tablo + **wa.me / tıkla-ara** aksiyonu; Instagram lansmanda **düz link**, sonra her zaman fallback'li opsiyonel şerit; **httpOnly cookie** + **argon2 + JWT**, iki-rollü RBAC, geliştirici tarafı kurtarma kaçış-kapılı self-servis e-posta sıfırlama. Alan tanımları için [Veri Modeli](DATA-MODEL.md).
