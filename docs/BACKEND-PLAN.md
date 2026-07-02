# Backend — A-Z Kapsam Planı

Celine Gelinlik backend'inin **tam** yol haritası — bir butik gelinlik atölyesinin
ihtiyaç duyabileceği her şey. ✅ = yapıldı (repo'da), ⏳ = planlı. Öncelik:
🔴 yüksek · 🟡 orta · ⚪ sonra.

## 1. Katalog & içerik
- ✅ Koleksiyonlar (public liste/detay + admin CRUD)
- ✅ Gelinlikler / modeller (public liste-filtre-sayfalama, slug, detay + admin CRUD, reorder)
- ✅ Görseller (Cloudinary imzalı upload, sıralama, silme)
- ⏳ 🟡 Gerçek Gelinler / referanslar (testimonial modeli + admin)
- ⏳ ⚪ Blog / haberler, Basında Biz (press)
- ⏳ 🟡 SSS (FAQ) modeli
- ⏳ ⚪ Çoklu dil içerik (TR/EN alanları)

## 2. Randevu & takvim
- ✅ Randevu talebi (public form + honeypot)
- ✅ **Takvim / müsaitlik**: haftalık `AvailabilityRule` + `BlockedDate` (kapalı günler); `GET /availability?date=YYYY-MM-DD` → uygun slotlar
- ✅ **Slot'lu rezervasyon**: `startsAt`+`durationMin`; çift-rezervasyon (overlap) engeli
- ✅ Admin: durum pipeline (NEW→CONTACTED→DONE/CANCELLED), tarih aralığı ile takvim görünümü
- ⏳ 🔴 Hatırlatma bildirimleri (randevudan 1 gün önce e-posta/WhatsApp/SMS)
- ⏳ 🟡 Google Calendar senkron / iCal export (Seda kendi takviminde görsün)
- ⏳ ⚪ Otomatik onay/iptal linkleri (tek tık)

## 3. İletişim & bildirim
- ✅ SMTP e-posta (randevu → sahibe bildirim + müşteriye onay; best-effort)
- ⏳ 🔴 WhatsApp bildirimi (Business API / Twilio) — Türkiye'de birincil kanal
- ⏳ ⚪ SMS (Netgsm/İleti Merkezi) fallback
- ✅ WhatsApp yönlendirme (wa.me) — web tarafında CTA

## 4. Yapay zeka (AI)
- ✅ **Virtual Try-On** (sağlayıcı-bağımsız; fal.ai/Replicate/Kolors/Google — Emre seçecek). docs/VIRTUAL-TRYON.md
- ⏳ 🟡 AI görsel iyileştirme (Seda'nın gerçek fotoğraflarını "geliştirme" — upscale/retouch pipeline)
- ⏳ ⚪ Stil önerisi / gelinlik eşleştirme (soru-cevap → öneri)

## 5. Kimlik & güvenlik
- ✅ JWT auth (access+refresh, argon2 rotation), roller, guard
- ✅ CORS (WEB_ORIGIN), ValidationPipe (whitelist)
- ⏳ 🔴 Rate-limit (`@nestjs/throttler`) — public form + try-on + login
- ⏳ 🔴 Captcha doğrulama (Cloudflare Turnstile server-side) — form + try-on
- ⏳ 🟡 Helmet, güvenlik başlıkları
- ⏳ 🟡 Audit log (admin işlemleri)
- ⏳ ⚪ "Şifremi unuttum" akışı (küçük işletme pragmatiği)

## 6. Site yönetimi (mini-CMS)
- ✅ SiteSettings (telefon, WhatsApp, Instagram, adres, harita, hakkımızda)
- ✅ Medya imzalı upload · ✅ Revalidate webhook (Next ISR tazeleme)

## 7. CRM / müşteri (gelecek)
- ⏳ 🟡 Randevudan müşteri kaydı (tekrar eden gelinler), notlar, etiketler, geçmiş
- ⏳ ⚪ Basit huni (ilgilenen → randevu → prova → dikim → teslim)

## 8. Analitik & SEO (çoğu web tarafında)
- ⏳ 🟡 Server-side dönüşüm olayları (randevu/try-on) → Plausible/GA
- ⏳ (web) sitemap/robots, JSON-LD (LocalBusiness/Product) — docs/SEO.md

## 9. Operasyon & kalite
- ✅ Prisma migrations + seed · ✅ Health endpoint · ✅ Swagger `/docs` · ✅ env-config
- ⏳ 🟡 Yapılandırılmış log (pino) · ⏳ 🟡 e2e/unit test · ⏳ 🟡 CI (lint+tsc+build)
- ⏳ (deploy) yedekleme (pg_dump cron) — docs/DEPLOYMENT.md

## 10. Yasal / KVKK
- ⏳ 🔴 Aydınlatma metni + **açık rıza** kaydı (consent log) — form verisi için
- ⏳ (web) çerez banner + politika — docs/SEO.md

---

## Önerilen sıradaki backend adımları (öncelik sırası)
1. 🔴 Rate-limit + Turnstile (public form / try-on / login) — kötüye kullanım + maliyet koruması.
2. 🔴 WhatsApp bildirimi + randevu **hatırlatma** (Türkiye'de dönüşümü en çok artıran).
3. 🔴 KVKK açık rıza kaydı (yasal zorunluluk).
4. 🟡 Gerçek Gelinler + SSS modelleri (menüde var, backend'i hazırlayalım).
5. 🟡 Google Calendar/iCal (Seda operasyonu).

Detaylar: [Veri Modeli](DATA-MODEL.md) · [Mimari](ARCHITECTURE.md) · [Try-On](VIRTUAL-TRYON.md) · [Yol Haritası](ROADMAP.md)
