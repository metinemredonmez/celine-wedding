"use client";

// Celine Admin — navigasyon (desktop: sol sütun, mobil: alt sabit bar).

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarCheck2,
  FileText,
  FolderOpen,
  LayoutGrid,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Panel", short: "Panel", href: "/admin", icon: LayoutGrid },
  { label: "Gelinlikler", short: "Modeller", href: "/admin/gelinlikler", icon: Sparkles },
  { label: "Koleksiyonlar", short: "Koleksiyon", href: "/admin/koleksiyonlar", icon: FolderOpen },
  { label: "İçerik", short: "İçerik", href: "/admin/icerik", icon: FileText },
  { label: "Randevular", short: "Randevu", href: "/admin/randevular", icon: CalendarCheck2 },
  { label: "Takvim", short: "Takvim", href: "/admin/takvim", icon: CalendarDays },
  { label: "Ayarlar", short: "Ayarlar", href: "/admin/ayarlar", icon: Settings },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop — sol dikey menü. */
export function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin menüsü" className="flex flex-col gap-1 p-3">
      {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-[2px] px-3.5 py-3 text-sm transition-colors",
              active
                ? "bg-ink text-cream"
                : "text-muted hover:bg-powder hover:text-ink",
            )}
          >
            <Icon size={17} strokeWidth={1.75} aria-hidden />
            <span className={cn(active && "font-medium")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobil — alt sabit bar (büyük dokunma alanları). */
export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin menüsü"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-cream md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-7">
        {ADMIN_NAV.map(({ short, label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2",
                "text-[0.6rem] uppercase tracking-wide transition-colors",
                active ? "text-ink" : "text-faint",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} aria-hidden />
              <span className={cn("leading-none", active && "font-medium")}>
                {short}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
