import { PrismaClient, DressStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// OWASP 2024+ argon2id parameters (see docs/DATA-MODEL.md §4).
const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.');
    return;
  }

  const passwordHash = await argon2.hash(password, ARGON2_OPTS);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  await prisma.adminUser.upsert({
    where: { email },
    // Do not clobber a rotated password on re-seed.
    update: {},
    create: { email, passwordHash, role: 'ADMIN' },
  });
  console.log(
    existing
      ? `[seed] admin user exists: ${email} — mevcut şifre KORUNDU (env'deki ADMIN_PASSWORD uygulanmadı).`
      : `[seed] admin user created: ${email}`,
  );
}

async function seedSettings(): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      phone: '+90 000 000 00 00',
      whatsapp: '+90 000 000 00 00',
      instagram: 'https://www.instagram.com/celinegelinlik/',
      address: 'İdealtepe Mah. Panorama Sok. Defne Apt. No:5 D:7, Maltepe / İstanbul',
      mapUrl: null,
      about:
        'Celine Gelinlik — Seda Dönmez Couture. Ölçüye özel, kişiye özel couture gelinlik; her gelin için tek ve eşsiz.',
    },
  });
  console.log('[seed] site settings ready.');
}

async function seedCatalog(): Promise<void> {
  const classic = await prisma.collection.upsert({
    where: { slug: 'klasik' },
    update: {},
    create: {
      name: 'Klasik Koleksiyon',
      slug: 'klasik',
      description: 'Zamansız, sade çizgileriyle klasik gelinlikler.',
      order: 1,
    },
  });

  const modern = await prisma.collection.upsert({
    where: { slug: 'modern' },
    update: {},
    create: {
      name: 'Modern Koleksiyon',
      slug: 'modern',
      description: 'Çağdaş kesimler ve zarif detaylar.',
      order: 2,
    },
  });

  const dresses: Array<{
    name: string;
    slug: string;
    description: string;
    fabric: string;
    featured: boolean;
    order: number;
    collectionId: string;
    images: Array<{ url: string; publicId: string; alt: string; width: number; height: number }>;
  }> = [
    {
      name: 'Vera',
      slug: 'vera',
      description: 'A-kesim, dantel korsajlı zarif gelinlik.',
      fabric: 'Dantel & tül',
      featured: true,
      order: 1,
      collectionId: classic.id,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/celine/vera-1.jpg',
          publicId: 'celine/vera-1',
          alt: 'Vera gelinlik ön görünüm',
          width: 1200,
          height: 1800,
        },
        {
          url: 'https://res.cloudinary.com/demo/image/upload/celine/vera-2.jpg',
          publicId: 'celine/vera-2',
          alt: 'Vera gelinlik detay',
          width: 1200,
          height: 1800,
        },
      ],
    },
    {
      name: 'Aria',
      slug: 'aria',
      description: 'Prenses kesim, hacimli tül etekli gelinlik.',
      fabric: 'Tül',
      featured: true,
      order: 2,
      collectionId: classic.id,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/celine/aria-1.jpg',
          publicId: 'celine/aria-1',
          alt: 'Aria gelinlik ön görünüm',
          width: 1200,
          height: 1800,
        },
      ],
    },
    {
      name: 'Luna',
      slug: 'luna',
      description: 'Saten, sırt dekolteli modern gelinlik.',
      fabric: 'Saten',
      featured: false,
      order: 1,
      collectionId: modern.id,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/celine/luna-1.jpg',
          publicId: 'celine/luna-1',
          alt: 'Luna gelinlik ön görünüm',
          width: 1200,
          height: 1800,
        },
        {
          url: 'https://res.cloudinary.com/demo/image/upload/celine/luna-2.jpg',
          publicId: 'celine/luna-2',
          alt: 'Luna gelinlik yan görünüm',
          width: 1200,
          height: 1800,
        },
      ],
    },
    {
      name: 'Mira',
      slug: 'mira',
      description: 'Minimal, düz kesim çağdaş gelinlik.',
      fabric: 'Krep',
      featured: false,
      order: 2,
      collectionId: modern.id,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/celine/mira-1.jpg',
          publicId: 'celine/mira-1',
          alt: 'Mira gelinlik ön görünüm',
          width: 1200,
          height: 1800,
        },
      ],
    },
  ];

  for (const d of dresses) {
    await prisma.dress.upsert({
      where: { slug: d.slug },
      update: {},
      create: {
        name: d.name,
        slug: d.slug,
        description: d.description,
        fabric: d.fabric,
        status: DressStatus.PUBLISHED,
        featured: d.featured,
        order: d.order,
        collectionId: d.collectionId,
        images: {
          create: d.images.map((img, i) => ({
            url: img.url,
            publicId: img.publicId,
            alt: img.alt,
            width: img.width,
            height: img.height,
            order: i,
          })),
        },
      },
    });
  }
  console.log(`[seed] ${dresses.length} dresses across 2 collections ready.`);
}

async function main(): Promise<void> {
  await seedAdmin();
  await seedSettings();
  // Demo katalog (sahte Cloudinary URL'leri) prod'a girmesin; SEED_DEMO=1 ile zorlanabilir.
  if (process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO === '1') {
    await seedCatalog();
  } else {
    console.log('[seed] production: demo katalog atlandı (SEED_DEMO=1 ile zorlayabilirsiniz).');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
