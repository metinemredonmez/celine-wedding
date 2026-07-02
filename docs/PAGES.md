# Sayfalar — Bilgi Mimarisi & Wireframe'ler

> **Celine Gelinlik** · lüks, minimal, fotoğraf-öncelikli gelinlik butiği showcase sitesi.
> E-ticaret yok, sepet yok, fiyat yok. **Birincil dönüşüm = atölye randevusu / WhatsApp.**

Bu doküman sitenin sayfa-sayfa bilgi mimarisini (IA), bölüm sıralamalarını (wireframe), navigasyon yapısını, randevu akışını, her sayfanın API'den çektiği içerik modelini ve Türkçe copy örneklerini tanımlar. Görsel dil ve bileşen detayları için [Tasarım](DESIGN.md), yönetim paneli ve randevu yönetimi için [Admin](ADMIN.md) dokümanlarına bakınız.

İlgili dokümanlar: [Veri Modeli](DATA-MODEL.md) · [Tasarım](DESIGN.md) · [Admin](ADMIN.md) · [Mimari](ARCHITECTURE.md) · [SEO](SEO.md) · [Yol Haritası](ROADMAP.md)

---

## 1. Sitemap

Marka konumlanması: editoryal, sakin, fotoğraf-öncelikli. Online satış yok; her sayfa nazikçe **randevuya** yönlendirir.

| # | Route | Türkçe Ad | English Name | Faz |
|---|-------|-----------|--------------|-----|
| 1 | `/` | Anasayfa | Home | **MVP** |
| 2 | `/koleksiyonlar` | Koleksiyonlar | Collections (index) | **MVP** |
| 3 | `/koleksiyonlar/[slug]` | Koleksiyon Detay | Collection Detail | **MVP** |
| 4 | `/modeller` | GELİNLİKLER (route `/modeller`) | Dresses (index) | **MVP** |
| 5 | `/modeller/[dressSlug]` | Model / Gelinlik Detay | Dress Detail | **MVP** |
| 6 | `/ozel-dikim` | Özel Dikim | Custom / Bespoke | **MVP** |
| 7 | `/atolye` | Atölye | Atelier / About | **MVP** |
| 8 | `/randevu` | Randevu | Appointment | **MVP** |
| 9 | `/randevu/tesekkurler` | Randevu Onay | Appointment Confirmation | **MVP** |
| 10 | `/iletisim` | İletişim | Contact | **MVP** |
| 11 | `/gercek-gelinler` | Gerçek Gelinler | Real Brides | **Faz 2** (ana menü kalemi; MVP'de placeholder ile açılabilir) |
| 12 | `/galeri` | Galeri | Lookbook / Gallery | **Faz 2** |
| 13 | `/sss` | Sıkça Sorulan Sorular | FAQ | **Faz 2** |
| 14 | `/kvkk`, `/gizlilik` | KVKK / Gizlilik | Privacy / KVKK | **Faz 2** (yasal, TR gerekli) |
| 15 | `/basin` | Basında Biz | Press | Faz 3 |
| — | `/admin/*` | Yönetim | Admin | **MVP** (bkz. [Admin](ADMIN.md)) |

> **Route standardı:** Bireysel gelinlik sayfası daima `/modeller/[dressSlug]` altındadır (butikte gelinliğe "model/gelinlik" denir). Route `/modeller` korunur; ekranda gösterilen menü etiketi ise **"GELİNLİKLER"**tir. `/gelinlik` gibi eski adlar kullanılmaz.

**Kalıcı global öğeler (her sayfada):** Header, Footer, sabit (floating) WhatsApp butonu. Faz 2'de KVKK/çerez banner'ı eklenir.

**Dil:** TR birincil (varsayılan), EN opsiyonel. `next-intl` ile yönetilir; EN yayına alındığında route'lar `/en/...` altında yansıtılır.

---

## 2. Sayfa-Sayfa Wireframe'ler

Aşağıdaki listeler her sayfanın **bölüm sırasını (yukarıdan aşağıya)** verir. Tipografi, boşluk ve bileşen kararları için [Tasarım](DESIGN.md).

### 2.1 Anasayfa (`/`) — MVP

1. **Full-bleed hero** — tam ekran (viewport) **tek büyük editoryal gelinlik fotoğrafı** (carousel/slider/video DEĞİL). Üzerinde: kısa marka cümlesi/slogan + iki buton — **"Randevu Al"** (birincil) ve **"Koleksiyonu Keşfet"** (ikincil). Sayfa girişinde yavaş fade; hero görseli LCP olduğu için görselin kendisi animasyonlanmaz. Alt-orta konumda ince bir "scroll" ipucu. Bol negatif alan, sadelik. (Danielle Frankel / Reem Acra tarzı sabit editoryal hero.)
2. **Marka giriş şeridi (intro)** — 1–2 cümlelik atölye felsefesi, ortalı. Küçük harf eyebrow ("ATÖLYE") + kısa cümle. Görsel yok veya yalnızca ince ayraç çizgisi.
3. **Öne Çıkan Modeller** — "Öne Çıkan Modeller" başlığı + 3'lü görsel grid (portre oran, hover'da isim görünür). Her kart → model/gelinlik detayına. Mobilde yatay snap-scroll carousel.
4. **Koleksiyonlar teaser** — 2–3 büyük koleksiyon kartı (tam genişlik dönüşümlü veya 2 kolon): büyük görsel + koleksiyon adı overlay + "Koleksiyonu Görün". Koleksiyon detayına bağlanır.
5. **Hikâyemiz / Atölye şeridi** (imza bölüm) — Katherine Tash "OUR STORY" kalıbı: sol tam-boy atölye/kurucu fotoğrafı + sağda büyük serif başlık + sakin serif gövde metni + bol boşluk; kısa, sıcak paragraf + "Atölye" linki. El emeği/zanaat hissini verir. (Aynı kalıp `/atolye` sayfasında da kullanılır.)
6. **Süreç / "Nasıl Çalışıyoruz"** (opsiyonel, MVP-lite) — 3 adımlı yatay dizi: Randevu → Deneme/Prova → Dikim. İkon veya rakam, her adımda tek satır.
7. **Instagram / editoryal şerit** — "Instagram'da Biz" — en son gönderilerden 4–6 kareli görsel satırı; IG profiline bağlanır. (Canlı besleme Faz 2; MVP'de statik/cache görseller.)
8. **Randevu CTA bandı** — tam genişlik kontrast (veya soft) bant: kısa davet cümlesi + **"Randevu Alın"** (birincil) + **"WhatsApp"** (ikincil).
9. **Footer** (global — bkz. §3).

### 2.2 Koleksiyonlar (`/koleksiyonlar`) — MVP

1. **Sayfa başlığı** — küçük hero veya sade başlık bloğu: "Koleksiyonlar" + tek satır giriş. Opsiyonel ince banner görseli.
2. **Koleksiyon grid'i** — büyük editoryal kartlar, satırda 1–2 (görsel-baskın, portre/manzara). Her kart: kapak görseli, koleksiyon adı, sezon/yıl, kısa açıklama, "Keşfedin →". En yeni önce sıralanır.
3. **Randevu CTA bandı** (tekrar kullanılan bileşen).
4. **Footer.**

### 2.3 Koleksiyon Detay (`/koleksiyonlar/[slug]`) — MVP

1. **Koleksiyon hero** — full-bleed kapak görseli + koleksiyon adı + sezon/yıl + 1–2 cümlelik koleksiyon hikâyesi (overlay veya hemen altında).
2. **Koleksiyon anlatısı** — kısa editoryal paragraf (ilham, kumaşlar, ruh hali). Opsiyonel pull-quote.
3. **Modeller grid'i** — bu koleksiyondaki tüm gelinlikler, satırda 2–3, portre görseller, isim hover'da/altında. Her kart → model/gelinlik detayına.
4. **Editoryal ara görsel** — grid ortasında tam genişlik atmosferik bir kare (opsiyonel).
5. **Diğer Koleksiyonlar** — "Diğer Koleksiyonlar" — 2–3 link.
6. **Randevu CTA bandı** — "Bu koleksiyondan bir gelinliği denemek ister misiniz?" + Randevu / WhatsApp.
7. **Footer.**

### 2.4 Model / Gelinlik Detay (`/modeller/[dressSlug]`) — MVP

1. **Galeri hero** — büyük ana fotoğraf (sol/ana alan) + 3–6 ek açının küçük resim (thumbnail) şeridi veya dikey galerisi (ön, arka, detay, kumaş). Mobilde swipe carousel. Tıklamada zoom.
2. **Bilgi kolonu** (desktop'ta sticky):
   - Model adı, koleksiyon linki, kısa şiirsel açıklama.
   - Öznitelik listesi: silüet/kesim, kumaş, yaka, renk, detay, sırt kesimi (bkz. içerik modeli §5).
   - **Belirgin CTA: "Bu Gelinlik İçin Randevu Al"** — randevu formunu ilgili modelle ön-doldurur.
   - İkincil: **"WhatsApp'tan Sor"**.
   - Açık fiyat notu: fiyat gösterilmez — *"Fiyat ve detaylar için sizi randevuyla ağırlıyoruz."*
3. **Tam genişlik detay görseli** — bir yakın çekim (dantel/nakış vb.).
4. **Benzer Modeller** — "Benzer Modeller" 3'lü grid (aynı koleksiyon veya etiket).
5. **Randevu CTA bandı.**
6. **Footer.**

### 2.5 Randevu (`/randevu`) — MVP

1. **Başlık bloğu** — "Randevu" + sıcak davet cümlesi (atölye deneyimi çerçevesi).
2. **İki kolonlu layout:**
   - **Sol:** randevu formu (alanlar §4).
   - **Sağ:** atölye bilgi kartı — adres, çalışma saatleri, telefon, *"Tercih ederseniz WhatsApp'tan da yazabilirsiniz"* + WhatsApp butonu, küçük harita önizlemesi.
3. **Ne beklemeli** — kısa "randevu nasıl geçer" 2–3 satır güven metni (süre, özel ilgi, kişisel deneme).
4. **Footer.** (Bu sayfada CTA bandı yok — sayfanın kendisi CTA'dır.)

### 2.6 Randevu Onay (`/randevu/tesekkurler`) — MVP

Minimal, ortalı durum ekranı:
- Teşekkür başlığı: **"Talebiniz alındı."**
- Sonraki adım cümlesi: *"En kısa sürede sizi arayacağız / WhatsApp'tan döneceğiz."*
- WhatsApp kısayol butonu (ön-doldurulmuş mesajla).
- "Anasayfaya dön" linki.

Ayrı route (`/randevu/tesekkurler`) olarak veya form üstünde inline success state olarak gösterilebilir. SEO açısından `noindex`.

### 2.7 İletişim (`/iletisim`) — MVP

1. **Başlık** — "İletişim" + tek satır.
2. **İletişim bilgileri bloğu** — tam adres, telefon (tıklanabilir `tel:`), WhatsApp butonu, e-posta, çalışma saatleri, Instagram.
3. **Gömülü harita** — Google Maps iframe, tam genişlik.
4. **Kısa iletişim formu** (opsiyonel; ad, telefon, mesaj) — veya doğrudan Randevu'ya yönlendirme.
5. **Footer.**

### 2.8 Atölye (`/atolye`) — MVP

1. **Hero** — atölye veya kurucu portresi, full-bleed, + başlık "Atölye".
2. **Hikâyemiz / Atölye (KT "Our Story" split)** — imza bölüm: sol tam-boy atölye fotoğrafı + sağda büyük serif başlık + sakin serif gövde metni (kurucu/marka hikâyesi, 2–3 paragraf) + bol boşluk. Pull-quote.
3. **Zanaat şeridi** — görsel + metin: el işçiliği, kumaşlar, kişiye özel (made-to-measure) üretim.
4. **Atölye görselleri** — 2–4 görselli mozaik.
5. **Randevu CTA bandı.**
6. **Footer.**

> **Not:** Couture üretim süreci (istişare → tasarım/eskiz → prova → dikim/teslim) artık ayrı **Özel Dikim** sayfasında (§2.9) anlatılır; buradan oraya link verilir.

### 2.9 Özel Dikim (`/ozel-dikim`) — MVP

Made-to-order / bespoke couture anlatısı. Andrew Kwon / Wiederhoeft "process · custom orders" kalıbı.

1. **Hero** — sade başlık "Özel Dikim" + tek satır giriş (kişiye özel couture).
2. **Süreç adımları** — 4 adımlı editoryal dizi (ikon/rakam + kısa metin): **İstişare → Tasarım / Eskiz → Prova → Dikim / Teslim**.
3. **Süre notu** — couture üretim ~**6–12 ay** sürer; erken randevu önerilir.
4. **Şehir dışı / uluslararası** — şehir dışındaki gelinler için **video görüşme** ile ön istişare imkânı.
5. **Ne beklemeli** — kısa güven metni (birebir ilgi, ölçüye özel, kumaş seçimi).
6. **Güçlü Randevu CTA bandı** — "Kendi hikâyenizi birlikte tasarlayalım" + **Randevu Al** / **WhatsApp**.
7. **Footer.**

### 2.10 Gerçek Gelinler (`/gercek-gelinler`) — Faz 2 (MVP'de placeholder)

Wiederhoeft "real brides" / Berta modeli.

1. **Başlık + giriş** — "Gerçek Gelinler" + tek satır.
2. **Editoryal grid** — gerçek gelin fotoğrafları (portre oran) + her kart altında/üstünde **kısa alıntı/testimonial**. Tıklamada lightbox (opsiyonel).
3. **Randevu CTA bandı.**
4. **Footer.**

> **Faz notu:** MVP'de az içerik/placeholder ile açılır; gerçek gelin fotoğrafı biriktikçe Faz 2'de zenginleştirilir.

### 2.11 Galeri / Lookbook (`/galeri`) — Faz 2

1. Başlık + giriş.
2. **Masonry / justified fotoğraf grid'i** — editoryal + gerçek gelin karışık; opsiyonel koleksiyona göre filtre.
3. Tıklamada lightbox.
4. Randevu CTA bandı.
5. **Footer.**

### 2.12 SSS (`/sss`) — Faz 2

Accordion liste:
- Randevu nasıl alınır?
- Prova süresi nedir?
- Dikim süresi ne kadar?
- Ölçü / beden nasıl belirlenir?
- Fiyat bilgisi (randevuda paylaşılır).
- Şehir dışı gelinler için süreç.
- İade/değişim politikası (showcase — online satış yok).

Randevu CTA bandı + footer.

---

## 3. Navigasyon

### Header (desktop)

- Hero üzerinde **transparent**, scroll ile **solid/beyaz-blur**'a döner.
- Sol veya orta: logotype ("ANA SAYFA" logotype'a bağlıdır).
- Sağ: nav — **KOLEKSİYONLAR · GELİNLİKLER · ÖZEL DİKİM · ATÖLYE · GERÇEK GELİNLER · İLETİŞİM · RANDEVU** (Randevu buton, dolgu/outline vurgulu). "GELİNLİKLER" etiketi `/modeller` route'una bağlanır. ("Galeri" ana nav'dan çıkarıldı; opsiyonel footer linki olarak kalabilir.)
- Sticky; scroll sonrası **condense** olur (logo küçülür, bar incelir).
- Dil geçişi (TR/EN) opsiyonel, EN yayına alındığında görünür.

### Mobil menü

- Hamburger → **tam ekran overlay**.
- Dikey liste: ANA SAYFA, KOLEKSİYONLAR, GELİNLİKLER, ÖZEL DİKİM, ATÖLYE, GERÇEK GELİNLER, İLETİŞİM, **RANDEVU** (vurgulu). ("GELİNLİKLER" → `/modeller`.)
- Altta: WhatsApp + Instagram ikonları, telefon numarası.
- Kapatma: sağ üstte X.

### Sabit davranışlar

- Header sticky + condense.
- **Sabit (floating) WhatsApp FAB** — tüm sayfalarda, sağ altta, scroll'dan bağımsız görünür. Tıklayınca `wa.me` linkini açar (form atlanır).
- Randevu CTA bandı her sayfada tekrar eder (sticky değil, bölüm bazlı).

### Footer (global)

| Kolon | İçerik |
|-------|--------|
| **1 — Marka** | Logotype + tek satır marka sloganı. |
| **2 — Menü** | Sayfa linkleri (Koleksiyonlar, Gelinlikler, Özel Dikim, Atölye, Gerçek Gelinler, İletişim, Randevu). Opsiyonel: Galeri (yalnızca footer). |
| **3 — İletişim** | Tam adres (İdealtepe Mah. Panaroma Sok. Defne Apt. No:5 D:7, Maltepe / İstanbul), çalışma saatleri, telefon (`tel:`), WhatsApp, e-posta. |
| **4 — Sosyal** | Instagram, Pinterest + küçük "Randevu Alın" butonu. |

- **Alt bar:** © yıl · Celine Gelinlik · KVKK / Gizlilik linkleri · minimal.
- Opsiyonel: gömülü mini-harita veya "Yol tarifi al" linki.

---

## 4. Randevu Akışı (uçtan uca)

Randevu, sitenin birincil dönüşümüdür. Randevu kayıtlarının yönetici tarafında nasıl yönetildiği için [Admin](ADMIN.md) dokümanına bakınız.

### Giriş noktaları

- Anasayfa hero CTA'sı
- Her sayfadaki randevu CTA bandı
- Header "Randevu" butonu
- Model/gelinlik detay: **"Bu gelinlik için randevu al"** (ilgili modeli ön-doldurur)
- Koleksiyon detay CTA'sı
- Footer
- Mobil menü
- WhatsApp FAB (formu atlar, doğrudan sohbet açar)

### Form alanları

| Alan | Tip | Zorunlu | Not |
|------|-----|---------|-----|
| Ad Soyad | text | Evet | |
| Telefon | tel | Evet | TR format doğrulaması |
| E-posta | email | Hayır | |
| Tercih edilen tarih | date picker | Evet | |
| Tercih edilen saat aralığı | select | Hayır | sabah / öğlen / akşamüstü |
| İlgilendiğiniz koleksiyon / gelinlik | select veya gizli ön-dolgu | Hayır | Model detayından gelirse hidden field; aksi halde serbest metin fallback |
| Mesajınız | textarea | Hayır | |
| KVKK onayı | checkbox | Evet (Faz 2 yasal) | |

### Gönderim (submit) davranışı

1. **Client-side doğrulama** → API'ye `POST /appointments`.
2. **Başarı** → **Onay** durumuna yönlendirme (`/randevu/tesekkurler`) veya inline success: *"Talebiniz alındı, en kısa sürede döneceğiz."*
3. **WhatsApp fallback / hızlandırıcı:** onay ekranında (ve formda ikincil buton olarak) bir **"WhatsApp'tan devam et"** linki bulunur. Bu link `wa.me/<numara>?text=` formatında, formdan otomatik oluşturulmuş **ön-doldurulmuş Türkçe mesajla** (ad, tarih, ilgilenilen gelinlik) WhatsApp'ı açar. Ayrıca formu atlayan kullanıcılar için FAB üzerinden her zaman erişilebilir.
4. **Bildirimler:** yöneticiye e-posta + opsiyonel WhatsApp Business API / Twilio anlık bildirim (Faz 2).

**Örnek `wa.me` prefill mesajı:**

```
Merhaba, Celine Gelinlik. Randevu talebim var.
Ad Soyad: {ad}
Tarih: {tarih}
İlgilendiğim model: {modelAdı}
```

```
https://wa.me/<numara>?text=Merhaba%2C%20Celine%20Gelinlik.%20Randevu%20talebim%20var.%20...
```

### Yönetici ne görür (admin özeti)

Randevu taleplerinin basit bir listesi/dashboard'u — kolonlar: **tarih alındı · ad · telefon · tercih tarih/saat · ilgilenilen gelinlik/koleksiyon · mesaj · durum (Yeni / Arandı / Onaylandı / İptal)**. Aksiyonlar: durumu değiştir, tıkla-WhatsApp, tıkla-ara, not alanı. Yeni talep e-posta/bildirimi.

- **Faz 1 (MVP) minimum:** e-posta + hafif DB tablosu (kayıtlar).
- **Faz 2:** tam admin UI (durum yönetimi, click-to-WhatsApp/call, notlar), spam koruması (honeypot/recaptcha).

Detaylar için [Admin](ADMIN.md).

---

## 5. İçerik Modeli (sayfa → API verisi)

Aşağıda her sayfanın API'den çektiği veri özetlenmiştir. Şema detayları için [Veri Modeli](DATA-MODEL.md).

**Global / Ayarlar** (`site_settings`): logo, marka sloganı (TR), adres, telefon, `whatsappNumber`, e-posta, `workingHours[]`, `instagramUrl`, `mapEmbedUrl`, `socialLinks[]`, KVKK metni.

**Anasayfa** (`home` singleton): `heroImage` (tek editoryal foto — carousel/video yok), `heroTitle`, `heroSubtitle`, `heroPrimaryCta` ("Randevu Al"), `heroSecondaryCta` ("Koleksiyonu Keşfet"), `introText`, `featuredDresses[]` (→ Dress), `collectionsTeaser[]` (→ Collection), `storyStrip{image, title, text, link}` (KT "Our Story" split → /atolye), `processSteps[]`, `instagramFeed[]` (IG API/cache), `ctaBand{text}`.

**Koleksiyon** (`collection`): `slug`, `name`, `season`, `year`, `coverImage`, `story`/`description`, `orderIndex`, `dresses[]` (→ Dress), `galleryImages[]`.

**Model / Gelinlik** (`dress`): `slug`, `name`, `collectionRef`, `images[]` (sıralı), `shortDescription`, `attributes{silhouette, fabric, neckline, color, details, backStyle}`, `tags[]`, `featured` (bool), `relatedDresses[]`. **Fiyat alanı yok.**

**Atölye** (`about` singleton): `heroImage`, `story` (rich text), `founderQuote`, `craftText`, `craftImage`, `atelierImages[]`. (Couture `processSteps[]` artık Özel Dikim modelinde.)

**Özel Dikim** (`custom` singleton): `heroImage`, `intro`, `processSteps[]` (İstişare → Tasarım/Eskiz → Prova → Dikim/Teslim), `timelineNote` (~6–12 ay), `remoteConsultText` (şehir dışı video görüşme), `ctaBand{text}`.

**Gerçek Gelinler** (`realBrides`): `items[]{image, quote?, brideName?, dressRef?}`.

**İletişim** (`site_settings`'ten): `address`, `phone`, `whatsapp`, `email`, `workingHours`, `mapEmbedUrl`.

**Galeri** (`gallery`): `images[]{url, caption?, collectionRef?}`, `filters`.

**Randevu** (`appointment` — yazma modeli): `id`, `createdAt`, `name`, `phone`, `email`, `preferredDate`, `preferredTimeSlot`, `interestedDressRef`/`collectionRef`, `message`, `kvkkConsent`, `status`.

**SSS** (`faq`): `items[]{question, answer, order}`.

---

## 6. Türkçe Copy Tonu ve Microcopy

**Ton:** zarif, sıcak, sakin, davetkâr; satış baskısı yok. Kısa cümleler, şiirsel ama abartısız. Nazik **siz** dili. Ünlem yok, capslock yok. Anahtar hisler: el emeği, kişiye özel, atölye deneyimi, güven.

### Hero örnekleri

- "Hayatınızın en özel gününe, size özel bir gelinlik."
- "Her ilmek, sizin hikâyeniz için."
- "El emeği, kişiye özel gelinlikler."

### CTA örnekleri

- **Birincil:** "Randevu Alın" · "Atölyede Buluşalım"
- **İkincil:** "WhatsApp'tan Yazın" · "Koleksiyonu Keşfedin" · "Bu Gelinlik İçin Randevu Alın"
- **Nazik yönlendirme:** "Detaylı bilgi için sizi atölyemizde ağırlamaktan mutluluk duyarız."

### Randevu örnekleri

- **Form başlığı:** "Sizi atölyemizde ağırlamak isteriz."
- **Alt not:** "Formu doldurun, en kısa sürede size dönelim. Dilerseniz WhatsApp'tan da yazabilirsiniz."
- **Onay:** "Talebiniz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz."
- **Fiyat notu (model detay):** "Fiyat ve detaylar için sizi randevuyla ağırlıyoruz."

### Koleksiyon / Atölye örnekleri

- "Her koleksiyon, bir mevsimin ve bir duygunun hikâyesi."
- "Atölyemizde her gelinlik, tek bir gelin için özenle hazırlanır."

---

## 7. Faz Özeti (bu doküman kapsamında)

- **Faz 1 (MVP):** Anasayfa, Koleksiyonlar, Koleksiyon detay, Model/Gelinlik (Gelinlikler) detay, Özel Dikim, Atölye, Randevu (+onay), İletişim. Global header/footer, WhatsApp FAB, randevu CTA bandları. Randevu formu → API + yönetici e-posta bildirimi + `wa.me` prefill fallback. (Gerçek Gelinler MVP'de placeholder ile açılabilir.)
- **Faz 2:** Gerçek Gelinler (zengin içerik), Galeri/Lookbook, SSS, KVKK/Gizlilik + çerez banner'ı, tam admin dashboard, canlı Instagram besleme, lightbox, WhatsApp Business API/Twilio bildirim, form spam koruması.
- **Faz 3:** Basında Biz, TR/EN çok dilli, gelişmiş SEO + schema.org, randevu için takvim/slot senkronizasyonu.

Detaylı yol haritası için [Yol Haritası](ROADMAP.md).

---

**İlgili dokümanlar:** [Tasarım](DESIGN.md) · [Admin](ADMIN.md) · [Veri Modeli](DATA-MODEL.md) · [Mimari](ARCHITECTURE.md) · [SEO](SEO.md) · [Yol Haritası](ROADMAP.md)
