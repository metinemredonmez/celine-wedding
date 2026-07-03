"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  LOCALE_NAMES,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Minimal dil seçici — aktif dili gösteren küçük düğme; tıklayınca açılır menü
 * (select gibi). Seçince cookie'yi ayarlar + sayfayı tazeler.
 */
export function LanguageSwitcher({
  current,
  className,
}: {
  current: Locale;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(l: Locale) {
    setOpen(false);
    if (l === current) return;
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Dil"
        className="u-label !text-[0.62rem] inline-flex items-center gap-1 px-1 py-1 text-ink transition-colors hover:text-rose"
      >
        {LOCALE_LABELS[current]}
        <ChevronDown
          size={12}
          strokeWidth={2}
          aria-hidden
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 top-full z-50 mt-2 min-w-[8rem] overflow-hidden rounded-[2px] border border-ink/10 bg-cream shadow-[0_14px_34px_-18px_rgba(51,44,40,0.55)]"
        >
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === current}
                onClick={() => pick(l)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 px-3.5 py-2.5 text-start text-sm transition-colors",
                  l === current
                    ? "bg-powder text-ink"
                    : "text-muted hover:bg-powder hover:text-ink",
                )}
              >
                <span>{LOCALE_NAMES[l]}</span>
                <span className="u-label !text-[0.58rem] text-faint">
                  {LOCALE_LABELS[l]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default LanguageSwitcher;
