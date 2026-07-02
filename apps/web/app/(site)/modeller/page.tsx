import type { Metadata } from "next";
import Link from "next/link";
import { getCollections, getDresses } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { DressCard } from "@/components/site/DressCard";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Gelinlikler",
  description:
    "Celine Gelinlik couture gelinlik modelleri — ölçüye özel, el işçiliğiyle hazırlanan tasarımlar. Koleksiyona göre keşfedin, beğendiğiniz için randevu oluşturun.",
};

// ISR ile uyumlu; DressQuery/koleksiyon filtresi searchParams'tan gelir.
type PageProps = {
  searchParams: Promise<{ koleksiyon?: string }>;
};

export default async function ModellerPage({ searchParams }: PageProps) {
  const { koleksiyon } = await searchParams;
  const activeCollection = koleksiyon?.trim() || undefined;

  const [collections, page] = await Promise.all([
    getCollections(),
    getDresses({ collection: activeCollection, limit: 24 }),
  ]);

  const dresses = page.data;

  return (
    <>
      <section className="bg-powder pt-20 pb-16 sm:pt-28 sm:pb-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Modeller"
              title="Gelinlikler"
              subtitle="Her biri ölçüye özel yeniden yorumlanan couture tasarımlar. Beğendiğiniz modeli atölyemizde birebir deneyimlemek için randevu oluşturabilirsiniz."
              size="lg"
            />
          </Reveal>

          {/* Koleksiyona göre filtre linkleri (varsa) */}
          {collections.length > 0 ? (
            <Reveal
              as="div"
              delay={0.1}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
              <FilterChip href="/modeller" active={!activeCollection}>
                Tümü
              </FilterChip>
              {collections.map((c) => (
                <FilterChip
                  key={c.id}
                  href={`/modeller?koleksiyon=${encodeURIComponent(c.slug)}`}
                  active={activeCollection === c.slug}
                >
                  {c.name}
                </FilterChip>
              ))}
            </Reveal>
          ) : null}
        </Container>
      </section>

      <section className="bg-powder pb-24 sm:pb-32">
        <Container>
          {dresses.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {dresses.map((dress, i) => (
                <Reveal key={dress.id} delay={(i % 3) * 0.08}>
                  <DressCard dress={dress} priority={i < 3} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="mx-auto max-w-xl py-16 text-center">
              <p className="font-display text-2xl text-ink">
                Bu seçim için henüz model eklenmedi.
              </p>
              <p className="mt-4 text-muted leading-relaxed">
                Yeni modellerimiz atölyede hazırlanıyor. Dilerseniz tüm
                koleksiyonu görüntüleyebilir ya da bir randevu oluşturarak
                birebir görüşebilirsiniz.
              </p>
              {activeCollection ? (
                <Link
                  href="/modeller"
                  className="u-label mt-6 inline-block text-rose transition-colors hover:text-ink"
                >
                  Tüm gelinlikler
                </Link>
              ) : null}
            </Reveal>
          )}
        </Container>
      </section>

      <CtaBand
        title="Beğendiğiniz gelinliği yakından görün"
        text="Modellerimizi atölyemizde birebir deneyimlemek, ölçüye özel uyarlamayı konuşmak için randevu oluşturun."
      />
    </>
  );
}

// --- Koleksiyon filtre linki --- //
function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "u-label border-b pb-1 transition-colors",
        active
          ? "border-ink text-ink"
          : "border-transparent text-faint hover:text-rose",
      )}
    >
      {children}
    </Link>
  );
}
