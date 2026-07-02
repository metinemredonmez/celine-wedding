# Veri Modeli ve API Spesifikasyonu

Bu belge **Celine Gelinlik** projesinin backend katmanını tanımlar: NestJS modül yapısı, tam `schema.prisma` şeması, REST API uç noktaları, kimlik doğrulama (auth), görsel yükleme akışı, doğrulama/hata yönetimi ve migration/seed stratejisi.

İlgili belgeler: [Mimari](ARCHITECTURE.md) · [Tasarım](DESIGN.md) · [Sayfalar](PAGES.md) · [Admin](ADMIN.md) · [Deployment](DEPLOYMENT.md) · [SEO](SEO.md) · [Yol Haritası](ROADMAP.md)

> **Doğrulanmış stack (Temmuz 2026):** NestJS 11.1.x (varsayılan SWC derleyicisi), Prisma ORM 7.x (Rust'sız TS client, `prisma-client` provider ve zorunlu `output`), `@nestjs/throttler` v6 (ttl milisaniye cinsinden), OWASP 2024+ önerisiyle **argon2id** parola hashleme.

---

## 0. Genel Bakış

Celine Gelinlik bir **vitrin (showcase) sitesidir**: e-ticaret, sepet veya fiyat yoktur. Birincil dönüşüm hedefi atölye randevusu ve WhatsApp iletişimidir. Backend'in görevi, koleksiyon ve modelleri (gelinlikleri) yönetmek, görselleri CDN üzerinden sunmak ve randevu taleplerini toplamaktır.

```
Next.js public site  ──GET──▶  ┌──────────────────────────────┐
(SSG/ISR, salt-okunur)         │        NestJS API            │
                               │  Public okuma + form uçları  │
Admin paneli (Next.js) ─CRUD─▶ │  JWT korumalı admin uçları   │
                               └──────────────┬───────────────┘
                                              │ Prisma 7
                                              ▼
                                        PostgreSQL
İşletme sahibi tarayıcı ─imzalı doğrudan yükleme─▶ Cloudinary (görsel CDN)
        ▲──────imza──── NestJS /media/sign ───────┘
```

**Tasarım ilkeleri.** İşletme sahibi teknik değildir, trafik düşüktür ve en ağır varlık görsellerdir. Bu yüzden: (a) görsel byte'ları **doğrudan Cloudinary'ye** iletilir (asla Node süreci üzerinden geçmez), (b) API, Cloudinary/Next önbelleklerinin arkasında durumsuz (stateless) tutulur, (c) tek bir admin rolü ile RBAC karmaşıklığından kaçınılır.

---

## 1. NestJS Modül Yapısı

Monorepo içindeki `apps/api` uygulaması aşağıdaki dizin yapısını izler:

```
src/
├── main.ts                     # bootstrap: Helmet, CORS, ValidationPipe, Swagger, versioning
├── app.module.ts               # tüm feature modülleri + ThrottlerModule (global guard)
├── prisma/
│   ├── prisma.module.ts        # @Global()
│   └── prisma.service.ts       # PrismaClient'i extend eder, onModuleInit connect
├── config/
│   ├── configuration.ts        # tipli env loader
│   └── env.validation.ts       # process.env için Joi/class-validator şeması
├── common/
│   ├── decorators/             # @CurrentUser, @Public
│   ├── guards/                 # JwtAuthGuard (global), RolesGuard (opsiyonel)
│   ├── interceptors/           # (gerekirse transform / logging)
│   ├── filters/                # AllExceptionsFilter, PrismaExceptionFilter
│   ├── dto/                    # PaginationQueryDto, PaginatedResponseDto
│   └── utils/                  # slugify.ts, crypto.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts      # POST /auth/login, /auth/refresh, /auth/logout, GET /auth/me
│   ├── auth.service.ts         # parola doğrulama, token üretme/döndürme (rotation)
│   ├── strategies/             # jwt.strategy.ts, jwt-refresh.strategy.ts
│   ├── guards/                 # jwt-auth.guard, jwt-refresh.guard
│   └── dto/                    # login.dto.ts, refresh.dto.ts
├── dresses/                    # modeller / gelinlikler
│   ├── dresses.module.ts
│   ├── dresses.controller.ts   # public okuma + admin CRUD (route/guard ile ayrılır)
│   ├── dresses.service.ts
│   └── dto/                    # create-dress.dto, update-dress.dto, query-dress.dto, reorder-images.dto
├── collections/               # koleksiyonlar
│   ├── collections.module.ts
│   ├── collections.controller.ts
│   ├── collections.service.ts
│   └── dto/
├── media/                      # görsel depolama soyutlaması (Cloudinary)
│   ├── media.module.ts
│   ├── media.controller.ts     # POST /media/sign, POST /media/attach, DELETE /media/:id
│   ├── media.service.ts        # imza üretimi, Cloudinary'den silme, Image satır yönetimi
│   └── storage/
│       ├── storage.interface.ts   # StorageProvider port
│       └── cloudinary.provider.ts # adapter (ileride S3/MinIO ile değiştirilebilir)
├── appointments/              # randevu talepleri
│   ├── appointments.module.ts
│   ├── appointments.controller.ts # public create (throttled) + admin list/update/delete
│   ├── appointments.service.ts
│   └── dto/
├── settings/                  # site ayarları (iletişim, hakkımızda)
│   ├── settings.module.ts
│   ├── settings.controller.ts  # public GET (singleton), admin PUT
│   └── settings.service.ts
└── health/
    ├── health.module.ts
    └── health.controller.ts    # @nestjs/terminus: DB + Cloudinary ping
```

**Neden ayrı bir `media` modülü?** Görseller yalnızca modellerde değil; koleksiyon kapaklarında ve site ayarlarında da kullanılır. İmza üretimi ve Cloudinary silme işlemlerini tek bir adapter'da toplamak, depolama sağlayıcısını `StorageProvider` arayüzünün arkasında değiştirilebilir tutar.

---

## 2. Prisma Şeması (`prisma/schema.prisma`)

Prisma 7, yeni `prisma-client` provider'ını ve açık bir `output` yolunu zorunlu kılar. Aşağıda dosyanın tamamı verbatim olarak verilmiştir:

```prisma
generator client {
  provider = "prisma-client"          // Prisma 7 Rust-free client
  output   = "../src/generated/prisma" // required in v7; import from here
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────── ENUMS ───────────────────────────

enum DressStatus {
  DRAFT
  PUBLISHED
}

enum AppointmentStatus {
  NEW
  CONTACTED
  DONE
}

enum AdminRole {
  ADMIN
}

// ────────────────────────── MODELS ───────────────────────────

model Collection {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  coverImage  String?  // Cloudinary secure_url of cover (optional)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  dresses     Dress[]

  @@index([order])
  @@map("collections")
}

model Dress {
  id           String      @id @default(cuid())
  name         String                       // "model" / product name
  slug         String      @unique
  description  String?
  price        Decimal?    @db.Decimal(10, 2) // optional; boutiques often hide price
  fabric       String?
  details      String?                       // free-text extra details
  status       DressStatus @default(DRAFT)
  featured     Boolean     @default(false)
  order        Int         @default(0)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  collectionId String?
  collection   Collection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)

  images       Image[]

  // Public queries filter by status+featured and sort by order/createdAt.
  @@index([status, featured, order])
  @@index([collectionId, status])
  @@index([slug])
  @@map("dresses")
}

model Image {
  id        String   @id @default(cuid())
  url       String                 // Cloudinary secure_url
  publicId  String   @unique       // Cloudinary public_id — needed to delete/transform
  alt       String?
  width     Int?
  height    Int?
  order     Int      @default(0)
  createdAt DateTime @default(now())

  dressId   String
  dress     Dress    @relation(fields: [dressId], references: [id], onDelete: Cascade)

  @@index([dressId, order])       // fetch + order a dress's gallery
  @@map("images")
}

model Appointment {
  id            String            @id @default(cuid())
  name          String
  phone         String
  email         String?
  preferredDate DateTime?
  message       String?
  status        AppointmentStatus @default(NEW)
  createdAt     DateTime          @default(now())

  @@index([status, createdAt])
  @@map("appointments")
}

model AdminUser {
  id                 String    @id @default(cuid())
  email              String    @unique
  passwordHash       String
  role               AdminRole @default(ADMIN)
  refreshTokenHash   String?               // hashed current refresh token (rotation)
  lastLoginAt        DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@map("admin_users")
}

model SiteSettings {
  id        String   @id @default("singleton") // enforce one row
  phone     String?
  whatsapp  String?
  instagram String?
  address   String?
  mapUrl    String?
  about     String?  @db.Text
  updatedAt DateTime @updatedAt

  @@map("site_settings")
}
```

### Şema Kararlarının Gerekçeleri

| Karar | Gerekçe |
|---|---|
| **`cuid()` ID'ler** (autoincrement yerine) | Public URL'lerde güvenle gösterilebilir, enumeration (numara tahmini) saldırısına kapalı. |
| **`price Decimal`** (`@db.Decimal(10,2)`) | Para asla `Float` olarak saklanmaz. Site fiyat göstermese de model ileride kapıyı açık tutar. |
| **`Image.onDelete: Cascade`** | Bir model DB'den silinince görsel satırları da silinir. (Cloudinary varlıkları servis katmanında ayrıca temizlenir — DB cascade CDN'i çağırmaz.) |
| **`Dress.collectionId onDelete: SetNull`** | Bir koleksiyon silindiğinde modeller silinmemeli, yalnızca ilişkileri boşalmalı. |
| **`publicId @unique`** | Silme ve dönüştürme (transformation) işlemleri için taşıyıcı (load-bearing) alandır. |
| **`SiteSettings.id = "singleton"`** | Sabit id sayesinde upsert her zaman tek satırı hedefler. |
| **Bileşik index `[status, featured, order]`** | En sık çalışan public sorguyu (published + featured, sıralı) doğrudan besler. |

> **Not:** Fiyat vitrin sitesinde gösterilmez; `price` alanı yalnızca admin panelinde iç kullanım/gelecek esneklik içindir. Public API yanıtlarında fiyat gösterilip gösterilmeyeceği ürün kararıdır — varsayılan yaklaşım, public select'te fiyatı dahil etmemektir.

---

## 3. REST API Tasarımı

Temel yol (base path): `/api/v1` (URI versioning açık). `🔓` = public · `🔒` = JWT admin.

| Method | Route | Auth | Amaç |
|---|---|---|---|
| GET | `/health` | 🔓 | Liveness/readiness (DB + Cloudinary) |
| **Auth** ||||
| POST | `/auth/login` | 🔓 | Email + parola → access + refresh token |
| POST | `/auth/refresh` | 🔒 (refresh) | Rotation: yeni access + refresh |
| POST | `/auth/logout` | 🔒 | Saklanan refresh hash'ini geçersiz kıl |
| GET | `/auth/me` | 🔒 | Geçerli admin profili |
| **Collections** ||||
| GET | `/collections` | 🔓 | Yayınlı koleksiyonları `order`'a göre listeler |
| GET | `/collections/:slug` | 🔓 | Bir koleksiyon + içindeki yayınlı modeller |
| POST | `/admin/collections` | 🔒 | Oluştur |
| PATCH | `/admin/collections/:id` | 🔒 | Güncelle |
| DELETE | `/admin/collections/:id` | 🔒 | Sil (modellerin `collectionId` alanı null olur) |
| PATCH | `/admin/collections/reorder` | 🔒 | Toplu sıralama `[{id, order}]` |
| **Dresses (Modeller)** ||||
| GET | `/dresses` | 🔓 | Sayfalı liste; filtre `collection`, `featured`; sıralama `order`/`createdAt`/`price`; **yalnızca PUBLISHED** |
| GET | `/dresses/:slug` | 🔓 | Bir yayınlı model + sıralı görseller |
| GET | `/admin/dresses` | 🔒 | **Tümü** (taslaklar dahil), duruma göre filtre |
| GET | `/admin/dresses/:id` | 🔒 | Tek kayıt (her durum) |
| POST | `/admin/dresses` | 🔒 | Oluştur |
| PATCH | `/admin/dresses/:id` | 🔒 | Güncelle (status, featured, alanlar) |
| DELETE | `/admin/dresses/:id` | 🔒 | Modeli + Cloudinary görsellerini sil |
| PATCH | `/admin/dresses/reorder` | 🔒 | Toplu sıralama |
| PATCH | `/admin/dresses/:id/images/reorder` | 🔒 | Galeri sıralaması `[{id, order}]` |
| **Media (Görsel)** ||||
| POST | `/admin/media/sign` | 🔒 | Doğrudan yükleme için Cloudinary imza + parametreleri döner |
| POST | `/admin/media/attach` | 🔒 | Client yüklemesinden sonra Image metadata'sını kaydeder `{dressId, publicId, url, width, height, alt}` |
| DELETE | `/admin/media/:id` | 🔒 | Görseli sil (DB satırı + Cloudinary varlığı) |
| **Appointments (Randevu)** ||||
| POST | `/appointments` | 🔓 | Public randevu formu (**rate-limited**) |
| GET | `/admin/appointments` | 🔒 | Sayfalı liste, duruma göre filtre |
| PATCH | `/admin/appointments/:id` | 🔒 | Durum güncelle (new → contacted → done) |
| DELETE | `/admin/appointments/:id` | 🔒 | Sil |
| **Settings** ||||
| GET | `/settings` | 🔓 | Public iletişim/hakkımızda bilgisi |
| PUT | `/admin/settings` | 🔒 | Singleton upsert |

### Sayfalama Yanıt Şekli

Offset (sayfa numaralı) sayfalama kullanılır — küçük bir katalog için en basit yaklaşımdır. (Prisma 7 büyük veri setlerinde cursor sayfalamayı önerir; ancak bir butik yalnızca onlarca model içerir, dolayısıyla offset yeterlidir ve admin arayüzünde sayfa numaralarını mümkün kılar.)

```jsonc
{
  "data": [ /* Dress[] */ ],
  "meta": { "total": 42, "page": 1, "limit": 12, "totalPages": 4 }
}
```

### Public Query DTO

```ts
// dresses/dto/query-dress.dto.ts
import { IsOptional, IsInt, Min, Max, IsBoolean, IsString, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDressDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 12, maximum: 48 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(48)
  limit = 12;

  @ApiPropertyOptional({ description: 'Collection slug' })
  @IsOptional() @IsString()
  collection?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ enum: ['order', 'createdAt', 'price'], default: 'order' })
  @IsOptional() @IsIn(['order', 'createdAt', 'price'])
  sort: 'order' | 'createdAt' | 'price' = 'order';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional() @IsIn(['asc', 'desc'])
  dir: 'asc' | 'desc' = 'asc';
}
```

### Public Servis Metodu

Payload boyutunu küçük tutmak için whitelist-select kullanılır ve durum sunucu tarafında **PUBLISHED** olarak zorlanır:

```ts
// dresses/dresses.service.ts (excerpt)
async findPublic(q: QueryDressDto) {
  const where: Prisma.DressWhereInput = {
    status: 'PUBLISHED',
    ...(q.featured !== undefined && { featured: q.featured }),
    ...(q.collection && { collection: { slug: q.collection } }),
  };

  const [total, data] = await this.prisma.$transaction([
    this.prisma.dress.count({ where }),
    this.prisma.dress.findMany({
      where,
      orderBy: { [q.sort]: q.dir },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      select: {
        id: true, name: true, slug: true, price: true, fabric: true,
        featured: true, order: true,
        collection: { select: { name: true, slug: true } },
        images: {
          orderBy: { order: 'asc' },
          take: 1,                        // list = cover thumb only
          select: { url: true, alt: true, width: true, height: true },
        },
      },
    }),
  ]);

  return {
    data,
    meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
  };
}
```

---

## 4. Kimlik Doğrulama (JWT access + refresh, argon2id, tek admin rolü)

### Hashleme

Argon2id, OWASP 2024+ varsayılanıdır. Hızlı Rust bağlaması `@node-rs/argon2` kullanılır (saf JS argon2 yaklaşık 100× daha yavaştır). OWASP minimum parametreleri: 19 MiB bellek, 2 iterasyon, parallelism 1.

```ts
// common/utils/crypto.ts
import { hash, verify, Algorithm } from '@node-rs/argon2';

const opts = { algorithm: Algorithm.Argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };
export const hashSecret = (s: string) => hash(s, opts);
export const verifySecret = (digest: string, s: string) => verify(digest, s);
```

### Token'lar

Kısa ömürlü **access** token (15 dk) bellekte/`Authorization` header'ında; uzun ömürlü **refresh** token (7 gün) her kullanımda döndürülür (rotation). Geçerli refresh token'ın **hash**'i `AdminUser.refreshTokenHash` alanında saklanır — böylece logout ve rotation, token'ı sunucu tarafında geçersiz kılabilir (session tablosuna gerek kalmadan, tek DB alanıyla, neredeyse durumsuz).

```ts
// auth/auth.service.ts (core)
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private cfg: ConfigService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.adminUser.findUnique({ where: { email: dto.email } });
    if (!user || !(await verifySecret(user.passwordHash, dto.password)))
      throw new UnauthorizedException('Invalid credentials'); // generic message, no user enumeration
    return this.issueTokens(user.id, user.email);
  }

  async refresh(userId: string, presentedRt: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { id: userId } });
    if (!user?.refreshTokenHash || !(await verifySecret(user.refreshTokenHash, presentedRt)))
      throw new ForbiddenException('Access denied');
    return this.issueTokens(user.id, user.email); // rotation → new pair, new stored hash
  }

  async logout(userId: string) {
    await this.prisma.adminUser.update({ where: { id: userId }, data: { refreshTokenHash: null } });
  }

  private async issueTokens(sub: string, email: string) {
    const payload = { sub, email, role: 'ADMIN' };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.cfg.get('JWT_ACCESS_SECRET'), expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.cfg.get('JWT_REFRESH_SECRET'), expiresIn: '7d',
      }),
    ]);
    await this.prisma.adminUser.update({
      where: { id: sub },
      data: { refreshTokenHash: await hashSecret(refreshToken), lastLoginAt: new Date() },
    });
    return { accessToken, refreshToken };
  }
}
```

### Strateji + Global Guard

`JwtAuthGuard`, `APP_GUARD` olarak kaydedilir ve public route'lar bir `@Public()` decorator'ı ile işaretlenir — bu daha güvenli bir varsayılandır (opt-out edilmedikçe her şey korunur).

```ts
// auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }
  validate(payload: { sub: string; email: string; role: string }) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}

// common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }
  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    return isPublic ? true : super.canActivate(ctx);
  }
}
```

Refresh stratejisi, token'ı body/header'dan okur ve `validate`'e iletir; böylece `refresh()` hash'leri karşılaştırabilir. Tek rol (`ADMIN`) olduğu için `RolesGuard` bugün opsiyoneldir; ancak enum + payload `role` alanı, gelecekte migration derdi olmadan bir `EDITOR` rolü eklemenin kapısını açık tutar.

### İlk Admin'in Seed'lenmesi

Seed betiği (Bölüm 7) üzerinden, kimlik bilgileri env'den alınarak, idempotent upsert ile:

```ts
const email = process.env.SEED_ADMIN_EMAIL!;
const password = process.env.SEED_ADMIN_PASSWORD!;
await prisma.adminUser.upsert({
  where: { email },
  update: {},
  create: { email, passwordHash: await hashSecret(password), role: 'ADMIN' },
});
```

Bir kez çalıştırın:

```bash
SEED_ADMIN_EMAIL=owner@celinegelinlik.com SEED_ADMIN_PASSWORD='...' npx prisma db seed
```

Ardından env değerlerini kaldırın/döndürün (rotate). **Asla sabit kodlanmış (hard-coded) bir varsayılan parola göndermeyin.**

---

## 5. Görsel Yükleme Akışı — Öneri

### Önerilen: **doğrudan Cloudinary'ye imzalı yükleme** (tarayıcı → Cloudinary)

API yalnızca imzalar ve metadata'yı saklar.

**Akış:**

1. Admin bir dosya seçer. Front-end, yüklemek istediği parametrelerle (ör. `folder`, `public_id`) `POST /admin/media/sign` (JWT korumalı) çağırır.
2. API, `{ signature, timestamp, apiKey, cloudName, folder }` döner. API secret **asla sunucudan çıkmaz**.
3. Tarayıcı dosyayı, bu parametrelerle **doğrudan** `https://api.cloudinary.com/v1_1/<cloud>/image/upload` adresine POST eder. Cloudinary `public_id`, `secure_url`, `width`, `height` döner.
4. Tarayıcı bu metadata ile `POST /admin/media/attach` çağırır → API, `Image` satırını oluşturur (model için `order = max+1`).
5. Sıralama = `PATCH /admin/dresses/:id/images/reorder` ile `[{id, order}]`. Silme = `DELETE /admin/media/:id` (önce `publicId` ile Cloudinary varlığını, sonra DB satırını kaldırır).

**İmza üretimi:**

```ts
// media/media.service.ts (excerpt)
import { v2 as cloudinary } from 'cloudinary';

signUpload(params: { folder: string; publicId?: string }) {
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = { timestamp, folder: params.folder, ...(params.publicId && { public_id: params.publicId }) };
  const signature = cloudinary.utils.api_sign_request(toSign, this.cfg.getOrThrow('CLOUDINARY_API_SECRET'));
  return {
    signature, timestamp,
    apiKey: this.cfg.getOrThrow('CLOUDINARY_API_KEY'),
    cloudName: this.cfg.getOrThrow('CLOUDINARY_CLOUD_NAME'),
    folder: params.folder,
  };
}

async remove(id: string) {
  const img = await this.prisma.image.findUniqueOrThrow({ where: { id } });
  await cloudinary.uploader.destroy(img.publicId);          // CDN first
  await this.prisma.image.delete({ where: { id } });        // then DB
}
```

### Çoklu Boyutlar — pre-generate ETMEYİN

Boyutları önceden üretmeyin/saklamayın. Cloudinary anlık (on-the-fly), önbelleklenen dönüşümler sağlar — Next.js `<Image>` bileşeni türetilmiş URL'leri ister:

```
https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_400/<public_id>.jpg   # thumb
https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_1200/<public_id>.jpg  # detail
```

`f_auto,q_auto` = otomatik AVIF/WebP + kalite. Yalnızca temel `secure_url` + `publicId` saklanır; genişlikler render anında türetilir. Bu, küçük bir butik için en büyük kazanımdır: sıfır görsel-işleme kodu, otomatik modern formatlar, CDN önbellekleme.

> **Metadata'da saklananlar:** `url` (secure_url), `publicId`, `width`, `height`, `alt`, `order`. `blurDataURL` gibi placeholder gerekirse, `attach` sırasında küçük bir base64 blur önizlemesi de bu satırda saklanabilir; alternatif olarak render katmanında `e_blur` transformasyonu ile türetilebilir.

### Neden Bu Yaklaşım? (Alternatiflerle Karşılaştırma)

| | **Cloudinary (önerilen)** | AWS S3 | MinIO (self-host) |
|---|---|---|---|
| Anlık resize/format | ✅ dahili (`f_auto,q_auto`) | ❌ Lambda@Edge / imgproxy gerekir | ❌ imgproxy sidecar gerekir |
| CDN | ✅ dahil | ➕ CloudFront (ek kurulum/maliyet) | ❌ DIY (önüne Cloudflare) |
| Teknik olmayan sahip için ops yükü | ✅ neredeyse sıfır | Orta (IAM, bucket policy, CF) | Yüksek (sunucu, yedekleme, TLS sizde) |
| Butik ölçeğinde maliyet | Ücretsiz katman ≈ 25 credit/ay (storage+transform+bandwidth ortak) — küçük katalog için rahat yeterli; büyürse ~$89/ay | Storage için kuruşlar, ancak CloudFront + resize altyapısı maliyet ve karmaşıklık ekler | VPS ~$5–10/ay, ama asıl maliyet sizin zamanınız |
| Vendor lock-in | Orta (`StorageProvider` arayüzü ile azaltılmış) | Düşük | Yok |

**Öneri: Cloudinary, doğrudan imzalı yükleme.** Teknik olmayan bir sahip ve küçük bir gelinlik kataloğu için ücretsiz katman yeterlidir ve tüm görsel-işleme/CDN mühendisliğini ortadan kaldırır. Bunu bir `StorageProvider` arayüzünün arkasında izole ederiz; böylece ileride (bant genişliği patlarsa) S3 + imgproxy'ye geçiş bir yeniden yazım değil, tek adapter değişikliğidir.

> **Doğrudan yükleme neden API üzerinden yüklemeyi yener?** Gelinlik fotoğrafları büyüktür (birkaç MB). Bunları Node süreci üzerinden akıtmak bellek/bant genişliği israf eder, request timeout riski taşır ve Multer + boyut limitleri gerektirir. Doğrudan yükleme bunların tümünü Cloudinary'ye devreder; API yalnızca birkaç yüz byte metadata'ya dokunur.

> **Maliyet notu:** Güncel limitleri Cloudinary Console'da doğrulayın (plana özgüdür ve değişebilir) — ücretsiz "Programmable Media" katmanı; storage, transformation ve bandwidth arasında credit-havuzludur ve düşük trafikli bir vitrin butiği için tipik olarak limitler içinde kalır.

---

## 6. Doğrulama, Hata Yönetimi, Swagger, CORS, Rate Limiting

### Global Doğrulama (validation)

Whitelist + transform, bilinmeyen alanları ayıklar:

```ts
// main.ts (excerpt)
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // strip non-DTO props
  forbidNonWhitelisted: true,   // 400 on unexpected props
  transform: true,              // apply @Type coercions
  transformOptions: { enableImplicitConversion: false },
}));
```

### Örnek Write DTO

```ts
// dresses/dto/create-dress.dto.ts
export class CreateDressDto {
  @ApiProperty() @IsString() @Length(2, 120) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 140) slug?: string; // auto from name if omitted
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) price?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() fabric?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() details?: string;
  @ApiPropertyOptional({ enum: DressStatus }) @IsOptional() @IsEnum(DressStatus) status?: DressStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() featured?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() order?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() collectionId?: string;
}
```

### Hata Yönetimi — Prisma hatalarını temiz HTTP'ye eşleme

```ts
// common/filters/prisma-exception.filter.ts
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    switch (e.code) {
      case 'P2002': // unique constraint (e.g. slug/email)
        return res.status(409).json({ statusCode: 409, message: `Duplicate value for ${e.meta?.target}` });
      case 'P2025': // record not found
        return res.status(404).json({ statusCode: 404, message: 'Resource not found' });
      default:
        return res.status(400).json({ statusCode: 400, message: 'Database request error' });
    }
  }
}
```

Bunu bir catch-all `AllExceptionsFilter` ile birlikte kaydedin (sıra önemlidir: önce özel/spesifik filtre).

### Swagger

`/docs` üzerinde Bearer auth ile — böylece sahip/geliştirici admin uçlarını test edebilir:

```ts
// main.ts (excerpt)
const config = new DocumentBuilder()
  .setTitle('Celine Gelinlik API')
  .setDescription('Public vitrin + admin paneli API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
```

### CORS

Yalnızca Next.js origin'lerine izin verilir (allowlist):

```ts
app.enableCors({
  origin: cfg.get('CORS_ORIGINS')!.split(','), // ör. https://celinegelinlik.com,https://admin.celinegelinlik.com
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

### Rate Limiting

`@nestjs/throttler` v6 (ttl **milisaniye** cinsinden; `seconds()` yardımcısını kullanın). Global cömert bir varsayılan, public randevu formunda spam'i engelleyecek katı bir override:

```ts
// app.module.ts
ThrottlerModule.forRoot({
  throttlers: [{ name: 'default', ttl: seconds(60), limit: 60 }], // 60 req/dk baseline
}),
{ provide: APP_GUARD, useClass: ThrottlerGuard },

// appointments.controller.ts
@Public()
@Throttle({ default: { ttl: seconds(3600), limit: 5 } }) // 5 randevu / saat / IP
@Post()
create(@Body() dto: CreateAppointmentDto) { return this.service.create(dto); }
```

Ayrıca Helmet (`app.use(helmet())`) ve küçük JSON payload'ları için bir body boyut limiti (`app.use(json({ limit: '100kb' }))`) ekleyin — dosya byte'ları zaten API'ye hiç ulaşmaz.

---

## 7. Migration ve Seed Stratejisi

### Migration (`prisma migrate`)

- **Dev:** `npx prisma migrate dev --name <change>` — migration oluşturur + uygular + client'ı yeniden üretir. Üretilen `prisma/migrations/**` SQL dosyalarını commit'leyin.
- **Prod/CI:** `npx prisma migrate deploy` — yalnızca commit'lenmiş migration'ları uygular, asla SQL üretmez. Release adımında, uygulama açılmadan **önce** çalışır.
- Atılabilir prototipleme dışında **asla `db push` kullanmayın** — migration geçmişi üretmez.

### Seed

`package.json`'da yapılandırılır, idempotent'tir ve yeniden çalıştırılabilir:

```json
// package.json
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

```ts
// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma/client'; // Prisma 7 custom output path
import { hashSecret } from '../src/common/utils/crypto';

const prisma = new PrismaClient();

async function main() {
  // 1. First admin (from env — no hard-coded secrets)
  const email = process.env.SEED_ADMIN_EMAIL, password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    await prisma.adminUser.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: await hashSecret(password), role: 'ADMIN' },
    });
  }
  // 2. SiteSettings singleton
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  // 3. (Opsiyonel) dev için başlangıç "Featured" koleksiyonu
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e); await prisma.$disconnect(); process.exit(1);
});
```

### Önerilen npm Script'leri

```jsonc
"scripts": {
  "db:migrate":  "prisma migrate dev",
  "db:deploy":   "prisma migrate deploy",
  "db:seed":     "prisma db seed",
  "db:studio":   "prisma studio",         // gerekirse sahibe ham veri görünümü verir
  "postinstall": "prisma generate"        // install/CI sırasında client'ı yeniden üretir
}
```

**Deploy sırası:** `migrate deploy` → `db seed` (idempotent) → uygulamayı başlat.

---

## Temel Kararların Özeti

- **Prisma 7** `prisma-client` provider + özel `output` — import `src/generated/prisma/client`'tan yapılır, `@prisma/client`'tan değil.
- **argon2id** (`@node-rs/argon2`) OWASP 2024+ parametreleriyle, bcrypt değil.
- **JWT access (15dk) + refresh (7g)**; döndürülen (rotating), hash'lenmiş refresh token tek bir DB kolonunda saklanır; global `JwtAuthGuard` + `@Public()` opt-out.
- **Doğrudan Cloudinary'ye imzalı yükleme**; yalnızca `publicId` + `url` saklanır; boyutlar render anında `f_auto,q_auto,w_*` ile türetilir. `StorageProvider` arayüzü ile vendor-izole.
- **Offset sayfalama** (sayfa numaralı admin + küçük katalog için uygun); tüm public okumalarda PUBLISHED-only sunucu tarafında zorlanır.
- **Throttler v6**: public randevu formunda katı 5/saat; global 60/dk.

---

## Kaynaklar

- [Announcing NestJS 11 — Trilon](https://trilon.io/blog/announcing-nestjs-11-whats-new)
- [Prisma 7 — The Next Evolution of Prisma ORM](https://www.prisma.io/blog/the-next-evolution-of-prisma-orm)
- [Upgrade to Prisma ORM 7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Cloudinary — Generating authentication signatures](https://cloudinary.com/documentation/authentication_signatures)
- [Cloudinary — Client-side uploading](https://cloudinary.com/documentation/client_side_uploading)
- [NestJS — Rate Limiting (Throttler)](https://docs.nestjs.com/security/rate-limiting)
