import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline";
type Size = "md" | "sm";

// NOT: .u-label kullanmıyoruz çünkü o sınıf rengi faint'e sabitler; buton
// rengini variant belirlesin. Uppercase + tracking'i burada inline veriyoruz.
const base =
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-sans " +
  "font-medium uppercase tracking-[0.18em] leading-none " +
  "transition-colors duration-300 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  md: "px-8 py-3.5 text-[0.72rem]",
  sm: "px-6 py-2.5 text-[0.68rem]",
};

const variants: Record<Variant, string> = {
  // dolu koyu (antrasit)
  primary: "bg-ink text-cream hover:bg-[#3a352f]",
  // outline dusty-rose hairline
  outline:
    "border border-rose text-ink bg-transparent hover:bg-cream hover:border-ink",
};

function classesFor(variant: Variant, size: Size, className?: string) {
  return cn(base, sizes[size], variants[variant], className);
}

// --- Link versiyonu (href verilirse) --- //
type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">;

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link href={href} className={classesFor(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

// --- <button> versiyonu --- //
type ButtonProps = {
  variant?: Variant;
  size?: Size;
} & ComponentPropsWithoutRef<"button">;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classesFor(variant, size, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
