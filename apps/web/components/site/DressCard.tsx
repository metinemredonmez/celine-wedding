import Link from "next/link";
import type { Dress, DressListItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type DressCardProps = {
  dress: Dress | DressListItem;
  /** koleksiyon adını isim altında göster (varsa) */
  showCollection?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Portre foto (yoksa pudra "CELINE" placeholder) + model adı + koleksiyon.
 * Kart üzerine gelince ikinci görsele yumuşak crossfade + hafif zoom — abartısız.
 * /modeller/[slug] detayına link. Görsel yoksa placeholder; CSS-only hover.
 */
export function DressCard({
  dress,
  showCollection = true,
  className,
  priority = false,
}: DressCardProps) {
  const images = [...(dress.images ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const first = images[0];
  const second = images[1];
  const collectionName = dress.collection?.name;

  return (
    <Link
      href={`/modeller/${dress.slug}`}
      className={cn("group block", className)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-powder-deep">
        {first ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={first.url}
              alt={first.alt ?? dress.name}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-out group-hover:scale-[1.04]",
                second && "group-hover:opacity-0",
              )}
            />
            {second ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={second.url}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-[opacity,transform] duration-[900ms] ease-out group-hover:scale-[1.04] group-hover:opacity-100"
              />
            ) : null}
          </>
        ) : (
          <span className="font-display absolute inset-0 flex items-center justify-center text-2xl tracking-[0.4em] text-rose/50">
            CELINE
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <h3 className="font-display text-xl text-ink transition-colors group-hover:text-muted">
          {dress.name}
        </h3>
        {showCollection && collectionName ? (
          <span className="u-label !text-[0.62rem] text-faint">
            {collectionName}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export default DressCard;
