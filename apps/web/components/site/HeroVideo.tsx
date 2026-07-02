"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type HeroVideoProps = {
  children?: ReactNode;
  className?: string;
  /** Arka plan videosu (URL). Verilmezse env → /hero.mp4 kullanılır. */
  video?: string;
  /** Video yoksa/başarısızsa gösterilecek tam ekran arka plan fotoğrafı. */
  poster?: string;
  /** poster object-position (örn. "center 30%"). */
  posterPosition?: string;
};

/**
 * Hero arka planı — öncelik sırası:
 *   1) NEXT_PUBLIC_HERO_VIDEO doluysa video (poster ile),
 *   2) poster verildiyse tam ekran foto + çok yavaş ken-burns,
 *   3) hiçbiri yoksa pudra-deep blok + CELINE monogram.
 *
 * İçerik (children: hero metni + butonlar) medyanın ÜSTÜNDE, z-index'li katmanda.
 * Foto/video varken okunurluk için güçlü, yoksa hafif bir ink gradyanı bindirilir.
 */
export function HeroVideo({
  children,
  className,
  video,
  poster,
  posterPosition = "center",
}: HeroVideoProps) {
  const reduce = useReducedMotion();

  // Öncelik: açık prop (admin) → env → paketteki /hero.mp4 (ipek kumaş loop'u).
  const envSrc = process.env.NEXT_PUBLIC_HERO_VIDEO;
  const videoSrc =
    video && video.trim().length > 0
      ? video.trim()
      : envSrc && envSrc.trim().length > 0
        ? envSrc.trim()
        : "/hero.mp4";

  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const showVideo = Boolean(videoSrc) && !videoFailed;
  const showPoster = !showVideo && Boolean(poster) && !posterFailed;
  const hasMedia = showVideo || showPoster;

  return (
    <div className={cn("relative overflow-hidden bg-powder-deep", className)}>
      {/* --- Medya katmanı --- */}
      <div aria-hidden className="absolute inset-0">
        {showVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc ?? undefined}
            poster={poster}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
          />
        ) : showPoster ? (
          // Tam ekran foto — çok yavaş ken-burns (reduced-motion → statik).
          <motion.div
            className="absolute inset-0"
            initial={reduce ? undefined : { scale: 1.04 }}
            animate={reduce ? undefined : { scale: 1.12 }}
            transition={
              reduce
                ? undefined
                : {
                    duration: 20,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                  }
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt=""
              onError={() => setPosterFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: posterPosition }}
            />
          </motion.div>
        ) : (
          // Fallback: yavaş ken-burns pudra-deep blok (foto da yoksa).
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
            <span className="font-display absolute inset-0 flex items-center justify-center text-2xl tracking-[0.4em] text-rose/40">
              CELINE
            </span>
          </motion.div>
        )}
      </div>

      {/* --- Okunurluk için ink gradyanı: medya varken güçlü, yoksa hafif --- */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          hasMedia
            ? "bg-gradient-to-t from-ink/75 via-ink/30 to-ink/15"
            : "bg-gradient-to-t from-ink/35 via-ink/5 to-transparent",
        )}
      />

      {/* --- İçerik katmanı (medyanın üstünde) --- */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

export default HeroVideo;
