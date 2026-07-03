import type { Metadata } from "next";
import Link from "next/link";
import { getCollections } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { collectionCover } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Koleksiyonlar",
  description:
    "Celine Gelinlik koleksiyonları — Dantel, Saten ve Modern. Her koleksiyon, ölçüye özel yorumlanan bir hikâye.",
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

// description boşsa kullanılacak şiirsel yedek anlatı.
const FALLBACK_DESC: Record<string, string> = {
  dantel: "El işi dantelin sabırla dokunduğu, zamansız bir romantizm.",
  saten: "Işığı taşıyan saten; sade, güçlü ve kendinden emin.",
  modern: "Net çizgiler ve çağdaş siluet — bugünün gelini için.",
};

export default async function KoleksiyonlarPage() {
  const collections = await getCollections();

  return (
    <>
      {/* 1) Sessiz editoryal açılış */}
      <section className="bg-powder pt-24 pb-14 sm:pt-32 sm:pb-16">
        <Container>
          <Reveal className="flex flex-col items-center gap-6 text-center">
            <SectionHeading
              eyebrow="Koleksiyonlar"
              title="Her koleksiyon, bir hikâye"
              align="center"
              size="lg"
            />
            <span aria-hidden className="block h-px w-16 bg-rose/40" />
            <p className="u-label text-faint">Atölyemizde, ölçüye özel dikilir</p>
          </Reveal>

          {/* Bölüm index / atlama satırı */}
          {collections.length > 1 ? (
            <Reveal
              delay={0.1}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-2"
            >
              {collections.map((col, i) => (
                <span key={col.id} className="inline-flex items-center">
                  <a
                    href={`#${col.slug}`}
                    className="group u-label px-1 text-faint transition-colors hover:text-rose"
                  >
                    <span className="relative">
                      {col.name}
                      <span
                        aria-hidden
                        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-rose transition-transform duration-300 group-hover:scale-x-100"
                      />
                    </span>
                  </a>
                  {i < collections.length - 1 ? (
                    <span aria-hidden className="px-2 text-rose/40">
                      ·
                    </span>
                  ) : null}
                </span>
              ))}
            </Reveal>
          ) : null}
        </Container>
      </section>

      {/* 2) Koleksiyon sahneleri — dikey, zig-zag editoryal akış */}
      {collections.length > 0 ? (
        <div className="bg-powder pb-10 sm:pb-16">
          {collections.map((col, i) => {
            const reversed = i % 2 === 1;
            const roman = ROMAN[i] ?? String(i + 1);
            const desc = col.description?.trim() || FALLBACK_DESC[col.slug] || "";
            return (
              <section
                key={col.id}
                id={col.slug}
                aria-labelledby={`col-${col.slug}`}
                className="scroll-mt-24 py-14 sm:py-24"
              >
                <Container size="wide">
                  <div
                    className={cn(
                      "flex flex-col gap-10 lg:items-center lg:gap-16",
                      reversed ? "lg:flex-row-reverse" : "lg:flex-row",
                    )}
                  >
                    {/* Kapak — pencere içinde yumuşak parallax + hover zoom */}
                    <Reveal x={reversed ? 24 : -24} className="group lg:w-1/2">
                      <Link
                        href={`/koleksiyonlar/${col.slug}`}
                        className="block"
                        tabIndex={-1}
                        aria-hidden
                      >
                        <div className="relative aspect-[4/5] overflow-hidden bg-powder-deep">
                          <Parallax
                            distance={18}
                            className="absolute inset-x-0 -top-[6%] h-[112%]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={collectionCover(col.coverImage, i)}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            />
                          </Parallax>
                        </div>
                      </Link>
                    </Reveal>

                    {/* Metin bloğu */}
                    <Reveal
                      x={reversed ? -24 : 24}
                      delay={0.12}
                      className="flex flex-col items-start gap-5 lg:w-1/2"
                    >
                      <div className="flex items-baseline gap-3">
                        <span
                          aria-hidden
                          className="font-display text-2xl text-rose/70"
                        >
                          {roman}
                        </span>
                        <span className="u-label text-rose">Koleksiyon</span>
                      </div>
                      <h2
                        id={`col-${col.slug}`}
                        className="font-display text-4xl leading-[1.08] text-ink sm:text-5xl md:text-6xl"
                      >
                        <Link
                          href={`/koleksiyonlar/${col.slug}`}
                          className="transition-colors hover:text-muted"
                        >
                          {col.name}
                        </Link>
                      </h2>
                      {desc ? (
                        <p className="max-w-md text-muted leading-relaxed">{desc}</p>
                      ) : null}
                      <Link
                        href={`/koleksiyonlar/${col.slug}`}
                        className="group/cta u-label mt-2 inline-flex items-center gap-2 text-faint transition-colors hover:text-rose"
                      >
                        Koleksiyonu keşfet
                        <span
                          aria-hidden
                          className="transition-transform duration-300 group-hover/cta:translate-x-1"
                        >
                          →
                        </span>
                      </Link>
                    </Reveal>
                  </div>

                  {/* Bölüm ayracı */}
                  {i < collections.length - 1 ? (
                    <Reveal className="mt-14 flex justify-center sm:mt-24">
                      <span aria-hidden className="block h-px w-24 bg-rose/25" />
                    </Reveal>
                  ) : null}
                </Container>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="bg-powder pb-24">
          <Container>
            <Reveal className="mx-auto max-w-xl py-16 text-center">
              <p className="text-muted leading-relaxed">
                Koleksiyonlarımız çok yakında burada. O zamana dek, size özel bir
                gelinlik için atölyemizde randevu oluşturabilirsiniz.
              </p>
            </Reveal>
          </Container>
        </section>
      )}

      <CtaBand
        tone="cream"
        eyebrow="Randevu"
        title="Sizi anlatan gelinliği birlikte seçelim"
        text="Beğendiğiniz koleksiyonu atölyemizde birebir deneyimlemek ve size özel yorumlamak için randevu oluşturun."
        whatsappText="Merhaba, koleksiyonlarınız için randevu almak istiyorum."
      />
    </>
  );
}
