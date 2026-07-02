/**
 * Fail-fast env doğrulaması. Zorunlu anahtarlar boş/CHANGEME ise boot'ta
 * hata verir; opsiyonel entegrasyon anahtarları eksikse sadece uyarır
 * (özellik devre dışı kalır, uygulama çalışır).
 */
const REQUIRED = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;
const OPTIONAL_WARN = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
] as const;

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const bad: string[] = [];
  for (const key of REQUIRED) {
    const value = String(config[key] ?? '').trim();
    const tooShort = key !== 'DATABASE_URL' && value.length < 16;
    if (!value || value === 'CHANGEME' || tooShort) {
      bad.push(key);
    }
  }
  if (bad.length > 0) {
    throw new Error(
      `Eksik/geçersiz zorunlu ortam değişkenleri: ${bad.join(', ')} — apps/api/.env dosyasını doldurun.`,
    );
  }
  for (const key of OPTIONAL_WARN) {
    const value = String(config[key] ?? '').trim();
    if (!value || value === 'CHANGEME') {
      // eslint-disable-next-line no-console
      console.warn(`[env] ${key} ayarlı değil — ilgili özellik devre dışı.`);
    }
  }
  return config;
}
