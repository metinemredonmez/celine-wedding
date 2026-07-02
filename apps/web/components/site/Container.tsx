import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** yatay iç boşluğu genişletir/daraltır */
  size?: "default" | "narrow" | "wide";
  as?: ElementType;
};

const widths: Record<NonNullable<ContainerProps["size"]>, string> = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-[1400px]",
};

/** Ortalanmış içerik kabı — tutarlı yatay boşluk. */
export function Container({
  children,
  className,
  size = "default",
  as,
}: ContainerProps) {
  const Tag = as ?? "div";
  return (
    <Tag className={cn("mx-auto w-full px-6 sm:px-8", widths[size], className)}>
      {children}
    </Tag>
  );
}

export default Container;
