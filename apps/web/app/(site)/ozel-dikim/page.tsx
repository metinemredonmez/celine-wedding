import type { Metadata } from "next";
import { getContent } from "@/lib/api";
import { c } from "@/lib/content";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media } from "@/components/site/Media";
import { CtaBand } from "@/components/site/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";

export const metadata: Metadata = {
  title: "Özel Dikim",
  description:
    "Celine Gelinlik'te ölçüye özel couture süreci: istişare, tasarım ve eskiz, provalar, dikim ve teslim. Size özel, tek bir gelinlik.",
};

export default async function OzelDikimPage() {
  const content = await getContent();

  const steps = [1, 2, 3, 4].map((n) => ({
    step: `0${n}`,
    title: c(content, `ozeldikim.step${n}.title`),
    duration: c(content, `ozeldikim.step${n}.duration`),
    text: c(content, `ozeldikim.step${n}.text`),
  }));

  return (
    <>
      {/* Giriş */}
      <section className="bg-powder pt-20 pb-16 sm:pt-28 sm:pb-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <SectionHeading
                align="left"
                size="lg"
                eyebrow={c(content, "ozeldikim.eyebrow")}
                title={c(content, "ozeldikim.title")}
                subtitle={c(content, "ozeldikim.subtitle")}
              />
              <div className="mt-8">
                <ButtonLink href="/randevu" variant="primary">
                  {c(content, "ozeldikim.cta")}
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <Media
                src={c(content, "ozeldikim.image")}
                alt="Özel dikim — saten ve el işi dantel detayı"
                ratio="portrait"
                position="center"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Süreç adımları */}
      <section className="bg-cream py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={c(content, "ozeldikim.processEyebrow")}
              title={c(content, "ozeldikim.processTitle")}
              subtitle={c(content, "ozeldikim.processSubtitle")}
            />
          </Reveal>

          <ol className="mt-16 grid gap-px overflow-hidden border-y border-rose-soft sm:grid-cols-2">
            {steps.map((s, i) => (
              <Reveal
                as="li"
                key={s.step}
                delay={i * 0.08}
                className="flex flex-col gap-4 bg-cream px-6 py-10 sm:px-10 sm:py-12"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-4xl text-rose sm:text-5xl">
                    {s.step}
                  </span>
                  <span className="u-label text-faint">{s.duration}</span>
                </div>
                <h3 className="font-display text-2xl text-ink sm:text-3xl">
                  {s.title}
                </h3>
                <p className="text-muted leading-relaxed">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Zaman & şehir dışı notu */}
      <section className="bg-powder py-20 sm:py-28">
        <Container size="narrow">
          <div className="grid gap-12 sm:grid-cols-2">
            <Reveal className="flex flex-col gap-3">
              <span className="u-label text-rose">
                {c(content, "ozeldikim.timeEyebrow")}
              </span>
              <h3 className="font-display text-2xl text-ink sm:text-3xl">
                {c(content, "ozeldikim.timeTitle")}
              </h3>
              <p className="text-muted leading-relaxed">
                {c(content, "ozeldikim.timeText")}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="flex flex-col gap-3">
              <span className="u-label text-rose">
                {c(content, "ozeldikim.remoteEyebrow")}
              </span>
              <h3 className="font-display text-2xl text-ink sm:text-3xl">
                {c(content, "ozeldikim.remoteTitle")}
              </h3>
              <p className="text-muted leading-relaxed">
                {c(content, "ozeldikim.remoteText")}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Sinematik parallax bandı */}
      <section className="relative h-[62vh] min-h-[420px] overflow-hidden bg-ink sm:h-[74vh]">
        <Parallax
          distance={70}
          className="absolute inset-x-0 -top-[14%] h-[128%]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c(content, "ozeldikim.bandImage")}
            alt=""
            className="h-full w-full object-cover"
          />
        </Parallax>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/25 to-ink/35"
        />
        <Container className="relative flex h-full flex-col items-center justify-center gap-5 text-center">
          <Reveal className="flex flex-col items-center gap-5">
            <span className="u-label text-cream/80">El emeği</span>
            <p className="font-display max-w-2xl text-2xl leading-[1.25] text-cream sm:text-3xl md:text-[2.5rem]">
              {c(content, "ozeldikim.bandLine")}
            </p>
          </Reveal>
        </Container>
      </section>

      <CtaBand
        tone="cream"
        title="Hikâyenizi birlikte dikelim"
        text="Özel dikim yolculuğunuz bir sohbetle başlar. Atölyemizde tanışmak ve size özel gelinliğinizin ilk adımını atmak için randevu oluşturun."
        whatsappText="Merhaba, özel dikim gelinlik için randevu almak istiyorum."
      />
    </>
  );
}
