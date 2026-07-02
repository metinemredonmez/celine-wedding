import type { ImageAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

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
 * Görsel gösterir; yoksa/patlarsa pudra placeholder blok kalır.
 * images:{unoptimized:true} olduğu için düz <img> kullanır (host config derdi yok).
 * Placeholder: <img> onError ile gizlenir, arka plan pudra bloğu görünür.
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
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      ) : (
        // Pudra placeholder — ince monogram hissi
        <span
          aria-hidden
          className="font-display absolute inset-0 flex items-center justify-center text-2xl tracking-[0.4em] text-rose/50"
        >
          CELINE
        </span>
      )}
    </div>
  );
}

/** İlk görseli (order'a göre) seçen yardımcı. */
export function firstImage(images?: ImageAsset[]): ImageAsset | undefined {
  if (!images || images.length === 0) return undefined;
  return [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
}

export default Media;
