/**
 * Admin şifresini güvenle değiştirir (argon2id).
 *
 *   cd /var/www/celine
 *   pnpm --filter api exec ts-node prisma/set-admin-password.ts 'YeniSifren'
 *
 * E-posta apps/api/.env içindeki ADMIN_EMAIL'den okunur (yoksa admin@celinegelinlik.com).
 * Şifre 1. argüman ya da ADMIN_PASSWORD env değişkeninden gelir.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

// apps/api/.env'i elle yükle (bağımsız çalışabilsin — DATABASE_URL/ADMIN_EMAIL lazım).
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
  // .env yoksa mevcut ortam değişkenleriyle devam.
}

const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL || 'admin@celinegelinlik.com';
  const password = process.argv[2] || process.env.ADMIN_PASSWORD;

  if (!password || password.length < 8) {
    console.error('Şifre gerekli (en az 8 karakter). Örnek:');
    console.error("  pnpm --filter api exec ts-node prisma/set-admin-password.ts 'YeniSifren.2026'");
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password, ARGON2_OPTS);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, refreshTokenHash: null }, // eski oturumları da düşür
    create: { email, passwordHash, role: 'ADMIN' },
  });

  console.log(`[admin] ${email} şifresi güncellendi ✅`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
