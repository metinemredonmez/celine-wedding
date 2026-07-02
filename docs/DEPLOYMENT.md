# Deployment, Hosting & CI/CD — Celine Gelinlik

Bu belge **Celine Gelinlik** vitrin sitesinin (Next.js `apps/web` + NestJS `apps/api` + PostgreSQL + Cloudinary) canlıya alınmasını, barındırılmasını ve otomatik dağıtım (CI/CD) akışını anlatır. Amaç: **GitHub'a push → prod'a deploy**.

- Domain: **celinegelinlik.com** (API için `api.celinegelinlik.com`)
- Repo: **github.com/metinemredonmez/celine-wedding**
- Monorepo: pnpm workspaces — `apps/web`, `apps/api`, `docs/`

İlgili belgeler: [Mimari](ARCHITECTURE.md) · [Veri Modeli](DATA-MODEL.md) · [Admin](ADMIN.md) · [SEO](SEO.md) · [Yol Haritası](ROADMAP.md)

> **Önemli:** SEO, analytics ve KVKK detayları [SEO.md](SEO.md) belgesindedir. Bu belge yalnızca hosting, DNS, e-posta, SSL, secrets, yedekleme ve CI/CD konularını kapsar; ilgili yerlerde SEO.md'ye kısa referans verilir.

---

## İki dağıtım yolu — A mı B mi?

Emre kendi sunucusuna SSH ile giriyor ve "push = deploy" istiyor. Bu iki farklı felsefeyle mümkün. **Önce birini seç**, sonra o yolun CI dosyaları ve komutları kesinleştirilir.

| Kriter | **Seçenek A — Yönetilen (önerilen)** | **Seçenek B — Kendi VPS'in** |
|---|---|---|
| Bileşenler | Vercel + Railway/Render + Neon + Cloudinary | Docker Compose (web + api + db + Caddy) tek VPS'te |
| Bakım | En az (platform yönetiyor) | Sende (OS, Docker, güncelleme, izleme) |
| Push-to-prod | Native (push main → prod, PR → preview) | GitHub Actions SSH ile `docker compose up -d` |
| SSL | Otomatik (platform) | Otomatik (Caddy + Let's Encrypt) |
| Aylık maliyet | **~$0–25/mo** | VPS kirası (~$5–12/mo) + domain/e-posta |
| Kime uygun | Hızlı, dertsiz launch isteyen | Kontrolü elinde tutmak, tek fatura isteyen |

**Öneri:** Launch için **Seçenek A** (en az bakım, en iyi Next.js deneyimi). Emre altyapıyı tamamen kendi yönetmek istiyorsa **Seçenek B** birebir onun mevcut kurulumuna oturur. İki yol da aynı repo ve aynı `.env.example` ile çalışır; sadece dağıtım hedefi değişir.

---

## Seçenek A — Yönetilen (Vercel + Railway/Render + Neon + Cloudinary)

### A.1 Katman katman kurulum

| Katman | Öneri | Neden | Aylık |
|---|---|---|---|
| Frontend (`apps/web`) | **Vercel Pro** | En iyi Next.js DX, ISR, native image optimization, edge CDN, GitHub'dan sıfır-konfig CI | **$20/mo** (bkz. not) |
| API (`apps/api`) | **Railway (Hobby)** | İyi DX, cold-start yok, kolay env/secrets, GitHub'dan deploy | **~$5/mo** (kullanım; min $5) |
| Postgres | **Neon (Free)** | Gerçek scale-to-zero, 0.5 GB + 100 CU-hrs/ay ücretsiz, staging için DB branching | **$0** |
| Görsel CDN | **Cloudinary (Free)** | 25 kredi/ay (≈25 GB depolama VEYA 25 GB bant VEYA 25k transform), otomatik AVIF/WebP, on-the-fly resize, global CDN | **$0** |

**Launch toplamı: ~$20–25/mo.** Vercel Pro'dan vazgeçilirse ~$5/mo'ya kadar iner.

> **Vercel ticari kullanım notu:** Vercel'in ücretsiz **Hobby** planı ticari kullanımı açıkça yasaklar (tek geliştirici/kişisel, 100 GB bant). Bir gelinlik butiği ticari olduğundan **Vercel Pro ($20/koltuk/ay)** gerekir. İki dürüst yol:
> - **A-temiz:** Vercel Pro $20/mo. En basit, tam uyumlu, en iyi Next.js deneyimi.
> - **A-ucuz (~$5/mo):** `apps/web`'i de Vercel yerine **Railway/Render**'da (API'nin yanında) barındır. Vercel'in hazır image optimization/ISR cilası kaybedilir ama Cloudinary görselleri zaten üstlendiği için düşük trafikli bir vitrinde bu sorun değil. Next.js `output: 'standalone'` + `next start` kullan.

### A.2 Katman alternatifleri (kısaca)

- **API — Railway vs Render vs Fly.io:**
  - **Railway (birincil):** uyku yok, ~$5/mo, en iyi DX. Ücretsiz kalıcı katman yok (tek seferlik $5 deneme kredisi).
  - **Render:** gerçek ücretsiz katman var ama servis **15 dk boştan sonra uyur → 30–60 sn cold start** (randevu CTA'sının ilk izlenimi için kötü). Paralı Starter $7/mo uykuyu kaldırır. $0 istiyorsan ve cold start'a katlanıyorsan.
  - **Fly.io:** en ucuz always-on (~$2/mo), çok bölgeli ama ops yükü fazla, ücretsiz katman yok. Tek butik için abartı.
  - **Karar:** Denge için **Railway**; illa $0 ise cold start'ı kabul ederek **Render free**.
- **Postgres — Neon vs Supabase:**
  - **Neon (birincil):** saf Postgres, scale-to-zero, 0.5 GB free, branching = ücretsiz staging DB. Paralı "Launch" $19/mo.
  - **Supabase (free):** 500 MB DB + 1 GB storage + auth/storage bundled — ama free projeler **7 gün hareketsizlikte duraklar**. DB + görsel depolama + auth'u tek yerde toplamak istersen.
  - **Karar:** Yalın Postgres için **Neon**.
- **Görseller — Cloudinary vs S3+CloudFront:**
  - **Cloudinary (birincil):** depolama + transform + AVIF/WebP + CDN tek pakette, 25 kredi/ay free. Görsel-yoğun bir sitede en büyük emek tasarrufu. **Bant dikkat:** 1 kredi = 1 GB teslim; büyük hero'lar krediyi hızlı tüketir ve free plan overage'ı faturalamak yerine **askıya alır** — doğru boyutlu görsel sun ve CDN cache'e güven.
  - **S3 + CloudFront:** ölçekte en ucuz ama resize/format dönüşümünü kendin kurarsın. Cloudinary kredisi biterse "graduation" hedefi.
  - **Karar:** Şimdilik **Cloudinary free**, ölçek yolu S3+CloudFront.

### A.3 Push-to-prod akışı (Seçenek A)

Vercel ve Railway/Render GitHub'dan otomatik deploy eder:

- **`main`'e push → prod** deploy (hem web hem api).
- **PR açılınca → preview/staging** deploy (izole URL).
- Merge öncesi **GitHub Actions CI** (lint, `tsc`, build) yeşil olmalı — bkz. [Her iki seçenek için CI](#her-iki-seçenek-için-ci-lint--tsc--build).

Kurulum adımları:

1. Vercel'de projeyi GitHub reposuna bağla, **Root Directory = `apps/web`** seç, framework auto-detect (Next.js).
2. Railway'de yeni servis → GitHub repo, **Root Directory = `apps/api`**, build `pnpm --filter api build`, start `node dist/main.js`.
3. Neon'da prod DB + bir `staging` branch oluştur; connection string'leri Railway/Vercel env'e ekle.
4. Cloudinary hesabından `CLOUDINARY_URL` / API key'leri al, env'e ekle.
5. Domain'i bağla (bkz. [DNS](#dns--celinegelinlikcom-her-iki-seçenek)).

---

## Seçenek B — Kendi VPS'in (Docker Compose + Caddy)

Emre'nin mevcut kurulumuna en yakın yol. Tek VPS'te `web` + `api` + `postgres` + `caddy` reverse proxy çalışır. Caddy otomatik Let's Encrypt TLS verir. Dağıtım, `main`'e push'ta sunucuya SSH atıp `docker compose up -d` yapan bir GitHub Actions workflow'u ile olur.

### B.1 Mimari

```
                 Internet
                    │
             (443/80, TLS)
                    │
             ┌──────▼──────┐
             │    Caddy    │  celinegelinlik.com  → web:3000
             │ (reverse    │  api.celinegelinlik.com → api:3001
             │  proxy +    │
             │  Let's Enc) │
             └──┬───────┬──┘
                │       │
        ┌───────▼──┐ ┌──▼────────┐
        │   web    │ │    api    │
        │ Next.js  │ │  NestJS   │
        │  :3000   │ │  :3001    │
        └──────────┘ └────┬──────┘
                          │
                    ┌─────▼─────┐
                    │ postgres  │  (named volume: pgdata)
                    └───────────┘
```

Görseller yine **Cloudinary**'de tutulur (VPS'te görsel depolamayla uğraşma). DB, VPS içindeki Postgres container'ında; yedekleri haftalık `pg_dump` ile alınır (bkz. [Yedekleme](#yedekleme-her-iki-seçenek)).

### B.2 `docker-compose.prod.yml`

Repo köküne koy. Görüntüler CI'da build edilip registry'ye push edilir ya da sunucuda `git pull` + `docker compose build` yapılır. Aşağıdaki örnek **sunucuda build** varyantı içindir (en basit başlangıç).

```yaml
# docker-compose.prod.yml
services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped
    env_file: .env
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.celinegelinlik.com
    expose:
      - "3000"
    depends_on:
      - api
    networks:
      - celine

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: unless-stopped
    env_file: .env
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://celine:${POSTGRES_PASSWORD}@db:5432/celine?schema=public
    expose:
      - "3001"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - celine

  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=celine
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=celine
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U celine -d celine"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - celine

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - web
      - api
    networks:
      - celine

networks:
  celine:

volumes:
  pgdata:
  caddy_data:
  caddy_config:
```

> **Not:** `web` ve `api` portları dışarı `ports:` ile değil `expose:` ile açılır — yalnızca Caddy onlara erişir. Sadece Caddy 80/443'ü dış dünyaya açar. Her iki app için `apps/web/Dockerfile` ve `apps/api/Dockerfile` gerekir; Next.js için `output: 'standalone'`, NestJS için multi-stage `pnpm build` → `node dist/main.js` önerilir (Dockerfile'lar [Mimari](ARCHITECTURE.md) belgesinde detaylandırılır).

### B.3 `Caddyfile`

Repo köküne koy. Caddy her iki alan adı için otomatik olarak Let's Encrypt sertifikası alır, yeniler ve HTTPS'e yönlendirir — ek konfig gerekmez.

```caddyfile
# Caddyfile
celinegelinlik.com, www.celinegelinlik.com {
	encode gzip zstd
	# www → apex yönlendirmesi
	@www host www.celinegelinlik.com
	redir @www https://celinegelinlik.com{uri} permanent

	reverse_proxy web:3000

	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
		X-Content-Type-Options "nosniff"
		Referrer-Policy "strict-origin-when-cross-origin"
	}
}

api.celinegelinlik.com {
	encode gzip zstd
	reverse_proxy api:3001

	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
	}
}
```

### B.4 `.github/workflows/deploy.yml` (SSH deploy)

`main`'e push olunca CI (lint/tsc/build) geçer, sonra sunucuya SSH atılıp `git pull` + `docker compose up -d --build` çalıştırılır. Gerçek değerler **GitHub repo secrets**'ta tutulur (`SSH_HOST`, `SSH_USER`, `SSH_KEY`, `SSH_PORT`).

```yaml
# .github/workflows/deploy.yml
name: Deploy (VPS)

on:
  push:
    branches: [main]

concurrency:
  group: deploy-prod
  cancel-in-progress: false

jobs:
  ci:
    uses: ./.github/workflows/ci.yml   # lint + tsc + build (bkz. aşağıdaki CI)

  deploy:
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - name: SSH deploy
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            set -e
            cd /opt/celine
            git pull origin main
            docker compose -f docker-compose.prod.yml pull || true
            docker compose -f docker-compose.prod.yml up -d --build
            docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
            docker image prune -f
```

> `prisma migrate deploy` her deploy'da pending migration'ları prod DB'ye uygular — bu sayede şema değişiklikleri otomatik gider. Migration'lar repoda `apps/api/prisma/migrations/` altında commit'li olmalıdır.

### B.5 Tek seferlik sunucu hazırlığı

VPS'e SSH ile gir (Ubuntu 22.04+ varsayılır) ve bir kez şunları çalıştır:

```bash
# 1) Docker + Compose plugin kur
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # tekrar login gerekebilir

# 2) Proje dizinini oluştur ve repoyu klonla
sudo mkdir -p /opt/celine && sudo chown $USER:$USER /opt/celine
git clone https://github.com/metinemredonmez/celine-wedding.git /opt/celine
cd /opt/celine

# 3) Gerçek .env dosyasını oluştur (repoya ASLA commit edilmez)
cp .env.example .env
nano .env   # POSTGRES_PASSWORD, JWT secret'ları, CLOUDINARY_URL vb. gir

# 4) İlk ayağa kaldırma
docker compose -f docker-compose.prod.yml up -d --build

# 5) İlk DB migration + (opsiyonel) seed
docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec -T api npx prisma db seed   # varsa

# 6) Kontrol
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f caddy   # TLS sertifikaları alındı mı?
```

Sunucu güvenliği için: sadece 22/80/443 portlarını aç (`ufw allow 22,80,443/tcp`), `root` yerine sudo'lu bir kullanıcı kullan, SSH key-only auth aç.

### B.6 Sürekli push-to-deploy akışı (Seçenek B)

1. Lokalde geliştir, dalda çalış, PR aç (`main` korumalı olmalı).
2. PR'da GitHub Actions **CI** (lint + tsc + build) koşar.
3. PR merge edilip `main`'e girince `deploy.yml` tetiklenir → CI tekrar geçer → sunucuya SSH → `git pull` + `docker compose up -d --build` + `prisma migrate deploy`.
4. Caddy zaten ayakta olduğundan yeni container'lar sıfır ekstra konfigle canlıya geçer.

> **Not:** İleride "sunucuda build" yerine "CI'da build + registry push" istenirse, GitHub Actions imajları GHCR'a push eder, sunucu sadece `docker compose pull && up -d` yapar (daha hızlı, sunucuyu build yükünden kurtarır). Bu, Emre A/B kararını verdikten sonra kesinleştirilir.

---

## DNS — celinegelinlik.com (her iki seçenek)

- **Registrar/DNS:** `.com` için **Cloudflare Registrar** önerilir (maliyet fiyatına, markup yok; ücretsiz DNS + ücretsiz SSL + temel CDN/WAF). İsteğe bağlı olarak marka koruması için **celinegelinlik.com.tr** de bir Türk registrar'dan (Natro, İsimtescil, Turhost) alınabilir; DNS'i yine Cloudflare'e yönlendirebilirsin.
- **Seçenek A kayıtları:**
  - Apex (`celinegelinlik.com`) → Vercel'in verdiği `A`/`ALIAS`/`CNAME` kaydı. Vercel-yönetimli domain için Cloudflare'de **"DNS only" (gri bulut)** seç ki çift-proxy sorunu olmasın; SSL'i Vercel verir.
  - `api.celinegelinlik.com` → Railway/Render hedefine `CNAME`.
- **Seçenek B kayıtları:**
  - Apex (`celinegelinlik.com`) → VPS'in IP'sine `A` kaydı.
  - `www.celinegelinlik.com` → `A` (VPS IP) veya apex'e `CNAME`.
  - `api.celinegelinlik.com` → VPS'in IP'sine `A` kaydı.
  - Caddy'nin Let's Encrypt doğrulaması için Cloudflare'de bu kayıtları **"DNS only" (gri bulut)** yap; aksi halde proxy TLS challenge'ı bozabilir.

---

## Profesyonel e-posta (her iki seçenek)

`info@celinegelinlik.com` gibi kurumsal bir adres marka güveni için gerekli.

| Sağlayıcı | Maliyet | Not |
|---|---|---|
| **Zoho Mail Lite (önerilen)** | **~$1/kullanıcı/ay** | IMAP/POP + yeterli depolama; bütçe dostu. Ücretsiz "Forever" planı da var (tek domain, webmail-only, sınırlı kullanıcı). |
| Google Workspace | ~$6–7/kullanıcı/ay | Zaten Gmail/Drive kullanılıyorsa daha konforlu ama 6× pahalı. |

**Öneri:** `info@celinegelinlik.com` için **Zoho Mail Lite**. Kurulum: Zoho'da domain doğrula, Cloudflare'de **MX + SPF (TXT) + DKIM (TXT) + DMARC (TXT)** kayıtlarını ekle (e-postanın spam'e düşmemesi için üçü de şart).

---

## SSL (her iki seçenek)

- **Seçenek A:** Vercel/Railway/Render custom domain'lerde otomatik **Let's Encrypt** sertifikası verir ve yeniler. Cloudflare ayrıca edge SSL ekler. HTTPS zorunlu + HSTS.
- **Seçenek B:** **Caddy** otomatik olarak Let's Encrypt sertifikası alır ve yeniler (yukarıdaki `Caddyfile` ile). HSTS başlığı zaten tanımlı; HTTP → HTTPS yönlendirmesi Caddy'de otomatik.

---

## Staging vs Prod (her iki seçenek)

- **Seçenek A:** Frontend için Vercel/Render **PR preview** deploy'ları; API için Railway/Render ayrı **staging** servisi; DB için **Neon branching** ile prod'dan izole ücretsiz staging DB.
- **Seçenek B:** İkinci bir ucuz VPS ya da aynı VPS'te ikinci bir compose projesi (`docker-compose.staging.yml`, farklı portlar + `staging.celinegelinlik.com`). Basit tutmak için başlangıçta yalnızca prod + PR preview (Vercel) da olabilir.
- **Her iki durumda:** Staging alan adını **`noindex`** yap (`X-Robots-Tag: noindex`) — detay [SEO.md](SEO.md).

---

## Secrets / env yönetimi (her iki seçenek)

**Altın kural:** Gerçek secret'lar **asla repoda** olmaz. Repoda yalnızca değersiz `.env.example` bulunur.

- **`.env.example` (commit'li):** tüm anahtarların adlarını içerir, değerleri boş/örnek.
- **Gerçek değerler:**
  - **Seçenek A:** her platformun env yöneticisinde (Vercel Project Env, Railway Variables, Render Env Groups).
  - **Seçenek B:** sunucudaki `/opt/celine/.env` dosyasında + deploy için GitHub repo **Secrets** (`SSH_HOST`, `SSH_USER`, `SSH_KEY`, `SSH_PORT`).
- **Ortam ayrımı:** staging ve prod için **ayrı** DB URL, JWT secret, Cloudinary key vb.

Örnek `.env.example` (repoya commit edilir):

```dotenv
# ---- General ----
NODE_ENV=production

# ---- Web (apps/web) ----
NEXT_PUBLIC_API_URL=https://api.celinegelinlik.com
NEXT_PUBLIC_SITE_URL=https://celinegelinlik.com

# ---- API (apps/api) ----
PORT=3001
DATABASE_URL=postgresql://celine:CHANGEME@db:5432/celine?schema=public
POSTGRES_PASSWORD=CHANGEME

# ---- Auth (argon2 + JWT access/refresh) ----
JWT_ACCESS_SECRET=CHANGEME
JWT_REFRESH_SECRET=CHANGEME
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# ---- Cloudinary (görsel CDN, source of truth) ----
CLOUDINARY_CLOUD_NAME=CHANGEME
CLOUDINARY_API_KEY=CHANGEME
CLOUDINARY_API_SECRET=CHANGEME

# ---- İletişim / dönüşüm ----
WHATSAPP_PHONE=90XXXXXXXXXX
```

---

## Yedekleme (her iki seçenek)

- **Postgres:**
  - **Seçenek A:** Neon'un otomatik yedekleri/point-in-time restore'u açık. Ek güvence için **haftalık `pg_dump`** ile platform dışına kopya.
  - **Seçenek B:** VPS'te **haftalık `pg_dump` cron** — sunucu dışına (S3/Cloudinary/uzak disk) kopyala. Örnek cron:

    ```bash
    # /etc/cron.weekly/celine-db-backup  (chmod +x)
    #!/bin/sh
    set -e
    TS=$(date +\%Y\%m\%d)
    cd /opt/celine
    docker compose -f docker-compose.prod.yml exec -T db \
      pg_dump -U celine celine | gzip > /opt/celine/backups/celine-$TS.sql.gz
    # 8 haftadan eskileri sil
    find /opt/celine/backups -name 'celine-*.sql.gz' -mtime +56 -delete
    ```

    `backups/` dizinini uzak bir depoya (S3 vb.) senkronla ki VPS ölürse veri kaybı olmasın.
- **Görseller:** **Cloudinary görselin tek doğruluk kaynağıdır (source of truth).** Ayrıca yüksek çözünürlüklü orijinallerin **çevrimdışı bir kopyası** tutulmalı — gelinlik fotoğrafları işin asıl değeri.
- **Kod:** GitHub yedektir.

---

## Her iki seçenek için CI (lint + tsc + build)

Deploy'dan **önce** çalışan, PR'da ve `main`'de tetiklenen bir GitHub Actions CI workflow'u. pnpm workspace olduğu için tek job'da her iki app kontrol edilir.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]
  workflow_call:   # deploy.yml bunu çağırır (Seçenek B)

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm -r lint

      - name: Type check
        run: pnpm -r exec tsc --noEmit

      - name: Build
        run: pnpm -r build
        env:
          NEXT_PUBLIC_API_URL: https://api.celinegelinlik.com
          NEXT_PUBLIC_SITE_URL: https://celinegelinlik.com
```

- **Seçenek A:** Bu CI merge kapısı olarak koşar; deploy'u Vercel/Railway kendi otomatiğiyle yapar.
- **Seçenek B:** `deploy.yml` bu workflow'u `workflow_call` ile çağırır; yeşil olmadan SSH deploy adımı çalışmaz.

> Branch protection: `main`'e doğrudan push kapalı, PR + geçen `CI` zorunlu olacak şekilde ayarla.

---

## Özet

- **Seçenek A (yönetilen, önerilen):** Vercel Pro (web) + Railway (api) + Neon (db) + Cloudinary; native push-to-prod + PR preview; **~$0–25/mo**.
- **Seçenek B (kendi VPS'in):** Docker Compose (web + api + db + Caddy), GitHub Actions SSH deploy, otomatik Let's Encrypt TLS; **VPS kirası + domain/e-posta**.
- Ortak: Cloudflare DNS (celinegelinlik.com + api. subdomain), Zoho Mail Lite e-posta, otomatik SSL, staging/prod ayrımı, `.env.example` commit'li + gerçek secret'lar host/CI'da, haftalık `pg_dump` + Cloudinary source of truth, deploy öncesi lint/tsc/build CI.
- SEO, analytics, KVKK ayrıntıları için: [SEO.md](SEO.md).

### Sıradaki adım

Emre **A** mı **B** mi seçtiğini söylesin; ondan sonra seçilen yola göre kesin CI dosyası, Dockerfile'lar (Seçenek B) ve tek-seferlik sunucu komutları birebir kendi VPS'ine/hesaplarına göre finalize edilir.
