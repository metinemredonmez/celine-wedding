// Celine Gelinlik — atölye adresi (tek kaynak).
// Admin → Ayarlar → Adres tam adres içeriyorsa o kullanılır; "Maltepe, İstanbul"
// gibi genel bir değer girildiğinde harita yanlış yere düştüğü için (canlıda
// yaşandı) öyle değerler yok sayılıp buradaki adrese düşülür.

/** Sitede gösterilen adres. */
export const ATELIER_ADDRESS = "Çınar Mah., Küçükyalı — Maltepe / İstanbul";

/** Google Haritalar sorgusu (pin için daha iyi çözümlenen biçim). */
export const ATELIER_MAP_QUERY = "Çınar Mahallesi, Küçükyalı, Maltepe, İstanbul";

/** Mahalle/sokak/numara geçen bir adres mi? Genel "ilçe, il" değerleri geçmez. */
const SPECIFIC = /\bmah|\bsok|\bcad|\bno\s*[:.]?\s*\d|\d/i;

/** Admin'deki adres yeterince özelse onu, değilse varsayılan adresi döner. */
export function resolveAddress(adminValue?: string | null): string {
  const v = adminValue?.trim();
  return v && SPECIFIC.test(v) ? v : ATELIER_ADDRESS;
}

/** Harita sorgusu: admin adresi kullanılıyorsa o, değilse sabit sorgu. */
export function resolveMapQuery(adminValue?: string | null): string {
  const address = resolveAddress(adminValue);
  return address === ATELIER_ADDRESS ? ATELIER_MAP_QUERY : address;
}
