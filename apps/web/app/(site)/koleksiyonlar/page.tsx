import type { Metadata } from "next";
import Link from "next/link";
import { getCollections } from "@/lib/api";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media } from "@/components/site/Media";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Koleksiyonlar",
  description:
    "Celine Gelinlik couture koleksiyonları — her biri kendi anlatısıyla tasarlanmış, ölçüye özel gelinlik dünyaları. Maltepe, İstanbul.",
};

// Koleksiyonlar sık değişmez; sayfa ISR ile (lib/api) statik-yakın kalır.
export default async function KoleksiyonlarPage() {
  const collections = await getCollections();

  return (
    <>
      {/* Başlık bloğu */}
      <section className="bg-powder pt-24 pb-16 sm:pt-32 sm:pb-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Koleksiyonlar"
              title="Her koleksiyon, bir hikâye"
              subtitle="Celine imzalı couture koleksiyonları; kumaşın, işçiliğin ve zamansız zarafetin buluştuğu ölçüye özel dünyalar. Sizi anlatan gelinliği keşfetmeye buradan başlayın."
              size="lg"
            />
          </Reveal>
        </Container>
      </section>

      {/* Koleksiyon listesi — editoryal kart */}
      <section className="bg-powder pb-24 sm:pb-32">
        <Container>
          {collections.length === 0 ? (
            <Reveal className="mx-auto max-w-xl py-16 text-center">
              <p className="text-muted leading-relaxed">
                Koleksiyonlarımız çok yakında burada. O zamana dek, size özel
                bir gelinlik için atölyemizde randevu oluşturabilirsiniz.
              </p>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2">
              {collections.map((collection, i) => (
                <Reveal
                  key={collection.id}
                  as="div"
                  delay={(i % 2) * 0.08}
                  y={24}
                >
                  <Link
                    href={`/koleksiyonlar/${collection.slug}`}
                    className="group block"
                  >
                    <div className="overflow-hidden bg-cream">
                      <Media
                        src={collection.coverImage ?? undefined}
                        alt={collection.name}
                        ratio="landscape"
                        priority={i < 2}
                        className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-5 flex flex-col gap-2">
                      <span className="u-label text-rose">Koleksiyon</span>
                      <h2 className="font-display text-2xl text-ink transition-colors group-hover:text-muted sm:text-3xl">
                        {collection.name}
                      </h2>
                      {collection.description ? (
                        <p className="max-w-xl text-muted leading-relaxed">
                          {collection.description}
                        </p>
                      ) : null}
                      <span className="u-label mt-1 text-faint transition-colors group-hover:text-rose">
                        Koleksiyonu keşfet
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <CtaBand tone="cream" />
    </>
  );
}
