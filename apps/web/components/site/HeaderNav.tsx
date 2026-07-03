"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, NAV_LEFT, NAV_RIGHT } from "@/lib/nav";
import { t, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

type HeaderNavProps = {
  locale: Locale;
};

/**
 * AMSALE header (client): scroll'da katılaşma + mobil tam ekran overlay.
 * Menü/butonlar aktif dile göre çevrilir; sağda dil değiştirici.
 */
export function HeaderNav({ locale }: HeaderNavProps) {
  const pathname = usePathname();
  const announcement = t(locale, "header.announcement");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route değişince overlay kapansın + body scroll kilidi
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkCls = (href: string) =>
    cn(
      "u-label !text-[0.66rem] transition-colors duration-300 hover:text-ink",
      isActive(href) ? "text-ink" : "text-muted",
    );

  return (
    <>
      {/* Duyuru şeridi */}
      <div className="bg-ink text-cream">
        <p className="u-label !text-cream/80 mx-auto max-w-[1400px] px-6 py-2 text-center !text-[0.6rem]">
          {announcement}
        </p>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-rose-soft/60 bg-powder/90 backdrop-blur-md"
            : "border-b border-transparent bg-powder/0",
        )}
      >
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
          {/* Masaüstü: bölünmüş nav + merkezî wordmark */}
          <div className="hidden items-center justify-between py-5 lg:flex">
            <nav className="flex flex-1 items-center gap-7">
              {NAV_LEFT.map((item) => (
                <Link key={item.href} href={item.href} className={linkCls(item.href)}>
                  {t(locale, item.key)}
                </Link>
              ))}
            </nav>

            <Link
              href="/"
              className="shrink-0 px-8"
              aria-label="Celine Gelinlik ana sayfa"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-web.png"
                alt="Celine Gelinlik — Seda Dönmez Couture"
                className="h-11 w-auto"
              />
            </Link>

            <nav className="flex flex-1 items-center justify-end gap-7">
              {NAV_RIGHT.filter((i) => i.href !== "/randevu").map((item) => (
                <Link key={item.href} href={item.href} className={linkCls(item.href)}>
                  {t(locale, item.key)}
                </Link>
              ))}
              <Link
                href="/randevu"
                className="u-label !text-[0.62rem] rounded-[2px] border border-rose px-4 py-2 text-ink transition-colors duration-300 hover:bg-ink hover:text-cream hover:border-ink"
              >
                {t(locale, "nav.appointment")}
              </Link>
              <LanguageSwitcher current={locale} className="ml-1" />
            </nav>
          </div>

          {/* Mobil: hamburger + wordmark */}
          <div className="flex items-center justify-between py-4 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t(locale, "header.menuOpen")}
              className="p-1 text-ink"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            <Link
              href="/"
              className="shrink-0"
              aria-label="Celine Gelinlik ana sayfa"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-web.png"
                alt="Celine Gelinlik — Seda Dönmez Couture"
                className="h-9 w-auto"
              />
            </Link>

            {/* denge için görünmez placeholder */}
            <span className="w-[22px]" aria-hidden />
          </div>
        </div>
      </header>

      {/* Mobil tam ekran overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-powder transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-web.png"
            alt="Celine Gelinlik"
            className="h-8 w-auto"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t(locale, "header.menuClose")}
            className="p-1 text-ink"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col items-center justify-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "font-display text-2xl tracking-wide transition-colors",
                isActive(item.href) ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {t(locale, item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex justify-center pb-12">
          <LanguageSwitcher current={locale} />
        </div>
      </div>
    </>
  );
}

export default HeaderNav;
