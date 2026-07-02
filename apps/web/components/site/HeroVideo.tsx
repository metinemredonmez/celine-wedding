"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type HeroVideoProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Hero arka plan videosu — zarif fallback ile.
 *
 * Kaynak: NEXT_PUBLIC_HERO_VIDEO doluysa onu, değilse '/hero.mp4' kullanır.
 * Video yüklenemezse (dosya yoksa vb.) veya kaynak yoksa, pudra-deep hero
 * bloğuna düşer: çok yavaş ken-burns (scale 1→1.06 ~18s) + soluk ink gradyanı.
 * Böylece video dosyası olmasa da "kasıtlı" görünen animasyonlu pudra hero olur.
 *
 * İçerik (children: hero metni + butonlar) medyanın ÜSTÜNDE, z-indexli katmanda.
 */
export function HeroVideo({ children, className }: HeroVideoProps) {
  const reduce = useReducedMotion();

  // Boş string'i de "yok" say: env tanımlı ama boşsa /hero.mp4'e düş.
  const envSrc = process.env.NEXT_PUBLIC_HERO_VIDEO;
  const src = envSrc && envSrc.trim().length > 0 ? envSrc : "/hero.mp4";

  // Video patlarsa fallback'e geç.
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = Boolean(src) && !videoFailed;

  return (
    <div className={cn("relative overflow-hidden bg-powder-deep", className)}>
      {/* --- Medya katmanı --- */}
      <div aria-hidden className="absolute inset-0">
        {showVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
          />
        ) : (
          // Fallback: yavaş ken-burns pudra-deep blok (reduced-motion → statik).
          <motion.div
            className="absolute inset-0 bg-powder-deep"
            initial={reduce ? undefined : { scale: 1 }}
            animate={reduce ? undefined : { scale: 1.06 }}
            transition={
              reduce
                ? undefined
                : {
                    duration: 18,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                  }
            }
          >
            {/* İnce monogram hissi — pudra bloğa zarif bir merkez verir */}
            <span className="font-display absolute inset-0 flex items-center justify-center text-2xl tracking-[0.4em] text-rose/40">
              CELINE
            </span>
          </motion.div>
        )}
      </div>

      {/* --- Okunurluk için çok hafif, havadar ink katmanı --- */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/35 via-ink/5 to-transparent"
      />

      {/* --- İçerik katmanı (medyanın üstünde) --- */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

export default HeroVideo;
