// Celine Admin — sade UI kiti (sunucu-uyumlu, durumsuz parçalar).
// Dil: public site ile aynı — pudra zemin, beyaz kart, antrasit metin,
// tiny radius, gölge yok. İşlevsel: net tablolar, büyük dokunma alanları.
// Durumlu parçalar (Toggle, ConfirmDialog, Toast) → ./ui-client.tsx

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────── Card ───────────────────────────

type CardProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** başlık satırının sağına eylem (buton/link) */
  action?: ReactNode;
  className?: string;
  /** içerik dolgusuz gelsin (ör. tam-genişlik tablo) */
  flush?: boolean;
  children: ReactNode;
};

export function Card({ title, subtitle, action, className, flush, children }: CardProps) {
  return (
    <section
      className={cn(
        "border border-ink/10 bg-cream rounded-[2px]",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-ink/10 px-5 py-4">
          <div>
            {title && (
              <h2 className="font-display text-xl leading-snug">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn(flush ? "" : "px-5 py-4")}>{children}</div>
    </section>
  );
}

// ─────────────────────────── Field ───────────────────────────

type FieldProps = {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="u-label block text-faint">
        {label}
        {required && <span className="ml-1 text-rose">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-[#a33a3a]">{error}</p>}
    </div>
  );
}

// ─────────────────────── Input / Select / Textarea ───────────────────────

const controlBase =
  "w-full rounded-[2px] border bg-white px-3.5 text-[0.95rem] text-ink " +
  "placeholder:text-faint transition-colors duration-200 " +
  "focus:border-rose focus:outline-none disabled:opacity-50";

type InputProps = ComponentPropsWithoutRef<"input"> & { invalid?: boolean };

export function Input({ className, invalid, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        controlBase,
        "h-11",
        invalid ? "border-[#a33a3a]" : "border-ink/15",
        className,
      )}
      {...rest}
    />
  );
}

type SelectProps = ComponentPropsWithoutRef<"select"> & { invalid?: boolean };

export function Select({ className, invalid, children, ...rest }: SelectProps) {
  return (
    <select
      className={cn(
        controlBase,
        "h-11 appearance-none bg-white",
        invalid ? "border-[#a33a3a]" : "border-ink/15",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & { invalid?: boolean };

export function Textarea({ className, invalid, rows = 4, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        controlBase,
        "py-2.5 leading-relaxed",
        invalid ? "border-[#a33a3a]" : "border-ink/15",
        className,
      )}
      {...rest}
    />
  );
}

// ─────────────────────────── Badge ───────────────────────────

export type BadgeTone = "neutral" | "rose" | "success" | "warning" | "danger";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-ink/5 text-muted",
  rose: "bg-rose-soft/40 text-ink",
  success: "bg-[#e3ecdf] text-[#3d5a34]",
  warning: "bg-[#f3e8d3] text-[#7a5c1e]",
  danger: "bg-[#f4dcdc] text-[#8c3232]",
};

type BadgeProps = {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
};

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] px-2 py-1",
        "text-[0.65rem] font-medium uppercase tracking-[0.14em] leading-none",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─────────────────────────── TableShell ───────────────────────────

type TableShellProps = {
  /** başlık hücreleri (sıra colSpan hesabında kullanılır) */
  head: ReactNode[];
  /** satırlar: <tr> elemanları */
  children?: ReactNode;
  /** verilirse tek satırlık boş durum gösterilir (satır yok demektir) */
  empty?: ReactNode;
  className?: string;
};

export function TableShell({ head, children, empty, className }: TableShellProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10">
            {head.map((h, i) => (
              <th key={i} className="u-label whitespace-nowrap px-4 py-3 text-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {empty != null ? (
            <tr>
              <td colSpan={head.length} className="px-4 py-10 text-center text-muted">
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

/** TableShell satır hücresi — tutarlı dolgu. */
export function Td({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"td">) {
  return (
    <td className={cn("px-4 py-3.5 align-middle", className)} {...rest}>
      {children}
    </td>
  );
}

// ─────────────────────────── EmptyState ───────────────────────────

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("px-6 py-12 text-center", className)}>
      <p className="font-display text-lg text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
