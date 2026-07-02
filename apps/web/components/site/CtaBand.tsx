import { getSiteSettings } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";
import { cn, waLink } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "./Container";
import { Reveal } from "@/components/motion/Reveal";

type CtaBandProps = {
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
 * Server component; settings verilmezse kendi çeker (WhatsApp numarası için).
 */
export async function CtaBand({
  eyebrow = "Randevu",
  title = "Size özel bir gelinlik yolculuğu",
  text = "Atölyemizde birebir görüşme için randevu oluşturun; hikâyenizi dinleyelim, ölçüye özel tasarımınıza birlikte başlayalım.",
  whatsappText = "Merhaba, Celine Gelinlik için randevu almak istiyorum.",
  settings,
  className,
  tone = "cream",
}: CtaBandProps) {
  const s = settings ?? (await getSiteSettings());
  const wa = s.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";

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
          <span className="u-label text-rose">{eyebrow}</span>
          <h2 className="font-display text-3xl text-ink sm:text-4xl md:text-5xl">
            {title}
          </h2>
          <p className="max-w-xl text-muted leading-relaxed">{text}</p>
          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
            <ButtonLink href="/randevu" variant="primary">
              Randevu Al
            </ButtonLink>
            {wa ? (
              <ButtonLink
                href={waLink(wa, whatsappText)}
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </ButtonLink>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export default CtaBand;
