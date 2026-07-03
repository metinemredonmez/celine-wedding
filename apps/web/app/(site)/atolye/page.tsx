import type { Metadata } from "next";
import { getContent, getSiteSettings } from "@/lib/api";
import { c, toParagraphs } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n/config";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media } from "@/components/site/Media";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Atölye",
  description:
    "Celine Gelinlik atölyesi — Seda Dönmez Couture. El emeği, zanaat ve ölçüye özel dikimle her gelinin hikâyesini kumaşa işliyoruz.",
};

export default async function AtolyePage() {
  const [content, settings, locale] = await Promise.all([
    getContent(),
    getSiteSettings(),
    getLocale(),
  ]);

  const storyParagraphs = toParagraphs(c(content, "atolye.storyBody"));
  const craft = [1, 2, 3].map((n) => ({
    title: c(content, `atolye.craft${n}.title`),
    text: c(content, `atolye.craft${n}.text`),
  }));

  return (
    <>
      {/* 1) Modern giriş — bulanık arka plan görseli + merkez metin */}
      <section className="relative overflow-hidden bg-powder">
        <div aria-hidden className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c(content, "atolye.heroImage")}
            alt=""
            className="h-full w-full scale-110 object-cover blur-2xl"
          />
          <div className="absolute inset-0 bg-powder/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-powder/50 via-transparent to-powder" />
        </div>
        <Container className="relative flex flex-col items-center gap-6 py-28 text-center sm:py-40">
          <Reveal className="flex flex-col items-center gap-6">
            <span className="u-label text-rose">{c(content, "atolye.eyebrow")}</span>
            <h1 className="font-display max-w-3xl text-4xl leading-[1.06] text-ink sm:text-5xl md:text-6xl">
              {c(content, "atolye.title")}
            </h1>
            <p className="max-w-xl text-muted leading-relaxed">
              {c(content, "atolye.intro")}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* 2) Hikâye — net foto + metin */}
      <section className="bg-cream py-20 sm:py-28">
        <Container size="wide">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal y={24}>
              <Media
                src={c(content, "atolye.image")}
                alt={t(locale, "alt.atelierCraft")}
                ratio="portrait"
                position="center"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-col items-start gap-6">
                <span className="u-label text-rose">
                  {c(content, "atolye.storyEyebrow")}
                </span>
                <h2 className="font-display text-3xl leading-[1.12] text-ink sm:text-4xl md:text-5xl">
                  {c(content, "atolye.storyTitle")}
                </h2>
                <div className="flex flex-col gap-4 text-muted leading-relaxed">
                  {storyParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 3) Zanaat vurguları */}
      <section className="bg-powder py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={c(content, "atolye.craftEyebrow")}
              title={c(content, "atolye.craftTitle")}
              subtitle={c(content, "atolye.craftSubtitle")}
            />
          </Reveal>

          <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {craft.map((item, i) => (
              <Reveal
                key={i}
                delay={i * 0.08}
                className="flex flex-col gap-3 border-t border-rose-soft pt-6"
              >
                <h3 className="font-display text-2xl text-ink">{item.title}</h3>
                <p className="text-muted leading-relaxed">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand tone="cream" settings={settings} />
    </>
  );
}
