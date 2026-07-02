import type { Metadata } from "next";
import { getCollections, getDresses } from "@/lib/api";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media } from "@/components/site/Media";
import { HeroVideo } from "@/components/site/HeroVideo";
import { DressCard } from "@/components/site/DressCard";
import { CtaBand } from "@/components/site/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  description:
    "Celine Gelinlik (Seda Dönmez Couture) — ölçüye özel, kişiye özel couture gelinlik. Maltepe, İstanbul. Atölyemizde birebir randevu ile tasarım yolculuğu.",
};

// Özel dikim süreci — sabit 4 adım.
const PROCESS_STEPS = [
  {
    step: "01",
    title: "İstişare",
    text: "Atölyemizde tanışır, hayalinizdeki gelinliği ve düğün hikâyenizi birlikte dinleriz.",
  },
  {
    step: "02",
    title: "Tasarım",
    text: "Silüet, kumaş ve dantel seçimleriyle size özel eskiz ve tasarım ortaya çıkar.",
  },
  {
    step: "03",
    title: "Prova",
    text: "Ölçüye özel dikim, birkaç prova ile bedeninize kusursuz oturana dek işlenir.",
  },
  {
    step: "04",
    title: "Teslim",
    text: "Son rötuşlarla tamamlanan gelinliğiniz, özel gününüz için sizi bekler.",
  },
];

export default async function HomePage() {
  // Veriyi paralel çek; hata olursa lib/api zarifçe boş döner.
  const [featuredPage, collections] = await Promise.all([
    getDresses({ featured: true, limit: 6 }),
    getCollections(),
  ]);

  const featured = featuredPage.data;
  const teaserCollections = collections.slice(0, 3);

  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* 1) HERO — tam ekran tek editoryal foto + slogan + 2 buton     */}
      {/* ------------------------------------------------------------ */}
      <section className="relative">
        <HeroVideo className="min-h-[88vh] w-full">
          <Container className="relative flex min-h-[88vh] flex-col items-center justify-end pb-20 text-center sm:pb-28">
            <Reveal className="flex flex-col items-center gap-6">
              <span className="u-label text-cream/85">Seda Dönmez Couture</span>
              <h1 className="font-display max-w-3xl text-4xl leading-[1.08] text-cream sm:text-5xl md:text-6xl">
                Size özel, tek bir gelin için.
              </h1>
              <p className="max-w-xl text-cream/85 leading-relaxed">
                Ölçüye özel, kişiye özel couture gelinlik. Atölyemizde
                hikâyenizi dinliyor, hayalinizdeki tasarımı birlikte
                hayata geçiriyoruz.
              </p>
              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                <ButtonLink href="/randevu" variant="primary">
                  Randevu Al
                </ButtonLink>
                <ButtonLink
                  href="/koleksiyonlar"
                  variant="outline"
                  className="border-cream/70 text-cream hover:bg-cream hover:text-ink hover:border-cream"
                >
                  Koleksiyonu Keşfet
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
              Her gelinlik, tek bir gelin için tasarlanır. Kalıp yok,
              seri üretim yok — yalnızca size ait bir siluet, elde işlenen
              ince bir zarafet.
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
                eyebrow="Seçkiler"
                title="Öne Çıkan Gelinlikler"
                subtitle="Koleksiyonlarımızdan özenle seçtiğimiz imza tasarımlar."
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
                Tüm Gelinlikler
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
                eyebrow="Koleksiyonlar"
                title="Her sezon, yeni bir hikâye"
                subtitle="Farklı silüetleri ve dokuları bir araya getiren koleksiyonlarımızı keşfedin."
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
                        src={collection.coverImage ?? undefined}
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
                        Koleksiyonu Gör
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
              eyebrow="Özel Dikim"
              title="Tasarımdan teslime, dört adım"
              subtitle="Kişiye özel gelinlik yolculuğunuz baştan sona sizinle birlikte kurgulanır."
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item, i) => (
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
              Özel Dikim Süreci
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
                src={undefined}
                alt="Celine Gelinlik atölyesi — el işçiliği"
                ratio="portrait"
                position="center"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-col items-start gap-6">
                <span className="u-label text-rose">Hikâyemiz</span>
                <h2 className="font-display text-3xl leading-[1.12] text-ink sm:text-4xl md:text-5xl">
                  Her ilmek, sizin hikâyeniz için.
                </h2>
                <div className="flex flex-col gap-4 text-muted leading-relaxed">
                  <p>
                    Celine Gelinlik, Seda Dönmez&apos;in couture anlayışıyla
                    şekillenir. Her gelinlik; sabırla seçilen kumaşlar, elde
                    işlenen danteller ve saatler süren emekle, tek bir gelin
                    için hayat bulur.
                  </p>
                  <p>
                    Amacımız yalnızca bir gelinlik dikmek değil; o günü ve o
                    hissi taşıyacak, size ait bir eser yaratmaktır.
                  </p>
                </div>
                <ButtonLink href="/atolye" variant="outline" className="mt-2">
                  Atölyeyi Keşfet
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
