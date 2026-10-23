# Virtual Try-On (AI) — Sanal Gelinlik Deneme

Gelin boydan fotoğrafını yükler, koleksiyondan bir gelinlik seçer; AI gelinliği
**üzerinde** gösterir. Herkese açık demo: `/dugun-makyaji#gelinlik-deneme`
(aynı sayfada tarayıcı-içi düğün makyajı stüdyosu da var; o kısım AI servisi
kullanmaz, fotoğraf cihazdan çıkmaz).

Sağlayıcı **fal.ai** (fashn/tryon). Kod: `apps/api/src/try-on/`,
`apps/web/components/makeup/DressTryOn.tsx`, `apps/web/app/api/try-on/`.

## Akış

1. Tarayıcı fotoğrafı 1280 px'e küçültür, JPEG base64 (≤ ~0,9 MB) yapar.
2. `POST /api/try-on` (Next route handler) → `POST /try-on { personImage, dressId }`
   (NestJS). Next proxy `x-forwarded-for`'u taşır; API dışarı açık olmak zorunda
   değil, CORS gerekmez.
3. API `TryOnRequest` (PENDING) yazar — base64 **DB'ye yazılmaz**
   (`personImageUrl = "inline"`) — ve üretimi **arka planda** başlatır; yanıt
   hemen döner (sağlayıcı 5-120 sn sürebilir, nginx/istemci zaman aşımına
   takılmasın).
4. Tarayıcı `GET /api/try-on/:id` ile 2 sn'de bir yoklar (en çok ~170 sn):
   `DONE` + `resultUrl` ya da `FAILED` + `error`.
5. Sonuç fal'ın CDN adresinden gösterilir; "Kaydet / paylaş" tarayıcıda indirir.

## fal.ai sağlayıcısı (`provider/fal-try-on.provider.ts`)

- Kuyruk ucu: `POST https://queue.fal.run/{model}` → `status_url` 1,5 sn'de bir
  yoklanır (`IN_QUEUE`/`IN_PROGRESS` → `COMPLETED`) → `response_url`'den
  `images[0].url`. Kimlik: `Authorization: Key <anahtar>` (Bearer değil).
- İstek gövdesi modele göre kurulur (`fal-ai/fashn/*` → `model_image`,
  `garment_image`, `category: one-pieces`, `mode: quality`;
  `fal-ai/idm-vton` → `human_image_url`, `garment_image_url`, `category:
  dresses`, zorunlu `description`). Bilinmeyen model → FAILED (sessiz yanlış
  gövde yerine).
- `has_nsfw_concepts` bayrağı → "içerik filtresine takıldı".
- Gelinlik görseli: `dressId`'nin ilk görseli (admin'de sıra 1). Gelinliğin
  önden, tek kişilik, sade zeminli bir fotoğrafı sonuç kalitesini belirler.

## Sunucu ayarı (`apps/api/.env`)

```dotenv
TRYON_PROVIDER=fal                     # fal | http | disabled
TRYON_API_KEY=…                        # fal.ai → API Keys (yalnız "API" yetkisi yeter)
TRYON_MODEL=fal-ai/fashn/tryon/v1.6    # ya da fal-ai/idm-vton
TRYON_API_URL=                         # (ops.) kuyruk tabanını ez — test/stub
```

- fal ön ödemeli: hesapta kredi yoksa her deneme FAILED döner (hata metni
  `error` sütununda ve tarayıcıda "Teknik ayrıntı" altında görünür).
- Maliyet: fashn ≈ 0,075 $/deneme. Koruma: `POST /try-on` IP başına saatte 5
  (`@Throttle`), `TRYON_PROVIDER=disabled` ile tamamen kapatılır.
- Gövde sınırı: API `8mb` (`main.ts`); nginx `client_max_body_size` 1 MB'ın
  altında kalınacak şekilde tarayıcı küçültür. Sunucuda nginx'i 4m yapmak
  daha güvenlidir.
- KVKK: fotoğraf yurt dışındaki sağlayıcıya gider; arayüzde zorunlu rıza
  kutusu ve `/kvkk` bağlantısı var. Sunucuda fotoğraf saklanmaz; yalnız sonuç
  adresi ve seçilen gelinlik tutulur.

## Yerel test (fal'a para harcamadan)

Sahte kuyruk sunucusu yazıp `TRYON_API_URL=http://127.0.0.1:4999`,
`TRYON_API_KEY=test` ver: `POST /{model}` → `status_url`/`response_url`,
`GET status` → birkaç `IN_PROGRESS` sonra `COMPLETED`, `GET result` →
`{ images: [{ url }] }`. Akışın tamamı (gönderim, yoklama, sonuç, DB satırı)
gerçek sağlayıcı olmadan doğrulanır.

## Notlar / sonraki adımlar

- `resultUrl` fal CDN'inde; kalıcılık için Cloudinary'e kopyalamak (MediaService
  `uploadBuffer`) opsiyonel — admin panelinde denemeleri göstermek istenirse.
- API yeniden başlarsa süren üretim kaybolur, satır PENDING kalır; tarayıcı 170
  sn sonra "beklenenden uzun sürdü" der.
- İlgili: [Veri Modeli](DATA-MODEL.md) (`TryOnRequest`), [Mimari](ARCHITECTURE.md).
