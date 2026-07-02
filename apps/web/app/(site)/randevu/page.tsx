import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/api";
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
  const settings = await getSiteSettings();

  return (
    <div className="bg-powder">
      <Container className="py-20 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Randevu"
            title="Atölyede Buluşalım"
            subtitle="Size özel gelinlik yolculuğu birebir bir görüşmeyle başlar. Aşağıdaki formu doldurun; uygun bir gün ve saat için sizi arayarak randevunuzu teyit edelim."
            align="center"
            size="lg"
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          {/* Sol: form */}
          <Reveal>
            <AppointmentForm settings={settings} />
          </Reveal>

          {/* Sağ: atölye bilgi kartı */}
          <Reveal delay={0.1}>
            <AtelierInfo settings={settings} />
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
