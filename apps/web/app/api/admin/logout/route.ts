// POST /api/admin/logout — NestJS'te refresh hash'ini geçersiz kılar
// (best-effort) ve cookie'leri siler.

import { NextRequest, NextResponse } from "next/server";
import { API_BASE, AT_COOKIE, clearAuthCookies } from "@/lib/admin-bff";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const at = req.cookies.get(AT_COOKIE)?.value;

  if (at) {
    // Sunucu tarafında oturumu kapat — başarısız olsa da cookie'ler silinir.
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { authorization: `Bearer ${at}` },
        cache: "no-store",
      });
    } catch {
      // ağ hatası — yerel çıkışı engellemez
    }
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
