"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { adminLogout } from "@/lib/admin-api";

/** Üst bardaki "Çıkış" — BFF logout sonrası login'e tam yönlendirme. */
export function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await adminLogout();
    } catch {
      // cookie'ler silinemese bile login'e dön — proxy zaten 401 verir
    }
    window.location.assign("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      className="inline-flex min-h-11 items-center gap-2 rounded-[2px] px-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink disabled:opacity-50"
    >
      <LogOut size={15} strokeWidth={1.75} aria-hidden />
      <span className="hidden sm:inline">{busy ? "Çıkılıyor…" : "Çıkış"}</span>
    </button>
  );
}
