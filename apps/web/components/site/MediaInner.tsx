"use client";

import { useState } from "react";

/**
 * Görseli render eder; URL yoksa VEYA yüklenirken patlarsa (404, sahte URL, vb.)
 * şık pudra "CELINE" placeholder'ına düşer — asla kırık ikon gösterilmez.
 * Bir üstteki Media, relative + aspect kabı sağlar.
 */
export function MediaInner({
  src,
  alt,
  priority = false,
  position = "center",
}: {
  src?: string;
  alt?: string;
  priority?: boolean;
  position?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="font-display absolute inset-0 flex items-center justify-center text-2xl tracking-[0.4em] text-rose/50"
    >
      CELINE
    </span>
  );
}
