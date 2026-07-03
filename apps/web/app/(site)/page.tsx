import type { Metadata } from "next";
import { getCollections, getContent, getDresses, getSiteSettings } from "@/lib/api";
import { c, toParagraphs } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n/config";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media } from "@/components/site/Media";
import { HeroVideo } from "@/components/site/HeroVideo";
import { DressCard } from "@/components/site/DressCard";
import { CtaBand } from "@/components/site/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { HERO_IMAGE, collectionCover } from "@/lib/gallery";
import Link from "next/link";

export const metadata: Metadata = {
  description:
    "Celine Gelinlik (Seda Dönmez Couture) — ölçüye özel, kişiye özel couture gelinlik. Maltepe, İstanbul. Atölyemizde birebir randevu ile tasarım yolculuğu.",
};

export default async function HomePage() {
  // Veriyi paralel çek; hata olursa lib/api zarifçe boş döner.
  const [featuredPage, collections, settings, content, locale] =
    await Promise.all([
      getDresses({ featured: true, limit: 6 }),
      getCollections(),
      getSiteSettings(),
      getContent(),
      getLocale(),
    ]);

  const featured = featuredPage.data;
  const teaserCollections = collections.slice(0, 3);

  // Hero medyası: admin ayarları → yoksa paketteki varsayılan video + foto.
  const heroVideo = settings?.heroVideo?.trim() || undefined;
  const heroPoster = settings?.heroImage?.trim() || HERO_IMAGE;

  // Özel dikim süreci — 4 adım (metinler İçerik'ten).
  const processSteps = [1, 2, 3, 4].map((n) => ({
    step: `0${n}`,
    title: c(content, `home.process.step${n}.title`),
    text: c(content, `home.process.step${n}.text`),
  }));

  const storyParagraphs = toParagraphs(c(content, "home.story.body"));

  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* 1) HERO — tam ekran medya + slogan + 2 buton                  */}
      {/* ------------------------------------------------------------ */}
      <section className="relative">
        <HeroVideo
          className="min-h-[88vh] w-full"
          video={heroVideo}
          poster={heroPoster}
          posterPosition="center 30%"
        >
          <Container className="relative flex min-h-[88vh] flex-col items-center justify-end pb-20 text-center sm:pb-28">
            <Reveal className="flex flex-col items-center gap-6">
              <span className="u-label text-cream/85">{c(content, "hero.eyebrow")}</span>
              <h1 className="font-display max-w-3xl text-4xl leading-[1.08] text-cream sm:text-5xl md:text-6xl">
                {c(content, "hero.title")}
              </h1>
              <p className="max-w-xl text-cream/85 leading-relaxed">
                {c(content, "hero.subtitle")}
              </p>
              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                <ButtonLink href="/randevu" variant="primary">
                  {c(content, "hero.ctaPrimary")}
                </ButtonLink>
                <ButtonLink
                  href="/koleksiyonlar"
                  variant="outline"
                  className="border-cream/70 text-cream hover:bg-cream hover:text-ink hover:border-cream"
                >
                  {c(content, "hero.ctaSecondary")}
                </ButtonLink>
              </div>
            </Reveal>
          </Container>
        </HeroVideo>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 2) Kısa marka cümlesi şeridi                                   */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-powder py-20 sm:py-28">
        <Container size="narrow">
          <Reveal className="text-center">
            <p className="font-display text-2xl leading-relaxed text-ink sm:text-3xl md:text-[2.15rem]">
              {c(content, "home.statement")}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 3) Öne çıkan gelinlikler — 3'lü grid                          */}
      {/* ------------------------------------------------------------ */}
      {featured.length > 0 ? (
        <section className="bg-cream py-20 sm:py-28">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow={c(content, "home.featured.eyebrow")}
                title={c(content, "home.featured.title")}
                subtitle={c(content, "home.featured.subtitle")}
              />
            </Reveal>
            <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((dress, i) => (
                <Reveal key={dress.id} delay={i * 0.08}>
                  <DressCard dress={dress} priority={i < 3} />
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-16 flex justify-center">
              <ButtonLink href="/modeller" variant="outline">
                {c(content, "home.featured.cta")}
              </ButtonLink>
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ */}
      {/* 4) Koleksiyonlar teaser — büyük kartlar                       */}
      {/* ------------------------------------------------------------ */}
      {teaserCollections.length > 0 ? (
        <section className="bg-powder py-20 sm:py-28">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow={c(content, "home.collections.eyebrow")}
                title={c(content, "home.collections.title")}
                subtitle={c(content, "home.collections.subtitle")}
              />
            </Reveal>
            <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {teaserCollections.map((collection, i) => (
                <Reveal key={collection.id} delay={i * 0.08}>
                  <Link
                    href={`/koleksiyonlar/${collection.slug}`}
                    className="group block"
                  >
                    <div className="overflow-hidden bg-cream">
                      <Media
                        src={collectionCover(collection.coverImage, i)}
                        alt={collection.name}
                        ratio="landscape"
                        className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-5 flex flex-col gap-2">
                      <h3 className="font-display text-2xl text-ink transition-colors group-hover:text-muted">
                        {collection.name}
                      </h3>
                      {collection.description ? (
                        <p className="line-clamp-2 text-sm text-muted leading-relaxed">
                          {collection.description}
                        </p>
                      ) : null}
                      <span className="u-label mt-1 !text-[0.62rem] text-rose">
                        {t(locale, "home.collections.viewOne")}
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ */}
      {/* 5) Özel dikim süreç şeridi — 4 adım                           */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-cream py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={c(content, "home.process.eyebrow")}
              title={c(content, "home.process.title")}
              subtitle={c(content, "home.process.subtitle")}
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.08}>
                <div className="flex flex-col gap-4 border-t border-rose-soft pt-6">
                  <span className="font-display text-3xl text-rose">
                    {item.step}
                  </span>
                  <h3 className="font-display text-2xl text-ink">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16 flex justify-center">
            <ButtonLink href="/ozel-dikim" variant="outline">
              {c(content, "home.process.cta")}
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 6) Hikâyemiz split — sol foto + sağ serif başlık + metin      */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-powder py-20 sm:py-28">
        <Container size="wide">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal y={24}>
              <Media
                src={c(content, "home.story.image")}
                alt={t(locale, "alt.atelierCraft")}
                ratio="portrait"
                position="center"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-col items-start gap-6">
                <span className="u-label text-rose">{c(content, "home.story.eyebrow")}</span>
                <h2 className="font-display text-3xl leading-[1.12] text-ink sm:text-4xl md:text-5xl">
                  {c(content, "home.story.title")}
                </h2>
                <div className="flex flex-col gap-4 text-muted leading-relaxed">
                  {storyParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <ButtonLink href="/atolye" variant="outline" className="mt-2">
                  {c(content, "home.story.cta")}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 7) Randevu CTA bandı                                          */}
      {/* ------------------------------------------------------------ */}
      <CtaBand tone="cream" />
    </>
  );
}
