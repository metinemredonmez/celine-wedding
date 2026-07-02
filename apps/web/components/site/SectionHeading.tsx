import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** küçük uppercase etiket (üstte) */
  eyebrow?: string;
  /** büyük serif başlık */
  title: ReactNode;
  /** başlık altı sakin metin */
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** başlık boyutu */
  size?: "md" | "lg";
};

/** eyebrow + serif başlık + opsiyonel alt metin. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  size = "md",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? <span className="u-label text-rose">{eyebrow}</span> : null}
      <h2
        className={cn(
          "font-display text-ink",
          size === "lg"
            ? "text-4xl sm:text-5xl md:text-6xl"
            : "text-3xl sm:text-4xl md:text-5xl",
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-muted leading-relaxed",
            align === "center" ? "mx-auto" : "",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default SectionHeading;
