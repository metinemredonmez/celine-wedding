import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/api";
import { getLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n/config";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

import { AppointmentForm } from "./AppointmentForm";
import { AtelierInfo } from "./AtelierInfo";

export const metadata: Metadata = {
  title: "Randevu",
  description:
    "Celine Gelinlik atölyesinde birebir görüşme için randevu oluşturun. Maltepe, İstanbul. Ölçüye özel couture gelinlik deneyimi.",
  alternates: { canonical: "/randevu" },
};

export default async function RandevuPage() {
  const [settings, locale] = await Promise.all([getSiteSettings(), getLocale()]);

  return (
    <div className="bg-powder">
      <Container className="py-20 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow={t(locale, "randevu.eyebrow")}
            title={t(locale, "randevu.title")}
            subtitle={t(locale, "randevu.subtitle")}
            align="center"
            size="lg"
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          {/* Sol: form */}
          <Reveal>
            <AppointmentForm settings={settings} locale={locale} />
          </Reveal>

          {/* Sağ: atölye bilgi kartı */}
          <Reveal delay={0.1}>
            <AtelierInfo settings={settings} locale={locale} />
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
