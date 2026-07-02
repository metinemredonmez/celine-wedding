# Yol Haritası & Fazlandırma — Celine Gelinlik

Bu doküman, **Celine Gelinlik** showcase sitesinin sıfırdan canlıya alınana kadarki inşa sırasını, faz bazlı teslimatlarını ve her fazın "definition of done" ölçütlerini tanımlar. Proje; e-ticaret, sepet veya fiyat içermeyen, fotoğraf-öncelikli, minimal ve lüks bir tanıtım (showcase) sitesidir. Birincil dönüşüm hedefi **atölye randevusu / WhatsApp** iletişimidir.

- **Marka:** Celine Gelinlik
- **Domain:** celinegelinlik.com
- **Repo:** github.com/metinemredonmez/celine-wedding
- **Konum:** İdealtepe Mah. Panaroma Sok. Defne Apt. No:5 D:7, Maltepe / İstanbul
- **Monorepo:** pnpm workspaces — `apps/web` (Next.js 16) + `apps/api` (NestJS 11) + `docs/`

İlgili dokümanlar: [Sayfalar](PAGES.md) · [Admin](ADMIN.md) · [Veri Modeli](DATA-MODEL.md) · [Tasarım](DESIGN.md) · [Mimari](ARCHITECTURE.md) · [SEO](SEO.md) · [Deployment](DEPLOYMENT.md)

---

## 1. Önerilen İnşa Sırası (Build Order)

Aşağıdaki sıra, her adımın bir öncekine bağımlı olacak şekilde en verimli teslim akışını tanımlar. Her adım tamamlandığında bir sonrakine geçilir; adımlar arası paralel çalışma mümkün olsa da tavsiye edilen ana hat budur.

### ✅ Adım 1 — Monorepo Scaffold (tamamlandı)
- [x] Git deposu başlatıldı (`github.com/metinemredonmez/celine-wedding`)
- [x] pnpm workspaces kurulumu (`pnpm-workspace.yaml`)
- [x] Kök `package.json`, ortak `tsconfig`, lint/format konfigürasyonu
- [x] `docs/` klasörü ve proje dokümantasyonu iskeleti

### ⬜ Adım 2 — `apps/api` Scaffold + Prisma + Migrate + Seed
- [ ] NestJS 11 projesi (`apps/api`) oluşturulması
- [ ] Prisma 7 kurulumu, `schema.prisma` tanımı (bkz. [Veri Modeli](DATA-MODEL.md))
- [ ] PostgreSQL bağlantısı, `.env` yapılandırması (`DATABASE_URL`)
- [ ] İlk migration: `prisma migrate dev`
- [ ] Seed script: ilk admin kullanıcısı (argon2 ile hashlenmiş parola)
- [ ] Auth iskeleti: argon2 + JWT (access + refresh token)
- [ ] Swagger dokümantasyonunun açılması (`/api/docs`)

```bash
# apps/api içinde
pnpm add -D prisma && pnpm add @prisma/client
npx prisma init
npx prisma migrate dev --name init
pnpm prisma db seed
```

### ⬜ Adım 3 — `apps/web` Scaffold + Tailwind v4 + shadcn + Fontlar + Design Tokens
- [ ] Next.js 16 (App Router) projesi (`apps/web`), TypeScript
- [ ] Tailwind v4 kurulumu, `@theme` ile design token tanımı
- [ ] shadcn/ui entegrasyonu (baz bileşenler: button, input, form, dialog, sheet)
- [ ] Framer Motion + seçili Magic UI efektleri
- [ ] Fontlar: **Cormorant Garamond** (serif display) + **Inter** (sans body), subset `latin` + `latin-ext` (Türkçe glyph desteği)
- [ ] Palet token'ları: `--bg-ivory: #F7F3EC`, `--text-charcoal: #1C1A17`, şampanya/taupe ikincil, rose-gold/şampanya-gold yalnızca ince hairline vurgu
- [ ] next-intl kurulumu (TR birincil, EN opsiyonel — Faz 3'te aktif)
- [ ] Global layout: Header, Footer, floating WhatsApp FAB iskeleti

Ayrıntılı token ve tipografi için bkz. [Tasarım](DESIGN.md).

### ⬜ Adım 4 — Public Sayfalar
Aşağıdaki sırayla, veri akışı ve navigasyon zinciri korunacak şekilde inşa edilir:

1. [ ] **Anasayfa** (`/`) — hero, öne çıkan gelinlikler, koleksiyon teaser, CTA band
2. [ ] **Koleksiyonlar** (`/koleksiyonlar`) — editorial grid
3. [ ] **Koleksiyon Detay** (`/koleksiyonlar/[slug]`)
4. [ ] **Model Detay** (`/modeller/[dressSlug]`) — bireysel gelinlik, galeri, sticky info, "Bu Gelinlik İçin Randevu Al"
5. [ ] **Gelinlikler** (`/modeller`, ekran etiketi "GELİNLİKLER") — tüm modellerin listesi
6. [ ] **Özel Dikim** (`/ozel-dikim`) — bespoke süreç (istişare → eskiz → prova → dikim/teslim)
7. [ ] **Atölye** (`/atolye`) — MVP-lite, kısa olabilir (eski Hakkımızda)
8. [ ] **Randevu** (`/randevu`) — form + atölye bilgi kartı
9. [ ] **İletişim** (`/iletisim`) — iletişim bilgileri + gömülü harita
10. [ ] **Gerçek Gelinler** (`/gercek-gelinler`) — MVP'de placeholder (Faz 2'de zenginleşir)

Her sayfanın section sırası ve içerik modeli için bkz. [Sayfalar](PAGES.md).

### ⬜ Adım 5 — Randevu Formu + WhatsApp
- [ ] Form alanları + client-side doğrulama (TR telefon formatı)
- [ ] `POST /appointments` API entegrasyonu
- [ ] Onay durumu (`/randevu/tesekkurler`) veya inline success state
- [ ] WhatsApp `wa.me/<number>?text=` prefill fallback (formdan otomatik oluşturulan Türkçe mesaj)
- [ ] Model detaydan gelen `interestedDress` pre-fill (hidden field)
- [ ] Owner'a e-posta bildirimi

### ⬜ Adım 6 — Admin Panel + Cloudinary Upload
- [ ] `/admin/*` korumalı rotalar (JWT auth guard)
- [ ] Randevu listesi/yönetimi (durum: Yeni / Arandı / Onaylandı / İptal, click-to-WhatsApp, click-to-call, not)
- [ ] Koleksiyon & Model CRUD
- [ ] Cloudinary görsel yükleme (signed upload, transform preset'leri)
- [ ] `site_settings` yönetimi

Ayrıntılar için bkz. [Admin](ADMIN.md).

### ⬜ Adım 7 — SEO + Analytics + KVKK
- [ ] Sayfa bazlı `title` / `meta` / OpenGraph + Twitter Card
- [ ] `sitemap.xml` + `robots.txt`
- [ ] `next/image` ile görsel optimizasyonu, lazy load
- [ ] Analytics (Plausible / GA4) + temel conversion tracking (randevu submit)
- [ ] KVKK / Gizlilik metni + cookie banner

Ayrıntılar için bkz. [SEO](SEO.md).

### ⬜ Adım 8 — Deploy + Domain
- [ ] `apps/web` deploy (Vercel önerilir)
- [ ] `apps/api` + PostgreSQL deploy (managed DB)
- [ ] `celinegelinlik.com` DNS + SSL bağlantısı
- [ ] Ortam değişkenleri (production secrets, Cloudinary, SMTP)
- [ ] Smoke test + canlı doğrulama

Ayrıntılar için bkz. [Deployment](DEPLOYMENT.md).

---

## 2. Faz 1 — MVP (Hızlı Lansman)

Amaç: markanın atölye deneyimini yansıtan, hızlı yüklenen, fotoğraf-öncelikli bir tanıtım sitesini en kısa sürede canlıya almak ve randevu akışını çalışır hale getirmek.

### Kapsam
| Alan | Teslimat |
|------|----------|
| **Sayfalar** | Anasayfa, Koleksiyonlar, Koleksiyon detay, Gelinlikler (`/modeller`), Model detay, Özel Dikim, Atölye, Randevu (+onay), İletişim (Gerçek Gelinler MVP'de placeholder) |
| **Global** | Header (scroll'da katılaşan), Footer, floating WhatsApp FAB, tekrar eden appointment CTA band'leri |
| **Randevu** | Form → `POST /appointments` → owner e-posta bildirimi + WhatsApp `wa.me` prefill fallback |
| **İçerik Modeli** | Collection, Dress (fiyatsız), `site_settings` — bkz. [Veri Modeli](DATA-MODEL.md) |
| **Admin** | Minimum: randevu kayıtları için basit korumalı liste (DB tablosu) + e-posta bildirimi |
| **Görsel** | Cloudinary + `next/image`, responsive, portrait-öncelikli |
| **SEO** | Temel: `title` / `meta` / OG, `sitemap.xml`, `robots.txt` |

### Faz 1 Definition of Done
- [ ] Tüm MVP sayfaları responsive, mobile + desktop'ta sorunsuz
- [ ] Randevu formu uçtan uca çalışıyor: doğrulama → API kaydı → onay ekranı → owner e-postası → WhatsApp prefill
- [ ] Site `celinegelinlik.com` üzerinde canlı, SSL aktif
- [ ] Lighthouse: Performance ≥ 90 (mobil), görseller optimize
- [ ] Header/Footer/WhatsApp FAB tüm sayfalarda tutarlı
- [ ] Fiyat / sepet / e-ticaret unsuru **hiçbir yerde yok** (canonical kural)
- [ ] Admin, gelen randevu kayıtlarını görebiliyor

---

## 3. Faz 2 — Zenginleştirme & Operasyon

Amaç: içerik derinliğini, yasal uyumluluğu ve operasyonel verimliliği artırmak.

### Kapsam
- [ ] **Gerçek Gelinler** (`/gercek-gelinler`) — editoryal grid + kısa alıntılar; MVP placeholder'dan gerçek içeriğe zenginleştirme
- [ ] **Galeri / Lookbook** (`/galeri`) — masonry/justified foto grid, koleksiyona göre filtre, lightbox
- [ ] **SSS** (`/sss`) — accordion (randevu, prova/dikim süresi, ölçü, fiyat bilgisi randevuda, şehir dışı gelinler)
- [ ] **KVKK / Gizlilik** + cookie/onay banner (yasal — TR zorunlu)
- [ ] **Proper Admin Dashboard** — durum yönetimi, click-to-WhatsApp/call, not alanı, filtre/arama (bkz. [Admin](ADMIN.md))
- [ ] **Canlı Instagram feed** entegrasyonu (cache'li), gelişmiş görsel optimizasyonu/lightbox
- [ ] **WhatsApp bildirimleri** — WhatsApp Business API / Twilio ile owner'a anlık randevu bildirimi
- [ ] **Spam koruması** — honeypot + reCAPTCHA / rate limiting

### Faz 2 Definition of Done
- [ ] Gerçek Gelinler, Galeri ve SSS canlı, içerik girilmiş
- [ ] KVKK metni yayında, cookie banner çalışıyor, consent kaydediliyor
- [ ] Admin'de randevu durumu değiştirilebiliyor, WhatsApp/telefon tek tıkla açılıyor
- [ ] Yeni randevuda owner anlık bildirim alıyor (e-posta + WhatsApp)
- [ ] Form spam koruması aktif, otomatik gönderimler engelleniyor
- [ ] Instagram feed canlı verilerle güncelleniyor

---

## 4. Faz 3 — Büyüme & Çok Dillilik

Amaç: markayı editorial olarak derinleştirmek, uluslararası erişimi açmak ve randevu operasyonunu otomatikleştirmek.

### Kapsam
- [ ] **Basında Biz** (`/basin`) — press mentions
- [ ] **TR / EN çok dilli** — next-intl ile tam EN desteği, dil toggle (header)
- [ ] **Gelişmiş SEO + schema.org** — `LocalBusiness`, `BreadcrumbList`, ürün/koleksiyon işaretleme (bkz. [SEO](SEO.md))
- [ ] **Gelişmiş analytics** — conversion funnel, event tracking
- [ ] **Takvim / slot senkronizasyonu** — Google Calendar entegrasyonu, otomatik randevu hatırlatma mesajları

### Faz 3 Definition of Done
- [ ] Basında Biz sayfası canlı
- [ ] Site TR + EN tam çalışır, dil toggle sorunsuz, tüm içerik iki dilde
- [ ] schema.org işaretlemesi Rich Results Test'ten geçiyor
- [ ] Randevular takvimle senkron, otomatik hatırlatma mesajları gidiyor
- [ ] Conversion tracking ile randevu dönüşümleri raporlanabiliyor

---

## 5. Faz Özeti

| Faz | Odak | Ana Çıktı | Bitiş Kriteri (özet) |
|-----|------|-----------|----------------------|
| **Faz 1 — MVP** | Hızlı lansman | Public sayfalar + çalışan randevu akışı | Site canlı, randevu uçtan uca çalışıyor, Lighthouse ≥ 90 |
| **Faz 2** | Zenginleştirme & operasyon | Galeri, SSS, KVKK, admin dashboard, IG feed, bildirim | Yasal uyum + operasyonel admin + spam koruması hazır |
| **Faz 3** | Büyüme & çok dillilik | Testimonials, basın, TR/EN, schema, takvim sync | İki dilli + otomatik randevu operasyonu + gelişmiş SEO |

---

İlgili dokümanlar: [Sayfalar](PAGES.md) · [Admin](ADMIN.md) · [Veri Modeli](DATA-MODEL.md) · [Tasarım](DESIGN.md) · [Mimari](ARCHITECTURE.md) · [SEO](SEO.md) · [Deployment](DEPLOYMENT.md)
