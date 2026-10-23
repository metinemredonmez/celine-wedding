import type { Metadata } from "next";
import { getDresses } from "@/lib/api";
import { getLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n/config";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { BridalMakeupStudio } from "@/components/makeup/BridalMakeupStudio";
import { DressTryOn, type DressOption } from "@/components/makeup/DressTryOn";

export const metadata: Metadata = {
  title: "Düğün Makyajı — Sanal Deneme",
  description:
    "Klasik, doğal, romantik ya da kına gecesi gelin makyajını örnek yüzde veya kendi fotoğrafınızda deneyin; beğendiğiniz gelinliği yapay zekâ ile üzerinizde görün.",
};

/**
 * Sanal deneme demosu. Makyaj: tamamen istemci tarafı, fotoğraf hiçbir yere
 * yüklenmez. Gelinlik: fotoğraf API üzerinden fal.ai'ye gider (rıza ile).
 */
export default async function DugunMakyajiPage() {
  const [locale, dresses] = await Promise.all([
    getLocale(),
    getDresses({ limit: 24, sort: "order", dir: "asc" }),
  ]);
  const options: DressOption[] = dresses.data.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    image: d.images[0]?.url ?? null,
  }));

  return (
    <>
      <section className="bg-powder pt-16 pb-10 sm:pt-24 sm:pb-14">
        <Container>
          <SectionHeading
            size="lg"
            eyebrow={t(locale, "makeup.eyebrow")}
            title={t(locale, "makeup.title")}
            subtitle={t(locale, "makeup.subtitle")}
          />
          <p className="u-label mt-6 text-center !text-[0.62rem] text-faint">
            {t(locale, "makeup.privacy")}
          </p>
        </Container>
      </section>

      {/* Stüdyo arayüzü şimdilik Türkçe; kontroller dil seçiminden etkilenmez. */}
      <section className="bg-powder pb-20 sm:pb-28" dir="ltr" lang="tr">
        <Container size="wide">
          <BridalMakeupStudio />
        </Container>
      </section>

      {/* Gelinlik denemesi (AI) */}
      <section id="gelinlik-deneme" className="scroll-mt-24 bg-cream py-20 sm:py-28">
        <Container size="wide">
          <SectionHeading
            eyebrow={t(locale, "tryon.eyebrow")}
            title={t(locale, "tryon.title")}
            subtitle={t(locale, "tryon.subtitle")}
          />
          <div className="mt-12" dir="ltr" lang="tr">
            <DressTryOn dresses={options} />
          </div>
        </Container>
      </section>

      <CtaBand
        tone="powder-deep"
        eyebrow={t(locale, "makeup.ctaEyebrow")}
        title={t(locale, "makeup.ctaTitle")}
        text={t(locale, "makeup.ctaText")}
        whatsappText={t(locale, "makeup.whatsappText")}
      />
    </>
  );
}
