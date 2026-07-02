import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSiteSettings } from "@/lib/api";
import { instagramLink, telLink, waLink } from "@/lib/utils";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { CtaBand } from "@/components/site/CtaBand";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Celine Gelinlik atölyesine ulaşın — adres, telefon, WhatsApp ve çalışma saatleri. Maltepe, İstanbul.",
};

// Statik iletişim bilgileri backend'de yoksa gösterilecek zarif yedekler.
const FALLBACK_ADDRESS = "Maltepe, İstanbul";
const WORKING_HOURS: Array<{ days: string; hours: string }> = [
  { days: "Pazartesi – Cuma", hours: "10.00 – 19.00" },
  { days: "Cumartesi", hours: "10.00 – 18.00" },
  { days: "Pazar", hours: "Randevu ile" },
];

type DetailRowProps = {
  label: string;
  children: ReactNode;
};

/** Sol etiket + sağ değer satırı — ince hairline ile ayrılır. */
function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-rose-soft/60 pb-5">
      <span className="u-label text-rose">{label}</span>
      <div className="text-ink leading-relaxed">{children}</div>
    </div>
  );
}

export default async function IletisimPage() {
  const settings = await getSiteSettings();

  const address = settings.address?.trim() || FALLBACK_ADDRESS;
  const phone = settings.phone?.trim() || null;
  const tel = telLink(phone);
  const whatsapp = settings.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? null;
  const igHandle = settings.instagram ?? process.env.NEXT_PUBLIC_INSTAGRAM ?? null;
  const instagram = instagramLink(igHandle);
  const mapUrl = settings.mapUrl?.trim() || null;

  const waHref = whatsapp
    ? waLink(whatsapp, "Merhaba, Celine Gelinlik ile iletişime geçmek istiyorum.")
    : null;

  // Instagram'da gösterilecek okunur etiket (@kullaniciadi).
  const igLabel = igHandle
    ? igHandle.startsWith("http")
      ? igHandle.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")
      : `@${igHandle.replace(/^@/, "")}`
    : null;

  return (
    <>
      {/* Başlık */}
      <section className="bg-powder pt-24 pb-14 sm:pt-32 sm:pb-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="İletişim"
              title="Bize ulaşın"
              subtitle="Atölyemizde birebir görüşme, sorularınız ve randevu talepleriniz için size en kısa sürede dönüş yapmaktan mutluluk duyarız."
              align="center"
              size="lg"
            />
          </Reveal>
        </Container>
      </section>

      {/* İletişim detayları + harita */}
      <section className="bg-powder pb-24 sm:pb-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Sol: bilgiler */}
            <Reveal>
              <div className="flex flex-col gap-7 rounded-[2px] bg-cream p-8 sm:p-10">
                <DetailRow label="Adres">
                  <p className="whitespace-pre-line">{address}</p>
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-rose underline-offset-4 transition-colors hover:text-ink hover:underline"
                    >
                      Yol tarifi al
                    </a>
                  ) : null}
                </DetailRow>

                {phone ? (
                  <DetailRow label="Telefon">
                    <a
                      href={tel ?? undefined}
                      className="transition-colors hover:text-rose"
                    >
                      {phone}
                    </a>
                  </DetailRow>
                ) : null}

                {waHref ? (
                  <DetailRow label="WhatsApp">
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-rose"
                    >
                      WhatsApp üzerinden yazın
                    </a>
                  </DetailRow>
                ) : null}

                {instagram && igLabel ? (
                  <DetailRow label="Instagram">
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-rose"
                    >
                      {igLabel}
                    </a>
                  </DetailRow>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <span className="u-label text-rose">Çalışma Saatleri</span>
                  <ul className="mt-1 flex flex-col gap-2">
                    {WORKING_HOURS.map((row) => (
                      <li
                        key={row.days}
                        className="flex items-baseline justify-between gap-4 text-ink"
                      >
                        <span>{row.days}</span>
                        <span className="text-muted">{row.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {waHref ? (
                  <div className="mt-2">
                    <ButtonLink
                      href={waHref}
                      variant="outline"
                      size="sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </ButtonLink>
                  </div>
                ) : null}
              </div>
            </Reveal>

            {/* Sağ: harita veya yer tutucu */}
            <Reveal delay={0.1}>
              <div className="h-full min-h-[360px] overflow-hidden rounded-[2px] bg-powder-deep lg:min-h-[440px]">
                {mapUrl ? (
                  <iframe
                    src={mapUrl}
                    title="Celine Gelinlik atölye konumu"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full min-h-[360px] w-full border-0 lg:min-h-[440px]"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 p-8 text-center lg:min-h-[440px]">
                    <span className="u-label text-rose">Konum</span>
                    <p className="max-w-xs font-display text-2xl text-ink">
                      {address}
                    </p>
                    <p className="text-sm text-muted">
                      Ziyaret öncesi randevu almanızı rica ederiz.
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Randevu bandı */}
      <CtaBand settings={settings} tone="cream" />
    </>
  );
}
