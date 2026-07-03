// Celine — i18n istemci-güvenli sabitler (next/headers YOK; client'ta da kullanılır).

import { TRANSLATIONS, type Locale } from "./translations";

export type { Locale };

export const LOCALES: Locale[] = ["tr", "en", "ar", "ru"];
export const DEFAULT_LOCALE: Locale = "tr";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_LABELS: Record<Locale, string> = {
  tr: "TR",
  en: "EN",
  ar: "AR",
  ru: "RU",
};
export const LOCALE_NAMES: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  ru: "Русский",
};

const RTL_LOCALES: Locale[] = ["ar"];
export function isRtl(locale: string): boolean {
  return RTL_LOCALES.includes(locale as Locale);
}

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as string[]).includes(v);
}

/** Arayüz dizesi çevirisi: locale → tr → key. */
export function t(locale: Locale, key: string): string {
  const e = TRANSLATIONS[key];
  if (!e) return key;
  return e[locale] || e.tr || key;
}
