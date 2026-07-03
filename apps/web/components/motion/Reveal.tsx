"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** görünürlüğe girince gecikme (saniye) */
  delay?: number;
  /** yükseliş mesafesi (px) */
  y?: number;
  /** yatay kayma mesafesi (px) — zig-zag editoryal açılış için */
  x?: number;
  className?: string;
  /** true ise her göründüğünde tekrar oynatır (varsayılan tek sefer) */
  repeat?: boolean;
  as?: "div" | "section" | "li" | "span" | "article";
};

/**
 * Yavaş fade + rise/slide reveal-on-scroll.
 * prefers-reduced-motion'a saygılı (hareket kapalıysa anında görünür).
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  x = 0,
  className,
  repeat = false,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: !repeat, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

export default Reveal;
