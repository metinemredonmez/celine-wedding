# AI Arka Plan Değiştirme

Gelinlik fotoğraflarının dağınık arka planını (TV, perde, mobilya) **AI ile şık bir
sahneyle** değiştirir (sade beyaz stüdyo, klasik salon, bahçe vb.). Orijinal görsel
silinmez; sonuç **yeni bir görsel** olarak gelinliğe eklenir.

## Nasıl çalışır (mimari)

1. Admin → **Gelinlikler → (bir gelinlik) → Görseller** → bir görselin altındaki
   **✨ (AI arka plan)** düğmesi.
2. Bir stil seç ya da kendi komutunu yaz → **Oluştur**.
3. Sunucu: kaynak görseli indirir → seçilen AI servisine (komutla) gönderir →
   dönen görseli **Cloudinary'e** yükler → gelinliğe yeni görsel olarak ekler.
4. Sağlayıcı **bağımsızdır** — `AI_BG_PROVIDER` env'i ile seçilir; anahtar yoksa
   özellik pasif kalır (uygulama çalışır).

## API anahtarı nereden alınır

Aşağıdakilerden **birini** seç, hesap aç, API anahtarını al:

### Seçenek A — ClipDrop (varsayılan, önerilen — Stability AI)

- Site: **https://clipdrop.co/apis** → giriş yap → **API Keys**
- Kullanılan uç: `Replace Background` (görsel + komut → yeni arka plan)
- Fiyat: kredi bazlı; küçük ücretsiz/deneme kotası var
- `.env`:
  ```
  AI_BG_PROVIDER=clipdrop
  AI_BG_API_KEY=ck_xxx...
  ```

### Seçenek B — Photoroom (ürün/portre fotoğrafına özel, çok kaliteli)

- Site: **https://www.photoroom.com/api** → hesap/API dashboard → **API Key**
- Kullanılan uç: `v2/edit` (`background.prompt` ile AI arka plan)
- `.env`:
  ```
  AI_BG_PROVIDER=photoroom
  AI_BG_API_KEY=xxx...
  ```

> Başka bir servis (Bria, fal.ai, Replicate) kullanmak istersen: `AI_BG_ENDPOINT`
> ile uç noktayı ez ya da `apps/api/src/ai-background/provider/http-ai-background.provider.ts`
> içine yeni bir dal ekle.

## Kurulum (sunucuda, Emre)

1. Anahtarı sunucudaki `apps/api/.env` dosyasına ekle (yukarıdaki iki satır).
2. `cd /var/www/celine && ./deploy.sh` (yeniden başlatır).
3. Admin → bir gelinliğin görsellerinde ✨ düğmesini dene.

Anahtar yoksa düğme çalışır ama "sağlayıcı/anahtar ayarlı mı?" uyarısı döner —
site bundan etkilenmez.
