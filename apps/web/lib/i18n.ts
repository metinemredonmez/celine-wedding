// Celine — i18n sunucu yardımcıları. İstemci-güvenli sabitler: lib/i18n/config.
// Aktif dil cookie'de (NEXT_LOCALE); Arapça = RTL.

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./i18n/config";

export * from "./i18n/config";

/** Sunucu: cookie'den aktif dili okur (yoksa TR). */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}
