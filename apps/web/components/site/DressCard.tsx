import Link from "next/link";
import type { Dress, DressListItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Media, firstImage } from "./Media";

type DressCardProps = {
  dress: Dress | DressListItem;
  /** koleksiyon adını isim altında göster (varsa) */
  showCollection?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Portre foto (yoksa pudra placeholder) + model adı + koleksiyon.
 * /modeller/[slug] detayına link. Gölge yok, tiny radius, sakin hover.
 */
export function DressCard({
  dress,
  showCollection = true,
  className,
  priority = false,
}: DressCardProps) {
  const img = firstImage(dress.images);
  const collectionName = dress.collection?.name;

  return (
    <Link
      href={`/modeller/${dress.slug}`}
      className={cn("group block", className)}
    >
      <div className="overflow-hidden bg-cream">
        <Media
          src={img?.url}
          alt={img?.alt ?? dress.name}
          ratio="portrait"
          priority={priority}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
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
