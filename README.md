# Celine Gelinlik

Lüks, minimal, fotoğraf odaklı butik gelinlik **tanıtım sitesi**.
Gerçek gelinlik fotoğraflarını editoryal bir dille sergiler; birincil hedef
**atölye randevusu / WhatsApp** dönüşümüdür. Online satış yoktur.

- **Web:** https://celinegelinlik.com
- **Repo:** https://github.com/metinemredonmez/celine-wedding
- **Konum:** İdealtepe Mah. Panaroma Sok. Defne Apt. No:5 D:7, Maltepe / İstanbul

---

## Teknoloji

| Katman | Seçim |
| --- | --- |
| Frontend | Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion |
| Yardımcı UI | Magic UI (3-4 efekt) · Aceternity UI (çok sınırlı) |
| Backend | NestJS · Prisma ORM · PostgreSQL · JWT · Swagger |
| Görsel | Cloudinary (görsel CDN + dönüşüm) |
| Formlar | React Hook Form + Zod |
| Dil | Türkçe (birincil), İngilizce (opsiyonel) |

> Tasarım ilkesi: sayfanın %80'i fotoğraf. Kırık beyaz / şampanya / yakın-siyah
> palet, zarif serif başlık + temiz sans gövde, çok az border-radius, neredeyse
> hiç gölge, yavaş ve zarif animasyon.

---

## Monorepo Yapısı

```
celine-wedding/
├── apps/
│   ├── web/            # Next.js — herkese açık site + /admin paneli
│   └── api/            # NestJS — REST API + Prisma + PostgreSQL
├── docs/               # Proje dokümanları (mimari, tasarım, deploy, yol haritası)
├── .github/workflows/  # CI/CD (push → prod)
├── package.json        # pnpm workspaces (kök scriptler)
└── pnpm-workspace.yaml
```

---

## Hızlı Başlangıç

Gereksinimler: **Node 20+**, **pnpm 9+**, çalışan bir **PostgreSQL** (yerelde Docker ile).

```bash
# 1) bağımlılıklar
pnpm install

# 2) ortam değişkenleri (örneklerden kopyala, doldur)
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# 3) veritabanı (Prisma)
pnpm --filter api prisma migrate dev

# 4) geliştirme (web + api birlikte)
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000 · Swagger: http://localhost:4000/docs

---

## Dokümanlar

| Doküman | İçerik |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Sistem mimarisi, veri akışı, klasör yapısı |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | Prisma şeması, tablolar, API uçları |
| [docs/DESIGN.md](docs/DESIGN.md) | Tasarım sistemi: renk, tipografi, bileşen haritası |
| [docs/PAGES.md](docs/PAGES.md) | Sayfa-sayfa kurgu (IA) ve bölüm bölüm wireframe |
| [docs/ADMIN.md](docs/ADMIN.md) | Yönetim paneli (mini-CMS) tasarımı |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Sunucu, CI/CD, domain, SSL, yedekleme |
| [docs/SEO.md](docs/SEO.md) | SEO, performans, analitik, KVKK |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Faz 1 (MVP) → Faz 2 → Faz 3 |

---

## Ortam Değişkenleri

Her uygulamanın kendi `.env.example` dosyası vardır. Gerçek değerler **asla**
commit edilmez (`.gitignore` bunları hariç tutar); prod sırları sunucuda /
CI secrets içinde tutulur. Ayrıntı: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Lisans

Özel / ticari — tüm hakları saklıdır.
