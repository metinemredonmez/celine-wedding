// POST /api/admin/login — NestJS /auth/login'e iletir, token çiftini
// httpOnly cookie'lere yazar. Token gövdede ASLA döndürülmez.

import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE,
  setAuthCookies,
  type TokenPair,
} from "@/lib/admin-bff";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Geçersiz istek gövdesi." },
      { status: 400 },
    );
  }

  if (typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json(
      { message: "E-posta ve şifre zorunludur." },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Sunucuya ulaşılamadı. Lütfen tekrar deneyin." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    // 429 (brute-force throttle) ayrı mesaj; diğer her şey kimlik hatası.
    if (upstream.status === 429) {
      return NextResponse.json(
        { message: "Çok fazla deneme yapıldı. Lütfen biraz bekleyin." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { message: "E-posta veya şifre hatalı." },
      { status: 401 },
    );
  }

  const tokens = (await upstream.json()) as TokenPair;
  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, tokens);
  return res;
}
