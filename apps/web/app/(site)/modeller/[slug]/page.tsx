import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDress, getDressSlugs, getSiteSettings } from "@/lib/api";
import { getLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n/config";
import type { ImageAsset } from "@/lib/types";
import { waLink } from "@/lib/utils";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media, firstImage } from "@/components/site/Media";
import { DressCard } from "@/components/site/DressCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// SSG: bilinen slug'ları önceden üret (hata durumunda boş → on-demand render).
export async function generateStaticParams() {
  const slugs = await getDressSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dress = await getDress(slug);

  if (!dress) {
    return { title: "Gelinlik bulunamadı" };
  }

  const cover = firstImage(dress.images);
  const collectionName = dress.collection?.name;
  const description = collectionName
    ? `${dress.name} — ${collectionName} koleksiyonundan ölçüye özel couture gelinlik. Celine Gelinlik atölyesinde randevu ile deneyimleyin.`
    : `${dress.name} — Celine Gelinlik ölçüye özel couture gelinlik tasarımı. Atölyede randevu ile deneyimleyin.`;

  return {
    title: dress.name,
    description,
    openGraph: {
      title: `${dress.name} · Celine Gelinlik`,
      description,
      ...(cover?.url ? { images: [{ url: cover.url }] } : {}),
    },
  };
}

// Görselleri order'a göre sırala (Media.firstImage ile aynı mantık).
function sortImages(images?: ImageAsset[]): ImageAsset[] {
  if (!images || images.length === 0) return [];
  return [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export default async function DressDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [dress, settings, locale] = await Promise.all([
    getDress(slug),
    getSiteSettings(),
    getLocale(),
  ]);

  if (!dress) {
    notFound();
  }

  const images = sortImages(dress.images);
  const collectionName = dress.collection?.name;
  const collectionSlug = dress.collection?.slug;
  const related = dress.related ?? [];

  const wa = settings.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";
  const waText = t(locale, "detail.waText").replace("{name}", dress.name);

  return (
    <>
      {/* Kırıntı / geri dönüş */}
      <Container className="pt-10 sm:pt-14">
        <nav className="u-label flex flex-wrap items-center gap-2 text-faint">
          <Link href="/modeller" className="transition-colors hover:text-rose">
            {t(locale, "detail.breadcrumb")}
          </Link>
          <span aria-hidden className="text-rose-soft">
            /
          </span>
          <span className="text-muted">{dress.name}</span>
        </nav>
      </Container>

      <section className="bg-powder pt-8 pb-20 sm:pt-12 sm:pb-28">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {/* Sol — büyük galeri */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {images.length > 0 ? (
                images.map((img, i) => (
                  <Reveal key={img.id ?? `${img.url}-${i}`} delay={i === 0 ? 0 : 0.05}>
                    <Media
                      src={img.url}
                      alt={
                        img.alt ??
                        t(locale, "detail.imageAlt")
                          .replace("{name}", dress.name)
                          .replace("{n}", String(i + 1))
                      }
                      ratio="portrait"
                      priority={i === 0}
                      className="bg-cream"
                    />
                  </Reveal>
                ))
              ) : (
                // Görsel yoksa tek pudra placeholder
                <Media
                  src={undefined}
                  alt={dress.name}
                  ratio="portrait"
                  className="bg-cream"
                />
              )}
            </div>

            {/* Sağ — sticky bilgi kolonu */}
            <div className="lg:relative">
              <div className="lg:sticky lg:top-28">
                <Reveal>
                  <div className="flex flex-col gap-6">
                    {collectionName ? (
                      <span className="u-label text-rose">
                        {collectionSlug ? (
                          <Link
                            href={`/koleksiyonlar/${collectionSlug}`}
                            className="transition-colors hover:text-ink"
                          >
                            {collectionName}
                          </Link>
                        ) : (
                          collectionName
                        )}
                      </span>
                    ) : (
                      <span className="u-label text-rose">
                        {t(locale, "detail.couture")}
                      </span>
                    )}

                    <h1 className="font-display text-4xl text-ink sm:text-5xl">
                      {dress.name}
                    </h1>

                    <p className="text-muted leading-relaxed">
                      {t(locale, "detail.description")}
                    </p>

                    {/* Detay satırları — FİYAT YOK */}
                    <dl className="u-hairline flex flex-col gap-4 border-t pt-6">
                      {dress.fabric ? (
                        <div className="flex flex-col gap-1">
                          <dt className="u-label !text-[0.62rem] text-faint">
                            {t(locale, "detail.fabricLabel")}
                          </dt>
                          <dd className="text-ink">{dress.fabric}</dd>
                        </div>
                      ) : null}
                      {collectionName ? (
                        <div className="flex flex-col gap-1">
                          <dt className="u-label !text-[0.62rem] text-faint">
                            {t(locale, "detail.collectionLabel")}
                          </dt>
                          <dd className="text-ink">{collectionName}</dd>
                        </div>
                      ) : null}
                      <div className="flex flex-col gap-1">
                        <dt className="u-label !text-[0.62rem] text-faint">
                          {t(locale, "detail.productionLabel")}
                        </dt>
                        <dd className="text-ink">
                          {t(locale, "detail.productionValue")}
                        </dd>
                      </div>
                    </dl>

                    {/* CTA — Randevu (dolu) + WhatsApp (outline) */}
                    <div className="mt-2 flex flex-col gap-3">
                      <ButtonLink href="/randevu" variant="primary">
                        {t(locale, "detail.appointmentCta")}
                      </ButtonLink>
                      {wa ? (
                        <ButtonLink
                          href={waLink(wa, waText)}
                          variant="outline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t(locale, "detail.whatsappAsk")}
                        </ButtonLink>
                      ) : null}
                    </div>

                    <p className="u-hairline border-t pt-6 text-sm text-faint leading-relaxed">
                      {t(locale, "detail.priceNote")}
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Benzer gelinlikler */}
      {related.length > 0 ? (
        <section className="bg-cream py-20 sm:py-28">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow={t(locale, "detail.relatedEyebrow")}
                title={t(locale, "detail.relatedTitle")}
              />
            </Reveal>
            <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Reveal key={r.id} delay={(i % 3) * 0.08}>
                  <DressCard dress={r} showCollection={false} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
