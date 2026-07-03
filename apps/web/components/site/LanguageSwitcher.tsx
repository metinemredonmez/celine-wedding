"use client";

import { useRouter } from "next/navigation";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Dil değiştirici (TR · EN · AR · RU). Cookie'yi ayarlar + sayfayı tazeler.
 * Aktif dil `current` prop'undan (sunucu getLocale).
 */
export function LanguageSwitcher({
  current,
  className,
}: {
  current: Locale;
  className?: string;
}) {
  const router = useRouter();

  function pick(l: Locale) {
    if (l === current) return;
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="group"
      aria-label="Dil"
    >
      {LOCALES.map((l, i) => (
        <span key={l} className="inline-flex items-center">
          <button
            type="button"
            onClick={() => pick(l)}
            aria-current={l === current ? "true" : undefined}
            className={cn(
              "u-label !text-[0.6rem] px-1 py-0.5 transition-colors",
              l === current ? "text-ink" : "text-faint hover:text-rose",
            )}
          >
            {LOCALE_LABELS[l]}
          </button>
          {i < LOCALES.length - 1 ? (
            <span aria-hidden className="text-[0.6rem] text-faint/40">
              ·
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
