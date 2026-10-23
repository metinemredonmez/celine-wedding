import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n/config";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { BridalMakeupStudio } from "@/components/makeup/BridalMakeupStudio";

export const metadata: Metadata = {
  title: "Düğün Makyajı — Sanal Deneme",
  description:
    "Klasik, doğal, romantik ya da kına gecesi gelin makyajını örnek yüzde veya kendi fotoğrafınızda deneyin. Fotoğrafınız cihazınızdan çıkmaz.",
};

/** Sanal düğün makyajı demosu: tamamen istemci tarafı, fotoğraf hiçbir yere yüklenmez. */
export default async function DugunMakyajiPage() {
  const locale = await getLocale();

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

      <CtaBand
        tone="cream"
        eyebrow={t(locale, "makeup.ctaEyebrow")}
        title={t(locale, "makeup.ctaTitle")}
        text={t(locale, "makeup.ctaText")}
        whatsappText={t(locale, "makeup.whatsappText")}
      />
    </>
  );
}
