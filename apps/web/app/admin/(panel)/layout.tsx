// Celine Admin — guard'lı panel kabuğu.
// Public Header/Footer YOK: üstte ince bar + solda (desktop) / altta (mobil) nav.
// Guard: auth cookie'si hiç yoksa login'e. (Access token süresi dolmuşsa
// BFF proxy refresh eder; bu yüzden at VEYA rt'nin varlığı yeterli.)

import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminMobileNav, AdminSidebarNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { ToastProvider } from "@/components/admin/ui-client";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s · Celine Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  const hasSession =
    Boolean(jar.get("celine_at")?.value) || Boolean(jar.get("celine_rt")?.value);

  if (!hasSession) {
    redirect("/admin/login");
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-powder">
        {/* Üst ince bar */}
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <Link href="/admin" className="flex items-baseline gap-2.5">
              <span className="u-wordmark text-[0.95rem] text-ink">CELINE</span>
              <span className="u-label text-faint">Admin</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                target="_blank"
                className="hidden min-h-11 items-center px-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink sm:inline-flex"
              >
                Siteyi Gör
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Gövde: sol nav (desktop) + içerik */}
        <div className="flex flex-1">
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-ink/10 bg-cream md:block">
            <AdminSidebarNav />
          </aside>
          <main className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8 md:pb-10">
            {children}
          </main>
        </div>

        {/* Mobil alt nav */}
        <AdminMobileNav />
      </div>
    </ToastProvider>
  );
}
