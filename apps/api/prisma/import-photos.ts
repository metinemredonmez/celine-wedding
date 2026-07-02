/**
 * Seda'nın stüdyo fotoğraflarını gerçek gelinliklere dönüştürür.
 * Fotoğraflar apps/web/public/gelinlikler/ altında; gruplar dress-photos.json'da.
 *
 *   cd /var/www/celine
 *   pnpm --filter api exec ts-node prisma/import-photos.ts
 *
 * İdempotent: aynı slug'ları silip yeniden oluşturur. Demo gelinlikleri (vera/aria/
 * luna/mira) temizler. Model adlarını sonra admin'den değiştirebilirsiniz.
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

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const manifest: Entry[] = JSON.parse(
    readFileSync(join(__dirname, 'dress-photos.json'), 'utf8'),
  );

  // Demo gelinlikleri temizle (kırık URL'li Vera/Aria/Luna/Mira).
  await prisma.dress.deleteMany({
    where: { slug: { in: ['vera', 'aria', 'luna', 'mira'] } },
  });

  const collection = await prisma.collection.upsert({
    where: { slug: 'koleksiyon' },
    update: {},
    create: {
      name: 'Koleksiyon',
      slug: 'koleksiyon',
      description: 'Celine gelinlik koleksiyonu.',
      order: 0,
    },
  });

  let i = 0;
  for (const entry of manifest) {
    i += 1;
    // İdempotent: varsa eski kaydı temizle.
    await prisma.dress.deleteMany({ where: { slug: entry.slug } });
    await prisma.dress.create({
      data: {
        name: entry.name,
        slug: entry.slug,
        status: DressStatus.PUBLISHED,
        featured: i <= 6, // ilk 6 model ana sayfa vitrininde
        order: i,
        collectionId: collection.id,
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
  }

  const total = manifest.reduce((sum, e) => sum + e.images.length, 0);
  console.log(`[import] ${manifest.length} gelinlik, ${total} foto eklendi ✅`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
