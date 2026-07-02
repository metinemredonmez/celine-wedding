import type { ImageAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MediaInner } from "./MediaInner";

type MediaProps = {
  src?: string | null;
  alt?: string | null;
  /** en-boy oranı: portre (3/4), kare, geniş, tam */
  ratio?: "portrait" | "square" | "landscape" | "hero" | "none";
  className?: string;
  /** görsel yükleme önceliği (LCP hero için true) */
  priority?: boolean;
  /** obje konumlandırma */
  position?: string;
};

const ratios: Record<NonNullable<MediaProps["ratio"]>, string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  hero: "aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9]",
  none: "",
};

/**
 * Görsel gösterir; yoksa VEYA URL patlarsa (404/sahte) pudra "CELINE"
 * placeholder'ına düşer — kırık ikon görünmez. Kap server, görsel client (onError).
 * images:{unoptimized:true} olduğu için düz <img>.
 */
export function Media({
  src,
  alt,
  ratio = "portrait",
  className,
  priority = false,
  position = "center",
}: MediaProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-powder-deep",
        ratios[ratio],
        className,
      )}
    >
      <MediaInner
        src={src ?? undefined}
        alt={alt ?? ""}
        priority={priority}
        position={position}
      />
    </div>
  );
}

/** İlk görseli (order'a göre) seçen yardımcı. */
export function firstImage(images?: ImageAsset[]): ImageAsset | undefined {
  if (!images || images.length === 0) return undefined;
  return [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
}

export default Media;
