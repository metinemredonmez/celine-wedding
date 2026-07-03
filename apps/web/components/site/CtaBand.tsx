import { getSiteSettings } from "@/lib/api";
import { getLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n/config";
import type { SiteSettings } from "@/lib/types";
import { cn, waLink } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "./Container";
import { Reveal } from "@/components/motion/Reveal";

type CtaBandProps = {
  /** verilirse çeviri yerine bu metin kullanılır (TR sabit) */
  eyebrow?: string;
  title?: string;
  text?: string;
  /** WhatsApp mesajı ön-doldurma */
  whatsappText?: string;
  /** dışarıdan geçilirse tekrar fetch etmez */
  settings?: SiteSettings;
  className?: string;
  /** zemin tonu */
  tone?: "cream" | "powder-deep";
};

/**
 * Randevu bandı — "Randevu Al" (dolu koyu) + WhatsApp (outline).
 * Metinler aktif dile göre çevrilir (cta.*); prop verilirse o kullanılır.
 * Server component; settings verilmezse kendi çeker (WhatsApp numarası için).
 */
export async function CtaBand({
  eyebrow,
  title,
  text,
  whatsappText,
  settings,
  className,
  tone = "cream",
}: CtaBandProps) {
  const [s, locale] = await Promise.all([
    settings ? Promise.resolve(settings) : getSiteSettings(),
    getLocale(),
  ]);
  const wa = s.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";

  const eyebrowText = eyebrow ?? t(locale, "cta.eyebrow");
  const titleText = title ?? t(locale, "cta.title");
  const bodyText = text ?? t(locale, "cta.text");
  const waMessage = whatsappText ?? t(locale, "cta.whatsappText");

  return (
    <section
      className={cn(
        tone === "cream" ? "bg-cream" : "bg-powder-deep",
        "py-20 sm:py-28",
        className,
      )}
    >
      <Container size="narrow">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <span className="u-label text-rose">{eyebrowText}</span>
          <h2 className="font-display text-3xl text-ink sm:text-4xl md:text-5xl">
            {titleText}
          </h2>
          <p className="max-w-xl text-muted leading-relaxed">{bodyText}</p>
          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
            <ButtonLink href="/randevu" variant="primary">
              {t(locale, "cta.primaryButton")}
            </ButtonLink>
            {wa ? (
              <ButtonLink
                href={waLink(wa, waMessage)}
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(locale, "cta.whatsappButton")}
              </ButtonLink>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export default CtaBand;
