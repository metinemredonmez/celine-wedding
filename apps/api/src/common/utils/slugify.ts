/**
 * Turkish-aware slugify. Lowercases, folds Turkish characters to ASCII,
 * strips accents, replaces non-alphanumerics with hyphens and collapses runs.
 */
const TR_MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
};

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[çğıİöşü]/g, (ch) => TR_MAP[ch] ?? ch)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip remaining combining accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
