# Virtual Try-On (AI) — Sanal Gelinlik Deneme

Gelin kendi fotoğrafını yükler, seçtiği gelinliği AI ile **üzerinde** önizler.
Modül **sağlayıcı-bağımsız** tasarlandı: gerçek AI servisini sonra seçip tek
dosyada bağlarız. Kod: `apps/api/src/try-on/`.

## Akış

1. Gelin fotoğrafını `POST /media/sign` ile Cloudinary'e yükler → `personImageUrl`.
2. `POST /try-on { personImageUrl, dressId }` — gelinlik görseli, `dressId`'nin
   kapak fotoğrafından alınır (veya `garmentImageUrl` açıkça verilir).
3. Servis bir `TryOnRequest` (PENDING) yazar, seçili sağlayıcıyı çağırır,
   sonucu `DONE` (+`resultUrl`) veya `FAILED` (+`error`) olarak günceller.
4. `GET /try-on/:id` — durum/sonuç sorgulanır (async sağlayıcılar için poll).

## Sağlayıcı seçimi (env)

`apps/api/.env`:

```dotenv
TRYON_PROVIDER=http          # http | disabled
TRYON_API_URL=               # seçilen servisin endpoint'i
TRYON_API_KEY=
TRYON_MODEL=                 # ör. idm-vton / kolors-virtual-try-on
```

`http` sağlayıcı (`provider/http-try-on.provider.ts`) generic bir POST atar ve
yanıttan `image_url | result_url | url | output[0]` alanını okur. Seçilen servise
göre istek/yanıt alan adlarını bu tek dosyada uyarlarsın; farklı bir SDK gerekiyorsa
yeni bir `TryOnProvider` yazıp `try-on.module.ts`'de tek satırda bağlarsın.

## Aday servisler (Emre seçecek)

| Servis | Not |
| --- | --- |
| **fal.ai** (IDM-VTON / CatVTON) | Hızlı, uygun fiyat, basit REST; iyi başlangıç |
| **Replicate** (IDM-VTON, OOTDiffusion) | Geniş model havuzu, async job + poll |
| **Kolors Virtual Try-On** (Kwai) | Güçlü sonuç, bölgesel erişim değişir |
| **Google Vertex / Try-On** | Kurumsal, kota/faturalandırma |
| Kendi barındırılan (ComfyUI + IDM-VTON) | En ucuz ölçek, DevOps yükü |

## Notlar

- AI çağrıları **maliyetli** → lansmandan önce `POST /try-on`'a rate-limit +
  captcha (Turnstile) eklenmeli (controller'da TODO).
- `resultUrl`'i kalıcılık için Cloudinary'e taşımak opsiyonel (sağlayıcı URL'leri
  geçici olabilir).
- İlgili: [Veri Modeli](DATA-MODEL.md) (`TryOnRequest`), [Mimari](ARCHITECTURE.md).
