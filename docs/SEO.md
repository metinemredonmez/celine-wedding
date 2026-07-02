# SEO, Performans, Analitik ve Yasal (KVKK)

Bu doküman **Celine Gelinlik** vitrin sitesinin (celinegelinlik.com) SEO stratejisini, performans hedeflerini, analitik/dönüşüm ölçümünü, WhatsApp + Instagram entegrasyonunu ve KVKK uyumunu tanımlar. Site **e-ticaret değildir**: sepet yok, fiyat yok. Birincil dönüşüm hedefi **atölye randevusu** ve **WhatsApp** üzerinden iletişimdir.

Görsel optimizasyonunun teknik uygulaması (Next.js `next/image`, Cloudinary `f_auto`, ISR) için bkz. [Mimari](ARCHITECTURE.md). Sayfa yapısı ve rotalar için bkz. [Sayfalar](PAGES.md). Veri modeli için bkz. [Veri Modeli](DATA-MODEL.md).

---

## 1. Yerel SEO — Butik Gelinlik (Maltepe / İstanbul)

### Neden bir vitrin sitesinin de içeriğe ihtiyacı var?

Google güzel galerileri değil, **sayfaları** sıralar. Salt görsel duvarı olan bir site, tarayıcılara (crawler) indeksleyecek çok az şey sunar ve "gelinlik Maltepe" gibi aramalarda görünmez. Bu yüzden Celine Gelinlik'in ihtiyacı olan şey:

- İndekslenebilir Türkçe metin (koleksiyon ve model açıklamaları, hakkımızda, iletişim).
- Her koleksiyon/hizmet için ayrı, anlamlı URL'ler.
- Yerel harita paketi ("Map Pack") ve "yakınımdaki gelinlikçi" aramalarında çıkmak için bir **Google Business Profile**.

### Türkçe anahtar kelime hedefleme

Anahtar kelimeleri tek bir ana sayfaya yığmak yerine **ayrı sayfalara** eşleyin (bir koleksiyon veya hizmet = bir URL).

| Grup | Anahtar kelimeler | Eşlenecek sayfa |
|---|---|---|
| Birincil | `gelinlik`, `butik gelinlik`, `gelinlik Maltepe`, `gelinlik İstanbul`, `Maltepe gelinlikçi`, `gelinlik modelleri 2026` | `/`, `/koleksiyonlar`, `/modeller` |
| Uzun kuyruk / niyet | `özel dikim gelinlik İstanbul Anadolu Yakası`, `gelinlik provası randevu`, `abiye / nişanlık Maltepe`, `prenses model gelinlik` | Koleksiyon/model detay, `/randevu` |
| Marka | `Celine Gelinlik`, `Celine Gelinlik Maltepe` | `/`, `/hakkimizda` |

> Not: Site kiralama/fiyat içermez; içerik "özel dikim", "atölye", "randevu ile prova" temalı Türkçe metinlerle beslenir.

### On-page metadata (sayfa başına, Türkçe)

Next.js App Router `generateMetadata` kullanılarak her sayfaya özel `title` / description / OG / Twitter kartları üretilir.

- **`<title>`** (≤ 60 karakter): örn. `Butik Gelinlik Maltepe | Celine Gelinlik | İstanbul`
- **`<meta name="description">`** (~150 karakter, fayda + konum + CTA): örn. `Maltepe'de özel dikim ve butik gelinlik. Atölye randevusu alın, koleksiyonumuzu keşfedin.`
- Her sayfada **tek bir `<h1>`**, hedef terimi içerir.
- Temiz, anahtar kelimeli URL'ler: `/koleksiyonlar/prenses-gelinlik`, `/modeller/dantel-detayli-a-kesim`.
- **OG görseli**: sosyal paylaşımlarda öne çıkması için güzel bir gelinlik fotoğrafı.

```ts
// apps/web — örnek generateMetadata (koleksiyon detay)
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const koleksiyon = await getKoleksiyon(params.slug);
  return {
    title: `${koleksiyon.ad} | Celine Gelinlik | Maltepe İstanbul`,
    description: koleksiyon.seoDescription, // ~150 karakter, konum + CTA
    alternates: { canonical: `https://celinegelinlik.com/koleksiyonlar/${params.slug}` },
    openGraph: {
      title: `${koleksiyon.ad} — Celine Gelinlik`,
      images: [{ url: koleksiyon.ogImage, width: 1200, height: 630 }],
      locale: "tr_TR",
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}
```

### Yapısal veri (JSON-LD): BridalShop / LocalBusiness

schema.org `LocalBusiness`'in daha spesifik alt tipi olan **`BridalShop`** kullanılır (Google daha spesifik tipi önerir; `ClothingStore` da geçerli bir alternatiftir ancak butik gelinlik için `BridalShop` en isabetlisi). Ana sayfa/iletişim sayfasına yerleştirilir; iç sayfalara `BreadcrumbList` eklenir.

Zorunlu/önerilen alanlar: `name`, `image`, `logo`, `@id`, `url`, `telephone`, tam `address` (PostalAddress — Maltepe/İstanbul), `geo` (lat/lng), `openingHoursSpecification`, `areaServed` (İstanbul Anadolu Yakası), `sameAs` (Instagram/Facebook) ve Google yorumları biriktikçe `aggregateRating`.

```json
{
  "@context": "https://schema.org",
  "@type": "BridalShop",
  "@id": "https://celinegelinlik.com/#business",
  "name": "Celine Gelinlik",
  "url": "https://celinegelinlik.com",
  "image": "https://celinegelinlik.com/og/celine-atolye.jpg",
  "logo": "https://celinegelinlik.com/logo.png",
  "telephone": "+90XXXXXXXXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "İdealtepe Mah. Panaroma Sok. Defne Apt. No:5 D:7",
    "addressLocality": "Maltepe",
    "addressRegion": "İstanbul",
    "postalCode": "34XXX",
    "addressCountry": "TR"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 40.9XXX, "longitude": 29.1XXX },
  "areaServed": "İstanbul Anadolu Yakası",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "opens": "10:00",
      "closes": "19:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/celinegelinlik",
    "https://www.facebook.com/celinegelinlik"
  ]
}
```

### Google Business Profile (GBP) + NAP tutarlılığı

Yerel görünürlükte **en yüksek getirili** adımdır ve Celine'i harita paketine sokan şeydir.

- Profili oluşturun/sahiplenin, **Maltepe adresini doğrulayın**.
- Doğru kategori: **"Gelinlik mağazası" (Bridal shop)**.
- Çalışma saatleri, telefon, WhatsApp ve fotoğraflar eklenir.
- **NAP (Name / Address / Phone)** web sitesi, GBP ve dizinlerde **birebir aynı** olmalıdır. Adres tam olarak: `İdealtepe Mah. Panaroma Sok. Defne Apt. No:5 D:7, Maltepe / İstanbul`.

### Yorumlar (reviews)

Aktif olarak Google yorumu toplayın. Yorumlar hem yerel sıralamayı hem tıklama oranını yükseltir. Yeterli yorum biriktiğinde JSON-LD'ye `aggregateRating` eklenir. Prova sonrası mutlu gelinlerden yorum istemek en etkili yöntemdir.

---

## 2. Sitemap / robots / indeksleme

- **`sitemap.xml`** Next.js `app/sitemap.ts` ile üretilir; tüm kanonik public rotaları (`/`, `/koleksiyonlar`, `/koleksiyonlar/[slug]`, `/modeller`, `/modeller/[dressSlug]`, `/randevu`, `/iletisim`, `/hakkimizda`) içerir.
- **`robots.txt`** Next.js `app/robots.ts` ile üretilir; taramaya izin verir ve sitemap'e işaret eder. `/admin/*` taramadan hariç tutulur.
- Her ikisi de **Google Search Console**'a (ve Bing Webmaster'a) gönderilir; alan adı doğrulanır ve önemli sayfalar için indeksleme talep edilir.
- **Canonical** etiketleri her sayfada tanımlanır (yinelenen içerik/parametre sorunlarını önlemek için).

```ts
// apps/web/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production";
  return {
    rules: isProd
      ? { userAgent: "*", allow: "/", disallow: "/admin" }
      : { userAgent: "*", disallow: "/" }, // staging: her şeyi engelle
    sitemap: "https://celinegelinlik.com/sitemap.xml",
  };
}
```

### Staging noindex

Staging alan adı **kesinlikle indekslenmemelidir**. İki katmanlı önlem:

1. `robots.ts` production dışı ortamlarda tüm taramayı engeller (yukarıdaki örnek).
2. Staging host'unda tüm yanıtlara **`X-Robots-Tag: noindex`** HTTP header'ı eklenir (ör. `next.config` headers veya reverse-proxy düzeyinde).

---

## 3. Görsel SEO

Bridal sektöründe **Google Görseller** ciddi bir trafik kaynağıdır; görsel SEO ihmal edilmemelidir.

- **Alt text**: Türkçe, açıklayıcı ve anahtar kelimeli. Örn.
  `alt="Dantel detaylı prenses model butik gelinlik - Maltepe"`
- **Dosya adları**: açıklayıcı ve tirelemeli. Örn.
  `prenses-gelinlik-maltepe.avif`, `dantel-a-kesim-gelinlik.avif`
- **Image sitemap** eklenir (veya her görsele `ImageObject` schema.org işaretlemesi). Bu, gelinlik fotoğraflarının Google Görseller'de bulunmasını sağlar.
- Alt text ve dosya adı verileri admin panelinden model/koleksiyon kaydına girilir; bkz. [Admin](ADMIN.md) ve [Veri Modeli](DATA-MODEL.md).

---

## 4. Performans — Core Web Vitals

Site fotoğraf ağırlıklıdır; performansın "make-or-break" noktası **hero/LCP görseli**dir.

### Hedefler

| Metrik | Google "good" eşiği | Celine hedefi |
|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5 s | **< 1.2 s** (büyük hero fotoğraflarına rağmen agresif hedef) |
| **INP** (Interaction to Next Paint) | ≤ 200 ms | ≤ 200 ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | **~0** (tüm görsellere `width`/`height` verilerek) |

### İlkeler (özet)

- **Formatlar**: **AVIF** (WebP fallback). AVIF, WebP'den ~%20, JPEG/PNG'den %25–70 daha küçük. Hem `next/image` hem Cloudinary bunu otomatik yapar (`f_auto`).
- **Hero / LCP görseli**: `next/image` + **`priority`** (`fetchpriority="high"`, lazy-load kapalı). AVIF sonrası ~150–200 KB altında tutun; blur placeholder ekleyin.
- **CLS'yi sıfırlamak**: her görselde `width`/`height` (veya `fill` + boyutlandırılmış konteyner) ile alan rezerve edin.
- **`sizes` prop'u zorunludur**: responsive görsellerde `sizes` verilmezse tarayıcı küçük alana tam boy (ör. 1920px) görsel indirir. Doğru `sizes` mobil görsel baytlarını %50–70 azaltır.
- **Caching / ISR**: vitrin sitesi büyük ölçüde statiktir. Koleksiyon/model sayfaları **Static Generation + ISR** (`revalidate`) ile CDN edge'den servis edilir; içerik yeniden deploy gerektirmeden güncellenir. Hash'li görsel varlıklarına uzun `Cache-Control` / immutable verilir. Cloudinary CDN cache'i aynı zamanda kredi bütçesini de korur (cache hit'ler transform ücreti doğurmaz).
- **Performans bütçesi guardrail'leri**: açılış sayfasında JS < 150 KB gzip; her galeri görseli ≤ ~200 KB; hero dışı tüm görseller `loading="lazy"`; pipeline'da Lighthouse CI kontrolü (mobil Performance ≥ 90).

> Görsel optimizasyonunun tam Next.js/Cloudinary uygulaması, `next.config` ayarları ve ISR `revalidate` değerleri için bkz. [Mimari](ARCHITECTURE.md).

---

## 5. Analitik + Dönüşüm

### Plausible (önerilen) vs GA4

| | **Plausible (birincil)** | GA4 |
|---|---|---|
| Cookie | Yok (cookieless) | Var (Consent Mode v2 gerekir) |
| Çerez banner | **Gerekmez** (analitik için) | **Gerekir** |
| Gizlilik | PII yok, EU-hosted | Google veri paylaşımı |
| Veri doğruluğu | Daha yüksek (bağımsız testlerde GA4 rıza reddi nedeniyle trafiğin ~%55'ini yakaladı) | Eksik veri modellenir |
| Maliyet | ~$9/ay (veya self-host ücretsiz) | Ücretsiz |
| Ne zaman | **Varsayılan seçim** — gizlilik-temiz, banner'sız | Yalnızca Google/YouTube reklamı yapılacaksa |

**Karar**: Birincil analitik **Plausible** (gizlilik-temiz, banner gerektirmez). GA4 yalnızca ileride Google/YouTube reklamı yapılırsa ek olarak kurulur.

### İzlenecek dönüşümler

Bir butik için en kritik iki sinyal **randevu formu gönderimi** ve **WhatsApp tıklaması**dır.

| Olay (event) | Ne zaman fırlar | Not |
|---|---|---|
| `randevu_gonderildi` | Randevu formu başarıyla gönderildiğinde | Plausible custom goal / GA4 event |
| `whatsapp_click` | `wa.me` CTA'sına tıklanınca | Butik için **#1** dönüşüm sinyali |
| `tel_click` | `tel:` bağlantısına tıklanınca | Telefon araması niyeti |
| `instagram_click` | Instagram dış bağlantısına tıklanınca | Sosyal yönlendirme |

### Meta Pixel (yalnızca rıza arkasında)

Instagram/Facebook reklamı yapılacaksa **Meta Pixel + Conversions API** kurulur; form gönderiminde ve WhatsApp tıklamasında `Lead` fırlatılır (reklam optimizasyonu/retargeting için). Ancak Pixel cookie kullanır → **rıza (consent) gerektirir**. Bu nedenle Meta Pixel çerez banner'ının **arkasına gizlenir** (yalnızca opt-in sonrası yüklenir); Plausible her zaman aktif kalır. Bkz. §7 KVKK.

---

## 6. WhatsApp + Instagram (birincil dönüşüm yolu)

Türk kullanıcılar form yerine güçlü biçimde **WhatsApp**'ı tercih eder; bu yüzden **Click-to-WhatsApp birincil CTA**'dır.

### WhatsApp

- **Ön-doldurulmuş Türkçe mesaj** ile sürtünmeyi azaltın:

```
https://wa.me/90XXXXXXXXXX?text=Merhaba%2C%20Celine%20Gelinlik%20i%C3%A7in%20at%C3%B6lye%20randevusu%20almak%20istiyorum
```

  (Çözülmüş metin: *"Merhaba, Celine Gelinlik için atölye randevusu almak istiyorum"*)
- Mobilde **sabit yüzen (floating) WhatsApp butonu** + her koleksiyon/model sayfasında inline CTA.
- Tıklamada `whatsapp_click` analitik olayı fırlatılır.
- Katalog + otomatik yanıtlar için **WhatsApp Business** uygulaması değerlendirilebilir (ücretsiz).

### Instagram + sameAs

- Instagram profili header, footer ve GBP'de bağlanır; "takip et" CTA'sı eklenir.
- Instagram, JSON-LD `sameAs` dizisine eklenir (bkz. §1).
- İsteğe bağlı: son gönderiler hafif bir embed ile veya performans maliyetini önlemek için manuel olarak seçilerek gösterilir.
- Randevu formu, WhatsApp kullanmayanlar için **ikincil/yedek CTA** olarak konumlanır.

---

## 7. Yasal — KVKK (Türk GDPR'ı)

KVKK **uygulanır**: iletişim/randevu formu kişisel veri toplar. Aydınlatma yükümlülüğüne uyulmaması **idari para cezası** doğurur; **2025 aralığı yaklaşık ₺113.000 – ₺2.270.000**'dir.

### Aydınlatma Metni

Footer'da **"KVKK / Gizlilik Politikası"** olarak bağlanan bir **Aydınlatma Metni** yayımlanır. İçermesi gerekenler:

- Veri sorumlusu kimliği (Celine Gelinlik),
- İşleme amaçları,
- Alıcı kategorileri,
- Toplama yöntemi,
- Hukuki dayanak (KVKK m.5),
- Saklama süresi,
- Veri sahibi hakları (KVKK m.11).

Metin, veri toplanmadan **önce** kullanıcıya sunulmalıdır.

### İletişim / randevu formu

- Aydınlatma Metni bağlantısı **formun hemen altında** yer alır.
- Verinin pazarlama/bülten için kullanılacağı durumlarda, sorguyu yanıtlamak için gereken işlemeden **ayrı**, **varsayılan olarak işaretsiz** bir **açık rıza checkbox**'ı eklenir.

### Çerez banner + Çerez Politikası

- KVKK çerezleri kişisel veri sayar → bir **çerez (cookie) banner**'ı ve bir **Çerez Politikası** sayfası gösterilir.
- **Plausible cookieless olduğu için** analitik rıza olmadan çalışabilir — bu, Plausible'ı varsayılan analitik olarak tercih etmenin güçlü bir nedenidir.
- **Meta Pixel / GA4 rızanın arkasına alınmalıdır** (yalnızca opt-in sonrası yüklenir).

### Örnek Türkçe gizlilik satırı (footer/form)

> *"Kişisel verileriniz KVKK kapsamında yalnızca randevu ve iletişim amacıyla işlenir. Detaylar için Aydınlatma Metni'ni inceleyin."*

### Yasal inceleme notu

Nihai **Aydınlatma Metni** ve **çerez metni**, yayına almadan önce bir **Türk avukat** veya bir KVKK şablon hizmeti tarafından incelenmelidir. Bu doküman teknik bir rehberdir, hukuki görüş yerine geçmez.

---

## İlgili dokümanlar

- [Mimari](ARCHITECTURE.md) — `next/image`, Cloudinary, ISR uygulaması
- [Sayfalar](PAGES.md) — rota ve sayfa yapısı
- [Veri Modeli](DATA-MODEL.md) — alt text / SEO alanları
- [Admin](ADMIN.md) — görsel ve metadata yönetimi
- [Tasarım](DESIGN.md) — tipografi ve palet
- [Deployment](DEPLOYMENT.md) — staging/prod, Search Console
- [Yol Haritası](ROADMAP.md) — Galeri (Phase 2), GA4/Meta Pixel eklenmesi
