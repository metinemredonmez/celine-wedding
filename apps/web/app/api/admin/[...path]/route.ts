// /api/admin/[...path] — catch-all BFF proxy.
//
// Cookie'deki access token'ı Bearer olarak ekleyip isteği NestJS API'ye
// iletir. 401 gelirse refresh token ile /auth/refresh dener, cookie'leri
// tazeler ve isteği BİR kez tekrarlar; yine 401/refresh başarısız →
// cookie'leri temizleyip 401 döner (client login'e yönlendirir).
//
// NOT: /api/admin/login ve /api/admin/logout statik route'ları bu catch-all'dan
// ÖNCE eşleşir (Next.js statik segment önceliği).

import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE,
  AT_COOKIE,
  RT_COOKIE,
  clearAuthCookies,
  setAuthCookies,
  type TokenPair,
} from "@/lib/admin-bff";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ path: string[] }> };

/**
 * Refresh token'lar backend'de ROTASYONLU (tek kullanımlık). Paralel istekler
 * aynı anda 401 alırsa hepsi refresh'e koşup birbirini geçersiz kılmasın diye
 * aynı rt için tek uçuşta tek refresh yapılır.
 */
const inflightRefresh = new Map<string, Promise<TokenPair | null>>();

function refreshTokens(rt: string): Promise<TokenPair | null> {
  const existing = inflightRefresh.get(rt);
  if (existing) return existing;

  const p = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
        cache: "no-store",
      });
      if (!res.ok) return null;
      return (await res.json()) as TokenPair;
    } catch {
      return null;
    } finally {
      // Sonuç dağıtıldıktan sonra kaydı bırak (kısa pencere yeterli).
      setTimeout(() => inflightRefresh.delete(rt), 3000);
    }
  })();

  inflightRefresh.set(rt, p);
  return p;
}

async function proxy(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const target = `${API_BASE}/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;

  const at = req.cookies.get(AT_COOKIE)?.value;
  const rt = req.cookies.get(RT_COOKIE)?.value;

  if (!at && !rt) {
    return NextResponse.json({ message: "Oturum gerekli." }, { status: 401 });
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const rawBody = hasBody ? await req.text() : undefined;
  const contentType = req.headers.get("content-type") ?? "application/json";

  const forward = async (token: string | undefined): Promise<Response> =>
    fetch(target, {
      method: req.method,
      headers: {
        accept: "application/json",
        ...(rawBody ? { "content-type": contentType } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: rawBody || undefined,
      cache: "no-store",
    });

  let upstream: Response;
  let refreshed: TokenPair | null = null;

  try {
    upstream = await forward(at);

    if (upstream.status === 401 && rt) {
      refreshed = await refreshTokens(rt);
      if (!refreshed) {
        const res = NextResponse.json(
          { message: "Oturum süresi doldu. Lütfen tekrar giriş yapın." },
          { status: 401 },
        );
        clearAuthCookies(res);
        return res;
      }
      upstream = await forward(refreshed.accessToken);
    }
  } catch {
    return NextResponse.json(
      { message: "Sunucuya ulaşılamadı. Lütfen tekrar deneyin." },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  const res = new NextResponse(text || null, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
  if (refreshed) setAuthCookies(res, refreshed);
  return res;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx);
}
