import type { Metadata } from "next";
import Link from "next/link";
import { getCollections, getDresses } from "@/lib/api";
import { getLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n/config";
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

  const [collections, page, locale] = await Promise.all([
    getCollections(),
    getDresses({ collection: activeCollection, limit: 24 }),
    getLocale(),
  ]);

  const dresses = page.data;

  return (
    <>
      <section className="bg-powder pt-20 pb-16 sm:pt-28 sm:pb-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t(locale, "modeller.eyebrow")}
              title={t(locale, "modeller.title")}
              subtitle={t(locale, "modeller.subtitle")}
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
                {t(locale, "modeller.filterAll")}
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
                {t(locale, "modeller.empty.title")}
              </p>
              <p className="mt-4 text-muted leading-relaxed">
                {t(locale, "modeller.empty.body")}
              </p>
              {activeCollection ? (
                <Link
                  href="/modeller"
                  className="u-label mt-6 inline-block text-rose transition-colors hover:text-ink"
                >
                  {t(locale, "modeller.empty.viewAll")}
                </Link>
              ) : null}
            </Reveal>
          )}
        </Container>
      </section>

      <CtaBand />
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
