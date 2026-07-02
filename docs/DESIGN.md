# Tasarım Sistemi & Görsel Dil — Celine Gelinlik

> Bu belge, **Celine Gelinlik** vitrin sitesinin (celinegelinlik.com) tasarım felsefesini, görsel dilini ve bileşen kütüphanesini tanımlar. Amaç lüks, minimal, fotoğraf öncelikli bir gelinlik atölyesi deneyimi kurmaktır; e-ticaret, sepet ve fiyat yoktur. Birincil dönüşüm hedefi **atölye randevusu / WhatsApp** iletişimidir.
>
> İlgili belgeler: [Sayfalar](PAGES.md) · [Veri Modeli](DATA-MODEL.md) · [Mimari](ARCHITECTURE.md) · [Admin](ADMIN.md) · [SEO](SEO.md) · [Deployment](DEPLOYMENT.md) · [Yol Haritası](ROADMAP.md)

---

## 1. Tasarım İlkeleri

Celine Gelinlik'in tasarımı tek bir cümlede özetlenebilir: **fotoğraf üründür, arayüz susar.** Sayfanın görsel ağırlığının yaklaşık **%80'i fotoğraftır**; tipografi, boşluk ve ince çizgiler geri kalan %20'yi taşır. Aşağıdaki sekiz ilke tüm tasarım kararlarının anayasasıdır.

1. **Photo-first (fotoğraf öncelikli).** Her ekranda ilk gördüğünüz şey gelinlik fotoğrafıdır. Chrome (menü, buton, etiket) fotoğrafı çerçeveler, onunla yarışmaz. Renk, gelinliğin (çoğunlukla ivory/beyaz) kendisinden gelir; arayüz sıcak nötr tonlarda kalır.
2. **Minimalizm & editorial.** Bir gelinlik dergisinin sayfaları gibi düşünün: geniş boşluk, tek sütunlu anlatı blokları, numaralanmış "look"lar. E-ticaret gürültüsü (filtre çubukları, "133 sonuç", "Sırala") yoktur.
3. **Tiny radius.** Köşeler neredeyse keskin. Buton ve input `rounded-sm` (2px), fotoğraf ve kartlar `rounded-none`. Keskin editorial köşeler markanın imzasıdır.
4. **Almost no shadow.** Gölge yerine derinlik **hairline border** ve ton farkıyla kurulur. `shadow-lg` / `shadow-xl` yasaktır. Sadece mobil Sheet, Dialog/lightbox ve Sonner toast tek bir fısıltı gölge kullanabilir.
5. **Slow, elegant motion.** Hareket yavaş ve yumuşaktır; standart süre `0.6–0.9s`, easing `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out). Reveal-on-scroll ve yavaş fade dışında hareket minimumda tutulur.
6. **İki yazı tipi, dört-beş renk.** Bir serif display (Cormorant Garamond) + bir sans body (Inter). Palet sıcak ivory + sıcak charcoal + champagne/taupe + hairline rose-gold ile sınırlıdır.
7. **Dönüşüm sessiz ama her yerde.** "Randevu Al / Atölye Ziyareti" CTA'sı bir e-ticaret sitesinin "Sepete Ekle" butonu gibi davranır: nav'da, footer'da ve section aralarında tekrar eder — ama abartısız, zarif.
8. **Mobil önce, art-directed.** Yatay hero görselini mobile sıkıştırmak yerine breakpoint başına ayrı görsel/kırpma sunulur. Mobil deneyim lüks için artık standarttır.

---

## 2. Dünya Çapında Referans Siteler & "Ne Çalınır"

Aşağıdaki couture markaları benchmark alındı. Her biri için sitesinden alınacak somut fikir ("ne çalınır") not edildi. Kaynaklar Temmuz 2026'da canlı olarak incelendi.

| Marka | URL | Ne çalınır |
|---|---|---|
| **Pronovias** | https://www.pronovias.com/ | Cihaza göre art-directed full-bleed **video** (ayrı desktop/mobil asset). "Book your appointment" CTA'sının üç bölgede (üst nav + footer + inline banner) tekrarlanması. Randevu sürekli ama sessizce görünür. |
| **Galia Lahav** | https://www.galialahav.com/ | Manuel play/pause'lu full-bleed hero. **Üç katmanlı mimari** (Couture / imza hattı / Heritage-arşiv). Celine için "Couture / Koleksiyon / Arşiv" modeline uyarlanabilir. |
| **Vera Wang Bride** | https://www.verawangbride.com/int_en/ | Ürün gridinden ayrı **`/editorial` bölümü**; koleksiyonlar estetik ifade olarak sunulur ("Sculpted Romance"). Vitrin sitesi için editorial-vs-katalog ayrımı ideal. |
| **Elie Saab (Bridal)** | https://eliesaab.com/pages/bridal-spring-2027 | **Numaralı look'lar** ("LOOK 1, LOOK 2…"), minimum metin, sezonlar arası geçiş için yatay carousel. Her koleksiyonu mağaza değil galeri sergisi gibi ele alır. |
| **Monique Lhuillier** | https://moniquelhuillier.com/pages/lookbook-bridal-fall-2026 | Sayaçlı (1/20) full-bleed tek görsel carousel; ~%70 görsel / %30 metin. Her gelinliğe **isim + kısa romantik açıklama kartı** (kumaş/konstrüksiyon). |
| **Reem Acra** | https://www.reemacra.com/ | **Sabit görsel hero** (video değil) + şiirsel başlık. Koleksiyonlar sezon yerine **çağrışımlı tema adlarıyla** ("Laces & Petals", "Blooms") organize; süresi dolmaz. "Appointments" doğrudan nav'da. |
| **Berta** | https://www.berta.com/ | Her gelinlik "bağımsız bir sanat eseri" olarak; alt hatlar (Berta / Muse / Privée). **Gerçek gelin görselleri + testimonial**'ların lüks düzene örülmesi. |
| **Zuhair Murad** | https://www.zuhairmurad.com/ | Her koleksiyona sadece isim değil bir **hikâye** (Spring 2027 = "Romeo and Juliet in Verona"). Katalog değil dergi gibi okunan metin. |
| **Sassi Holford** | https://sassiholford.com/ | Tek-tasarımcı butik benchmark'ı: büyük görseller, çok az chrome. **Kısıtlama (restraint)** — Celine'in en yakın akranı. |
| **Mary Trufel (Awwwards)** | https://www.awwwards.com/sites/bridal-shop-mary-trufel/ | **Tek sayfa** dikey galeri ile küçük bir butiğin ödül kazanabileceğinin kanıtı. Derin katalog gerekmez. |

Ek referanslar: Rosa Clará (rosaclara.es), Galia Lahav GALA hattı, Joyce Young / Wedding Atelier.

### Celine için tavsiye edilen yön: **Reem Acra / Sassi Holford modeli**

- **Full-bleed sabit görsel hero** + şiirsel başlık (yalnızca profesyonel çekim varsa video).
- Koleksiyonlar **tema adlarıyla** (sezon değil) — "2024 Koleksiyonu" gibi bayatlayan etiketlerden kaçınılır.
- **İsimli gelinlikler** (ör. "Aylin"); her modelin kısa romantik açıklaması + ön/arka/detay görselleri (`/modeller/[dressSlug]`).
- Palet: **sıcak ivory + sıcak charcoal**, aksan olarak yalnızca **rose-gold/champagne hairline**.
- Tipografi: **Cormorant Garamond display + Inter body** (romantik yön; couture markanın Maltepe kimliğine uygun).
- Hareket: yalnızca **fade + reveal-on-scroll**.
- **"Randevu Al / Atölye Ziyareti"** nav + footer + inline'da kalıcı.
- Sığ çok-sayfalı galeri; sepet yok, fiyat yok, filtre yok.

---

## 3. Renk Paleti

Sıcak nötr zemin + sıcak charcoal metin. Toplam ~4-5 ton. Kural: **%90 sıcak ivory/champagne/taupe + sıcak charcoal metin; metalik yalnızca hairline aksan.** Rengi gelinlik fotoğrafları (çoğunlukla ivory/beyaz) taşır.

### 3.1 Token seti (hex referanslı)

| Token | Hex | Kullanım |
|---|---|---|
| `--background` | `#F7F3EC` | Ana sıcak ivory zemin (canonical) |
| `--foreground` | `#1C1A17` | Sıcak charcoal metin (asla saf `#000`) |
| `--card` | `#FFFFFF` | Kart/fotoğraf çerçevesi zemini |
| `--muted` | `#EFEAE1` | Yumuşak champagne-gri dolgu |
| `--muted-foreground` | `#8A8175` | Sıcak taupe ikincil metin |
| `--border` | `#E4DDD0` | Belli belirsiz champagne hairline |
| `--input` | `#E4DDD0` | Form input kenarlığı |
| `--ring` | `#B99C74` | Champagne focus ring |
| `--accent` | `#C6A664` | Champagne-gold — çok az kullanılır |
| `--secondary` | `#EADDC9` | Champagne/sand ikincil yüzey |
| `--primary` | `#1C1A17` | Sıcak charcoal = birincil CTA |
| `--primary-foreground` | `#F7F3EC` | CTA üstü metin |
| `--destructive` | `#8B3A3A` | Kısık şarap tonu (asla parlak kırmızı) |
| Rose-gold hairline | `#B76E79` | Yalnızca ince çizgi/ayraç aksanı |
| Mocha Mousse (opsiyonel) | `#A47864` | Sıcak orta nötr, editorial vurgu |

**Aksan kuralı:** `--accent` (`#C6A664`) ve rose-gold (`#B76E79`) yalnızca şunlarda kullanılır: focus ring, aktif nav altı çizgi, form başarı durumu, section eyebrow altındaki tek hairline ayraç. **Asla buton dolgusu, asla gradient.**

**Dark mode yok.** Lüks gelinlik markası varsayılan olarak dark mode ile gelmez; tek light tema.

### 3.2 Tailwind v4 `@theme` bloğu

Tailwind v4 ile renkler doğrudan `@theme` içinde CSS değişkeni olarak tanımlanır (`globals.css`):

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  --background:           #F7F3EC; /* sıcak ivory */
  --foreground:           #1C1A17; /* sıcak charcoal */
  --card:                 #FFFFFF;
  --card-foreground:      #1C1A17;
  --popover:              #FFFFFF;
  --popover-foreground:   #1C1A17;
  --muted:                #EFEAE1; /* champagne-gri dolgu */
  --muted-foreground:     #8A8175; /* taupe metin */
  --border:               #E4DDD0; /* champagne hairline */
  --input:                #E4DDD0;
  --ring:                 #B99C74; /* champagne focus ring */
  --accent:               #C6A664; /* champagne-gold, seyrek */
  --accent-foreground:    #1C1A17;
  --secondary:            #EADDC9; /* champagne/sand */
  --secondary-foreground: #1C1A17;
  --primary:              #1C1A17; /* charcoal CTA */
  --primary-foreground:   #F7F3EC;
  --destructive:          #8B3A3A; /* kısık şarap */
  --hairline-gold:        #B76E79; /* rose-gold aksan çizgisi */
  --radius:               0.125rem; /* 2px — editorial tiny radius */
}

@theme inline {
  --color-background:           var(--background);
  --color-foreground:           var(--foreground);
  --color-card:                 var(--card);
  --color-card-foreground:      var(--card-foreground);
  --color-popover:              var(--popover);
  --color-popover-foreground:   var(--popover-foreground);
  --color-muted:                var(--muted);
  --color-muted-foreground:     var(--muted-foreground);
  --color-border:               var(--border);
  --color-input:                var(--input);
  --color-ring:                 var(--ring);
  --color-accent:               var(--accent);
  --color-accent-foreground:    var(--accent-foreground);
  --color-secondary:            var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-primary:              var(--primary);
  --color-primary-foreground:   var(--primary-foreground);
  --color-destructive:          var(--destructive);

  --font-serif: var(--font-cormorant), Georgia, serif;
  --font-sans:  var(--font-inter), system-ui, sans-serif;

  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);

  --tracking-eyebrow: 0.18em;
  --ease-editorial: cubic-bezier(0.22, 1, 0.36, 1);
  --spacing-editorial: 42rem; /* editorial metin bloğu max genişlik */
}
```

> Not: shadcn/ui varsayılan olarak `oklch` üretebilir; berraklık için burada hex verildi. Değerleri `oklch`'e çevirmek serbesttir, canonical palet hex ile sabittir.

---

## 4. Tipografi

**Cormorant Garamond** (serif display, yıldız) + **Inter** (sans body, sessiz partner). Cormorant delikat ve couture; Inter nötr ve geniş dil desteğine sahip.

### 4.1 Eşleştirme kuralları

- **Serif YALNIZCA** H1–H3, koleksiyon adları, gelinlik adları ve pull-quote'larda. Weight 300–500.
- **Sans**: nav, body, buton, form label ve tüm mikro-metin. Weight 300–400.
- Büyük serif başlıklarda sıkı satır aralığı (`tracking-tight`), küçük sans eyebrow etiketlerinde geniş harf aralığı (`letter-spacing: 0.18em`, uppercase).
- Lüks sinyalleri: büyük tip ölçeği, serif display'de sıkı leading, küçük uppercase etiketlerde cömert tracking, lowercase/smallcaps nav.

### 4.2 Türkçe glyph subset

Türkçe karakterler (İ, ı, ğ, ş, ç, ö, ü) için **latin + latin-ext** subset zorunludur. Yalnızca `latin` subset'i Türkçe glyph'leri eksik bırakır.

### 4.3 `next/font` yapılandırması

Fontlar `next/font/google` ile self-host edilir; `display: "swap"` ile görünmez metin (FOIT) önlenir, otomatik preload yapılır.

```ts
// app/fonts.ts
import { Cormorant_Garamond, Inter } from "next/font/google";

export const serif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"], // latin-ext → Türkçe glyph desteği
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

export const sans = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
  display: "swap",
});
```

```tsx
// app/[locale]/layout.tsx
import { serif, sans } from "@/app/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
```

> Performans: en fazla 2–3 weight yükleyin. Ek weight her biri ekstra ağırlık demektir.

---

## 5. Bileşen Haritası (Section Bazında)

Stack: Next.js 16 (App Router) + shadcn/ui + Tailwind v4 + Framer Motion + Magic UI + (sınırlı) Aceternity. Aşağıdaki tablo her section için **kesin shadcn/ui bileşen adlarını** verir.

| Section | shadcn/ui bileşenleri |
|---|---|
| **Header / desktop nav** | **Navigation Menu** (Koleksiyonlar dropdown → tema adları; Hakkımızda / Randevu / İletişim için düz linkler). **Button** (`ghost`/`link`) "Randevu Al" CTA'sı. Sticky header altında hairline için **Separator**. |
| **Mobil nav** | **Sheet** (`side="right"`) hamburger drawer. İçinde: iç içe Koleksiyonlar için **Accordion**, gruplar arası **Separator**, CTA için **Button**. (Drawer değil Sheet — Drawer alttan vaul stili, nav menüsü için daha az uygun.) |
| **Hero** | Ağır bileşen yok — layout + full-bleed portrait `next/image` + serif H1. Opsiyonel tek **Button** (`outline`, `rounded-sm`) "Koleksiyonları Gör". |
| **Koleksiyon grid** (`/koleksiyonlar`) | Kenarlıksız **Card** (`rounded-none`) veya düz figure grid; portrait kilidi için **Aspect Ratio** (3:4); "Yeni" etiketi için **Badge**; overlay link için **Button**. Kategori filtresi gerekirse **Tabs** / **Toggle Group**. |
| **Gelinlik detay — galeri/lightbox** (`/modeller/[dressSlug]`) | Ana görsel + thumbnail şeridi için **Carousel** (embla, portrait, `loop`); tam ekran lightbox kabuğu için **Dialog** (veya özel lib — bkz §6); Detay / Kumaş / Silüet için **Tabs**; bakım SSS için **Accordion**; kare stabilitesi için **Aspect Ratio**. |
| **Lookbook / Galeri** (Phase 2, `/galeri`) | Yatay hikâye akışı için **Carousel** VEYA `next/image` ile basit masonry. **Separator** + serif alt yazılar. |
| **Hakkımızda** (`/hakkimizda`) | Typography (prose), **Separator**, atölye/kurucu portresi için **Aspect Ratio**. İnteraktif bileşen gerekmez. |
| **Randevu formu** (`/randevu`) | **Form** (react-hook-form + zod) sarmalar: **Input** (ad, e-posta, telefon), **Popover** içinde **Calendar** (tarih), **Select** (randevu tipi), **Textarea** (notlar), **Checkbox** (KVKK onayı), **Button** (submit, `default` = charcoal). Yapı için **Field**/**Label**. |
| **İletişim** (`/iletisim`) | Adres/harita bloğu; **Separator**; WhatsApp CTA **Button**. Konum: İdealtepe Mah. Panaroma Sok. Defne Apt. No:5 D:7, Maltepe / İstanbul. |
| **Footer** | Düz grid; **Separator**, sosyal ikonlar için lucide-react, WhatsApp/randevu **Button**. |
| **Toasts** | **Sonner** (güncel shadcn toast standardı; legacy `Toast` deprecated). Stil: ivory bg, hairline border, renk patlaması yok; başarı durumu champagne aksan metin. "Randevu talebiniz alındı", form hataları için. |

Ayrıca faydalı: **Skeleton** (grid'de görsel yükleme placeholder'ı), **Hover Card** (detay görünümünde kumaş/tasarımcı bilgisi), **Tooltip** (ölçü ipuçları).

### 5.1 Magic UI — kullanılacak efektler (3-5, kısıtlı)

| Efekt | Nerede | Neden |
|---|---|---|
| **Blur Fade** | Koleksiyon grid öğeleri ve detay görselleri scroll'a girerken (`inView`, küçük `yOffset={8}`, staggered `delay`). | Markanın imza yavaş/zarif reveal'ı. |
| **Marquee** | Footer yakınında veya section araları için tek, yavaş, düşük opasiteli tema adı / basın logosu bandı ("VOGUE · BRIDES"). `pauseOnHover`, yavaş hız. | Gürültüsüz editorial doku. |
| **Text Animate** *(veya Text Reveal)* | Hero H1 / section eyebrow: yüklemede satır bazında fade+blur (`animation="blurInUp"`, `by="line"`). | Serif display'e eşlik eden couture tipografik giriş. |
| **Progressive Blur** | Full-bleed hero/lookbook görselinin altında overlay metnin okunabilirliği için yumuşak gradient-blur. | Sert scrim'den daha lüks his. |

**Magic UI'dan KAÇIN:** Meteors, Border Beam, Shine Border, Animated Beam, Particles, Confetti, Sparkles Text, Aurora Text, Neon/Gradient text, Video Text, Magic Card, Glare Hover — hepsi SaaS/gamer hissi verir, bridal değil.

### 5.2 Aceternity UI — 1-2 zarif seçim

- **Lens** (`npx shadcn@latest add @aceternity/lens`) — gelinlik **detay** görselinde büyüteç; gelinler dantel/boncuk işçiliğini inceleyebilir. `zoomFactor ~1.6`, `lensSize ~180`, mouse-follow. Gerçekten katkı sunan tek lüks etkileşim.
- **Parallax Hero Images** — *opsiyonel, yalnızca hareketli hero isteniyorsa*: 2-3 katmanlı portrait görselinin ince mouse-derinlik parallax'ı. Yer değiştirme çok küçük, hareket yavaş; Blur Fade ile yarışırsa çıkarın. Maksimum kısıtlama için sabit full-bleed hero tercih edilir.

**Kesinlikle KAÇIN:** Background Beams / Beams with Collision, Meteors, Glowing/Moving Border, Background Lines, Card Spotlight, Google Gemini Effect, Comet Card, Colourful Text, World Map, 3D Card, Background Ripple — her glow/beam/spotlight editorial minimalizmi bozar.

---

## 6. Galeri / Lightbox Yaklaşımı (Portrait Fotoğraflar)

**Öneri:** birincil lightbox olarak **`yet-another-react-lightbox` (YARL)**, detay sayfasındaki inline thumbnail/şerit gezinme için **shadcn Carousel** (embla).

**Neden YARL:**

- Production-grade **klavye navigasyonu** (←/→/Esc/Home/End), **touch swipe + pinch-zoom**, focus trap ve portrait görsel işleme kutudan çıkar. Bunları Dialog + Carousel üzerinde yeniden yazmak hataya açıktır.
- YARL plugin'leri: **Zoom** (boncuk işçiliği için pinch/scroll zoom), **Thumbnails**, **Counter**, **Captions** (gelinlik adı / kumaş). Slideshow/Video kapatılır.
- **Palete stille:** siyah overlay yerine yüksek opasiteli ivory backdrop (`rgba(247,243,236,0.97)`), hairline kontroller, serif caption'lar, `--yarl__*` CSS değişkenleri override. Siyah overlay jenerik hissettirir; ivory markaya sadık kalır.

Inline (modal olmayan) gezinme detay sayfasında ve lookbook'ta **shadcn Carousel** (embla) ile yapılır — klavye okları ve drag/swipe zaten mevcut; opsiyonel `WheelGesturesPlugin`. Herhangi bir slide'a tıklanınca YARL o index'te açılır.

**Ekstra bağımlılıktan kaçınmak zorundaysanız:** **Dialog içinde Carousel** uygulanabilir — Carousel swipe + ok tuşlarını, Dialog Esc + focus trap'i verir — ancak pinch-zoom kaybolur ve thumbnail senkronu + zoom UX'i elle yazılır. Fotoğraf öncelikli bir butik için YARL'ın zoom'u bu bağımlılığa değer.

```tsx
// components/gallery/lightbox.tsx (dinamik import, yalnızca açılınca yüklenir)
import dynamic from "next/dynamic";
const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });
// plugins: Zoom, Thumbnails, Counter, Captions — hepsi dynamic import
```

---

## 7. Hareket (Motion) — Do / Don't

Yönetici ilke (kaynaklardan): **kısıtlama + amaç.** Yavaş arka plan hareketi + sınırlı palet + kısıtlı tip = "classy"; aşırı kullanım gücü tüketir.

### Yap (zarif)

- **Yavaş opacity fade** ve **reveal-on-scroll** (görseller viewport'a girerken fade + hafif yükselme) — en "pahalı" hisseden tek etki.
- Hero görselinde **ince parallax / yavaş zoom (Ken Burns)** — sadece lüks vitrin için, *az ve amaçlı*.
- Sayfa yeniden yüklemesiz yumuşak carousel geçişleri.
- Hero videoda manuel play/pause — kullanıcı kontrolüne saygı.
- Standart süre `0.6–0.9s`, easing `cubic-bezier(0.22, 1, 0.36, 1)`. BlurFade offset küçük (6–10px). Bounce yok, layout'ta spring overshoot yok.

### Yapma (anında ucuzlatır)

- Parlayan/animasyonlu kenarlıklar, "meteor"/kayan yıldız, particle/sparkle.
- Agresif metin animasyonu (harf harf zıplama, typewriter, marquee başlık).
- Hızlı/mide bulandıran parallax, öngörülemez üst üste binen katmanlar, okunabilirliği bozan hareket.
- Sesli autoplay video; çok hızlı otomatik ilerleyen carousel.
- Sayfayı yavaşlatan hareket — performansı düşürüyorsa kesin.

### `prefers-reduced-motion`

OS düzeyinde opt-out **zorunlu** onurlandırılır; lüks kitle cihaz-bilinçli ve harekete duyarlıdır. BlurFade / Text Animate / Lens / Parallax bu tercih arkasında gate'lenir — final durum anında render edilir, transform yok.

```tsx
import { useReducedMotion } from "framer-motion";
const reduce = useReducedMotion();
// reduce === true → animasyonsuz final state döndür
```

---

## 8. Erişilebilirlik, Performans & Amatör Görünüm Tuzakları

### 8.1 Erişilebilirlik

- shadcn primitive'leri Radix tabanlı → Sheet/Dialog/Navigation Menu/Popover/Select doğru role, focus trap, `Esc` ve `aria-*` ile gelir. `SheetTitle`/`DialogTitle` her zaman bulunmalı (gerekirse `sr-only`), yoksa Radix uyarır ve ekran okuyucular bağlamı kaybeder.
- **Kontrast:** `muted-foreground #8A8175`, `#F7F3EC` üzerinde ≈ 3.4:1 — yalnızca büyük/ikincil metin için kabul edilebilir. Body metin **`foreground #1C1A17`** kullanmalı (>15:1). Body metni asla ivory üzerinde champagne aksana ayarlanmaz (AA'yı geçemez).
- Champagne **focus ring** (`--ring`) görünür kalmalı — outline kaldırılmaz. Tam klavye gezintisi test edilir: nav → grid → lightbox → form.
- Her gelinlik görseli açıklayıcı `alt` alır (silüet + kumaş), "IMG_001" değil. Dekoratif Marquee metni `aria-hidden`. Carousel/lightbox pozisyonu Counter ile duyurulur.
- Form: gerçek `<Label htmlFor>` (shadcn Field/Label), `aria-describedby` ile bağlı inline zod hataları; Sonner hataları form içinde de gösterilir (toast tek başına ekran okuyucu için yetmez).

### 8.2 Performans

- Her yerde `next/image`: portrait gelinlik çekimleri AVIF/WebP, breakpoint başına `sizes`, açık width/height (Aspect Ratio ile) → CLS sıfır. Hero görseli `priority`; fold altı lazy.
- **Skeleton** placeholder + grid'de `placeholder="blur"` blur-up.
- Yalnızca kullanılan shadcn bileşenleri yüklenir (copy-in modeli = şişme yok). YARL ve plugin'leri `next/dynamic` (`ssr: false`) ile yalnızca lightbox açılınca yüklenir.
- Fontlar `next/font` ile self-host, `display: "swap"` + preload; `latin` + `latin-ext` subset; 2–3 weight ile sınırlı.
- Framer Motion: yalnızca `transform`/`opacity` (GPU dostu); layout/box-shadow animasyonundan kaçının. Magic UI kullanımını 4 adlı efektle sınırlayın (scroll'da animation-thrash önlenir).
- Marquee: saf CSS transform döngüsü, `will-change: transform`, ekran dışında duraklat.

### 8.3 Amatör görünüm tuzakları (pitfalls)

1. **Düşük kaliteli / tutarsız fotoğraf.** Fotoğraf ürünün ta kendisi (%80). Karışık ışık, telefon çekimi, değişen kırpmalar anında öldürür. Tek art-directed çekim, tutarlı ton/kırpma şart.
2. **Sadece poz veren "styled-shoot" hissi.** Yalnızca hero pozu, detay/arka/kumaş görünümü yoksa sahte durur. Arka görünüm, kumaş yakın çekimi, gerçek provalar gösterilir.
3. **Güzel ama dönüşmeyen.** Övülen tasarım, sıfır talep. Sayfa "Randevu Al"a *yönlendirmeli*; net ve tekrar eden CTA olmadan tek işini başaramaz.
4. **Vitrini mağaza gibi ele almak.** SKU, fiyat, "Sepete Ekle", filtre/sıralama chrome'u ("133 sonuç, Sırala") e-ticarete aittir; butik atölyeye değil. İsimli gelinlik + "randevu/iletişim" kullanılır.
5. **Art-directed olmayan responsive.** Yatay hero'yu mobile sıkıştırmak. Lüks markalar ayrı mobil asset gönderir.
6. **Çok fazla font / çok fazla renk.** 2'den fazla tip veya yoğun palet olmaz. Bir serif + bir sans; ivory + charcoal.
7. **Dağınık navigasyon.** Derin e-ticaret mega-menü yerine minimal nav (Koleksiyonlar / Modeller / Hakkımızda / Randevu) ve tek-sayfa scroll kazanır.
8. **Ucuz hareket** (§7) ve template görünümlü stock görsel.
9. **Zayıf mobil deneyim.** Mobil-öncelikli akışkan düzen lüks için artık standart; sadece-desktop tasarım tarih kokar.

---

## Kaynaklar

[Pronovias](https://www.pronovias.com/) · [Galia Lahav](https://www.galialahav.com/) · [Vera Wang Bride](https://www.verawangbride.com/int_en/) · [Elie Saab Bridal](https://eliesaab.com/pages/bridal-spring-2027) · [Monique Lhuillier Lookbook](https://moniquelhuillier.com/pages/lookbook-bridal-fall-2026) · [Reem Acra](https://www.reemacra.com/) · [Berta](https://www.berta.com/) · [Zuhair Murad](https://www.zuhairmurad.com/) · [Sassi Holford](https://sassiholford.com/) · [Awwwards – Mary Trufel](https://www.awwwards.com/sites/bridal-shop-mary-trufel/) · [shadcn/ui components](https://ui.shadcn.com/docs/components) · [shadcn Sonner](https://ui.shadcn.com/docs/components/sonner) · [Magic UI](https://magicui.design/docs/components) · [Magic UI Blur Fade](https://magicui.design/docs/components/blur-fade) · [Magic UI Marquee](https://magicui.design/docs/components/marquee) · [Aceternity Lens](https://ui.aceternity.com/components/lens) · [Aceternity Parallax Hero Images](https://ui.aceternity.com/components/parallax-hero-images) · [yet-another-react-lightbox](https://yet-another-react-lightbox.com/)
