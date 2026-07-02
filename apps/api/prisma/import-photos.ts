/**
 * Seda'nın stüdyo fotoğraflarını gerçek gelinliklere + koleksiyonlara dönüştürür.
 * Fotoğraflar apps/web/public/gelinlikler/ altında; görsel listesi dress-photos.json'da.
 *
 *   cd /var/www/celine
 *   pnpm --filter api exec ts-node prisma/import-photos.ts
 *
 * İdempotent: aynı slug'ları silip yeniden oluşturur; boş demo koleksiyonlarını
 * (klasik/koleksiyon) ve demo gelinlikleri (vera/aria/luna/mira) temizler.
 * 10 model, görünümlerine göre 3 koleksiyona bölünür ve her koleksiyona kapak atanır.
 * Model adlarını (Model 1-10) sonra admin'den gerçek adlarla değiştirebilirsiniz.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient, DressStatus } from '@prisma/client';

// apps/api/.env'i elle yükle (DATABASE_URL lazım).
try {
  const raw = readFileSync(join(__dirname, '..', '.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[m[1]] = v;
  }
} catch {
  // .env yoksa mevcut ortamla devam.
}

interface Entry {
  slug: string;
  name: string;
  images: string[];
}

// Modelleri gerçek görünümlerine göre 3 koleksiyona böler + kapak atar.
const COLLECTIONS = [
  {
    slug: 'dantel',
    name: 'Dantel Koleksiyonu',
    description: 'El işi dantel ve tül; romantik, zamansız siluetler.',
    cover: '/gelinlikler/m02-1.jpg',
    models: ['model-2', 'model-3', 'model-8'],
  },
  {
    slug: 'saten',
    name: 'Saten Koleksiyonu',
    description: 'Saten ve balo etekleriyle klasik, görkemli gelinlikler.',
    cover: '/gelinlikler/m01-1.jpg',
    models: ['model-1', 'model-7'],
  },
  {
    slug: 'modern',
    name: 'Modern Koleksiyon',
    description: 'Çağdaş kesimler, ışıltı ve zarif detaylar.',
    cover: '/gelinlikler/m10-1.jpg',
    models: ['model-4', 'model-5', 'model-6', 'model-9', 'model-10'],
  },
];

// Ana sayfa vitrini — koleksiyonlara dengeli dağılmış 6 öne çıkan model.
const FEATURED = new Set([
  'model-1',
  'model-2',
  'model-5',
  'model-7',
  'model-8',
  'model-10',
]);

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const manifest: Entry[] = JSON.parse(
    readFileSync(join(__dirname, 'dress-photos.json'), 'utf8'),
  );
  const byModel = new Map(manifest.map((e) => [e.slug, e]));

  // 1) Demo + eski model kayıtlarını temizle (idempotent yeniden çalıştırma).
  const demoDresses = ['vera', 'aria', 'luna', 'mira'];
  await prisma.dress.deleteMany({
    where: { slug: { in: [...demoDresses, ...manifest.map((e) => e.slug)] } },
  });

  // 2) Koleksiyonları kapak görseliyle upsert et.
  const collectionId = new Map<string, string>();
  let order = 0;
  for (const c of COLLECTIONS) {
    const col = await prisma.collection.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        coverImage: c.cover,
        order,
      },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        coverImage: c.cover,
        order,
      },
    });
    collectionId.set(c.slug, col.id);
    order += 1;
  }

  // 3) Modelleri ilgili koleksiyona ekle (görselleriyle).
  let dressCount = 0;
  for (const c of COLLECTIONS) {
    let i = 0;
    for (const modelSlug of c.models) {
      const entry = byModel.get(modelSlug);
      if (!entry) {
        console.warn(`[import] uyarı: ${modelSlug} dress-photos.json'da yok, atlandı`);
        continue;
      }
      await prisma.dress.create({
        data: {
          name: entry.name,
          slug: entry.slug,
          status: DressStatus.PUBLISHED,
          featured: FEATURED.has(entry.slug),
          order: i,
          collectionId: collectionId.get(c.slug)!,
          images: {
            create: entry.images.map((url, idx) => ({
              url,
              publicId: url, // yerel yol — benzersiz kimlik
              alt: entry.name,
              order: idx,
            })),
          },
        },
      });
      dressCount += 1;
      i += 1;
    }
  }

  // 4) Artık boş kalan demo koleksiyonlarını sil (klasik + eski tekil koleksiyon).
  await prisma.collection.deleteMany({
    where: { slug: { in: ['klasik', 'koleksiyon'] } },
  });

  const totalPhotos = manifest.reduce((s, e) => s + e.images.length, 0);
  console.log(
    `[import] ${COLLECTIONS.length} koleksiyon, ${dressCount} gelinlik, ${totalPhotos} foto eklendi ✅`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
