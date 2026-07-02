"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Açılış intro animasyonu — Danielle-Frankel esintili marka reveal'ı.
 *
 * Davranış:
 *  - Tam ekran sabit overlay (bg-powder), ortada CELINE wordmark + ince etiket
 *    + çizilerek gelen hairline.
 *  - Sıra: wordmark fade+rise → hairline 0→genişler → kısa bekleme →
 *    tüm overlay yukarı kayarak (y) + solarak sayfayı açar → unmount.
 *  - Tarayıcı OTURUMU başına yalnızca bir kez oynar (sessionStorage guard).
 *  - SSR/hydration güvenli: mounted olana dek null döner.
 *  - prefers-reduced-motion açıksa animasyon TAMAMEN atlanır (overlay yok).
 */
export function OpeningIntro() {
  // Hydration mismatch olmasın diye ilk render'da hiçbir şey döndürmeyiz.
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Reduced motion: intro'yu tamamen atla, "görüldü" olarak işaretle.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let seen: string | null = null;
    try {
      seen = window.sessionStorage.getItem("celine_intro_seen");
    } catch {
      // sessionStorage erişilemezse (gizli mod vb.) intro'yu atla.
      seen = "1";
    }

    if (prefersReduced || seen) {
      return;
    }

    setShow(true);

    // Toplam ~2s sonra overlay kalkar; guard'ı hemen yazarız ki
    // aynı oturumda tekrar tetiklenmesin.
    try {
      window.sessionStorage.setItem("celine_intro_seen", "1");
    } catch {
      /* yoksay */
    }

    const timer = window.setTimeout(() => setShow(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="celine-intro"
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-powder"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -28 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="u-wordmark font-display text-ink text-5xl sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            CELINE
          </motion.span>

          <motion.span
            className="u-label mt-5 text-faint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            Seda Dönmez Couture
          </motion.span>

          <motion.span
            aria-hidden
            className="mt-7 block h-px bg-rose-soft"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default OpeningIntro;
