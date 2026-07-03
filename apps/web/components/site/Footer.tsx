import Link from "next/link";
import { getContent, getSiteSettings } from "@/lib/api";
import { c } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n/config";
import { NAV_ITEMS } from "@/lib/nav";
import { instagramLink, telLink, waLink } from "@/lib/utils";
import { Container } from "./Container";

/**
 * ML footer — çok kolonlu: marka+slogan / Menü / İletişim / Randevu+WhatsApp.
 * Server component; SiteSettings'ten iletişim bilgilerini çeker.
 */
export async function Footer() {
  const [s, content, locale] = await Promise.all([
    getSiteSettings(),
    getContent(),
    getLocale(),
  ]);
  const wa = s.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";
  const ig = instagramLink(s.instagram ?? process.env.NEXT_PUBLIC_INSTAGRAM);
  const tel = telLink(s.phone);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rose-soft/50 bg-cream">
      <Container className="py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marka + slogan */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-web.png"
              alt="Celine Gelinlik — Seda Dönmez Couture"
              className="h-16 w-auto self-start"
            />
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {c(content, "footer.tagline")}
            </p>
            {s.address ? (
              <p className="text-sm leading-relaxed text-faint">{s.address}</p>
            ) : (
              <p className="text-sm leading-relaxed text-faint">
                {t(locale, "footer.addressFallback")}
              </p>
            )}
          </div>

          {/* Menü */}
          <nav className="flex flex-col gap-3">
            <span className="u-label text-faint">{t(locale, "footer.section.menu")}</span>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {t(locale, item.key)}
              </Link>
            ))}
          </nav>

          {/* İletişim */}
          <div className="flex flex-col gap-3">
            <span className="u-label text-faint">{t(locale, "footer.section.contact")}</span>
            {tel ? (
              <a
                href={tel}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {s.phone}
              </a>
            ) : null}
            {ig ? (
              <a
                href={ig}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                Instagram
              </a>
            ) : null}
            {s.mapUrl ? (
              <a
                href={s.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {t(locale, "footer.contact.mapLink")}
              </a>
            ) : null}
          </div>

          {/* Randevu + WhatsApp */}
          <div className="flex flex-col gap-3">
            <span className="u-label text-faint">{t(locale, "footer.section.appointment")}</span>
            <Link
              href="/randevu"
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {t(locale, "footer.appointment.cta")}
            </Link>
            {wa ? (
              <a
                href={waLink(
                  wa,
                  "Merhaba, Celine Gelinlik için bilgi almak istiyorum.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        {/* Telif + KVKK */}
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-rose-soft/40 pt-6 sm:flex-row sm:items-center">
          <p className="u-label !text-[0.6rem] text-faint">
            {t(locale, "footer.copyright").replace("{year}", String(year))}
          </p>
          <Link
            href="/kvkk"
            className="u-label !text-[0.6rem] text-faint transition-colors hover:text-ink"
          >
            {t(locale, "footer.legal.kvkk")}
          </Link>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
