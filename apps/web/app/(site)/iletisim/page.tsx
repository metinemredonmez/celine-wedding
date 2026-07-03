import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getContent, getSiteSettings } from "@/lib/api";
import { c, toParagraphs } from "@/lib/content";
import { instagramLink, telLink, waLink } from "@/lib/utils";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { CtaBand } from "@/components/site/CtaBand";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Celine Gelinlik atölyesine ulaşın — adres, telefon, WhatsApp ve çalışma saatleri.",
};

const FALLBACK_ADDRESS = "Maltepe, İstanbul";

type DetailRowProps = { label: string; children: ReactNode };

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
  const [content, settings] = await Promise.all([
    getContent(),
    getSiteSettings(),
  ]);

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

  const igLabel = igHandle
    ? igHandle.startsWith("http")
      ? igHandle.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")
      : `@${igHandle.replace(/^@/, "")}`
    : null;

  // Modern harita: adresten anahtarsız Google embed; yön için ayrı link.
  const mapQuery = encodeURIComponent(address);
  const mapEmbed = `https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`;
  const directionsHref =
    mapUrl || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  // Çalışma saatleri — İçerik'ten ("Gün | Saat" satırları).
  const hours = toParagraphs(c(content, "iletisim.hours")).map((line) => {
    const [days, value] = line.split("|").map((s) => s.trim());
    return { days, value: value ?? "" };
  });

  return (
    <>
      {/* Başlık */}
      <section className="bg-powder pt-24 pb-14 sm:pt-32 sm:pb-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={c(content, "iletisim.eyebrow")}
              title={c(content, "iletisim.title")}
              subtitle={c(content, "iletisim.subtitle")}
              align="center"
              size="lg"
            />
          </Reveal>
        </Container>
      </section>

      {/* İletişim detayları + modern harita */}
      <section className="bg-powder pb-24 sm:pb-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Sol: bilgiler */}
            <Reveal>
              <div className="flex flex-col gap-7 rounded-[2px] bg-cream p-8 sm:p-10">
                <DetailRow label="Adres">
                  <p className="whitespace-pre-line">{address}</p>
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-rose underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    Yol tarifi al
                  </a>
                </DetailRow>

                {phone ? (
                  <DetailRow label="Telefon">
                    <a href={tel ?? undefined} className="transition-colors hover:text-rose">
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
                  <span className="u-label text-rose">
                    {c(content, "iletisim.hoursTitle")}
                  </span>
                  <ul className="mt-1 flex flex-col gap-2">
                    {hours.map((row) => (
                      <li
                        key={row.days}
                        className="flex items-baseline justify-between gap-4 text-ink"
                      >
                        <span>{row.days}</span>
                        <span className="text-muted">{row.value}</span>
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

            {/* Sağ: modern monokrom harita (hover'da renklenir) */}
            <Reveal delay={0.1}>
              <div className="group relative h-full min-h-[380px] overflow-hidden rounded-[2px] bg-powder-deep lg:min-h-[460px]">
                <iframe
                  src={mapEmbed}
                  title="Celine Gelinlik atölye konumu"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[380px] w-full border-0 grayscale-[.55] contrast-[1.05] transition-[filter] duration-700 group-hover:grayscale-0 lg:min-h-[460px]"
                  allowFullScreen
                />
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-label absolute bottom-4 left-4 inline-flex items-center rounded-[2px] bg-cream/95 px-4 py-2.5 text-ink shadow-sm backdrop-blur transition-colors hover:bg-cream"
                >
                  Yol Tarifi Al
                </a>
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
