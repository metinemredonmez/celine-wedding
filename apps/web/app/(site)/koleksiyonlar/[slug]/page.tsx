import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollection, getCollections } from "@/lib/api";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media } from "@/components/site/Media";
import { DressCard } from "@/components/site/DressCard";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { collectionCover } from "@/lib/gallery";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) {
    return { title: "Koleksiyon bulunamadı" };
  }

  const description =
    collection.description ??
    `${collection.name} koleksiyonu — Celine Gelinlik couture. Ölçüye özel gelinlik modellerini keşfedin.`;

  return {
    title: collection.name,
    description,
    openGraph: {
      title: `${collection.name} · Celine Gelinlik`,
      description,
      images: collection.coverImage ? [collection.coverImage] : undefined,
    },
  };
}

// generateStaticParams gerekmez — dinamik render + ISR (lib/api revalidate).
export default async function KoleksiyonDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const [collection, allCollections] = await Promise.all([
    getCollection(slug),
    getCollections(),
  ]);

  if (!collection) {
    notFound();
  }

  const dresses = collection.dresses ?? [];
  const others = allCollections.filter((col) => col.slug !== slug);

  return (
    <>
      {/* Hero — koleksiyon kapak görseli + başlık */}
      <section className="bg-powder">
        <Container className="pt-24 sm:pt-32">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Link
              href="/koleksiyonlar"
              className="u-label text-faint transition-colors hover:text-rose"
            >
              Koleksiyonlar
            </Link>
            <h1 className="font-display mt-5 text-4xl text-ink sm:text-5xl md:text-6xl">
              {collection.name}
            </h1>
            {collection.description ? (
              <p className="mx-auto mt-6 max-w-xl text-muted leading-relaxed">
                {collection.description}
              </p>
            ) : null}
          </Reveal>
        </Container>

        <Container size="wide" className="mt-14 sm:mt-20">
          <Reveal y={28}>
            <Media
              src={collectionCover(collection.coverImage, 0)}
              alt={collection.name}
              ratio="hero"
              priority
              className="bg-cream"
            />
          </Reveal>
        </Container>
      </section>

      {/* Koleksiyon içindeki gelinlikler */}
      <section className="bg-powder py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={dresses.length > 0 ? `${dresses.length} Model` : "Modeller"}
              title="Bu koleksiyondan"
              subtitle={
                dresses.length > 0
                  ? "Her biri ölçüye özel dikilen, kişiye özel yorumlanan tasarımlar. Beğendiğiniz modeli atölyemizde birlikte hayata geçirelim."
                  : undefined
              }
              align="left"
            />
          </Reveal>

          {dresses.length === 0 ? (
            <Reveal className="mt-10 max-w-xl">
              <p className="text-muted leading-relaxed">
                Bu koleksiyonun modelleri çok yakında burada olacak. Dilerseniz
                şimdiden atölyemizde bir randevu oluşturabilir, size özel
                tasarımı birlikte konuşabiliriz.
              </p>
            </Reveal>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {dresses.map((dress, i) => (
                <Reveal key={dress.id} as="div" delay={(i % 3) * 0.06} y={24}>
                  <DressCard
                    dress={dress}
                    showCollection={false}
                    priority={i < 3}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Diğer koleksiyonlar — editoryal geçiş */}
      {others.length > 0 ? (
        <section className="border-t border-rose-soft bg-powder py-14 sm:py-20">
          <Container>
            <Reveal className="flex flex-col items-center gap-6 text-center">
              <span className="u-label text-rose">Diğer koleksiyonlar</span>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {others.map((col) => (
                  <Link
                    key={col.id}
                    href={`/koleksiyonlar/${col.slug}`}
                    className="group inline-flex items-center gap-2 font-display text-2xl text-ink transition-colors hover:text-rose sm:text-3xl"
                  >
                    {col.name}
                    <span
                      aria-hidden
                      className="text-lg text-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-rose"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          </Container>
        </section>
      ) : null}

      <CtaBand tone="cream" />
    </>
  );
}
