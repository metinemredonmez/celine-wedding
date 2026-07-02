// Celine Admin — BFF (Backend-for-Frontend) ortak yardımcıları.
// SADECE route handler'lar (app/api/admin/**) tarafından import edilir.
// JWT'ler tarayıcıya SIZMAZ: httpOnly cookie'lerde yaşar, client yalnızca
// /api/admin/... relative uçlarını çağırır.

import type { NextResponse } from "next/server";

/** NestJS API tabanı (server-side). */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const AT_COOKIE = "celine_at"; // access token
export const RT_COOKIE = "celine_rt"; // refresh token

// Backend varsayılanları: access 15m, refresh 7d (JWT_ACCESS_TTL / JWT_REFRESH_TTL).
const AT_FALLBACK_MAX_AGE = 15 * 60;
const RT_FALLBACK_MAX_AGE = 7 * 24 * 60 * 60;

/** POST /auth/login ve /auth/refresh yanıtı. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/**
 * Cookie ömrünü token'ın gerçek `exp` değerinden türetir (imza DOĞRULANMAZ —
 * yalnızca maxAge içindir; doğrulama her istekte NestJS tarafında yapılır).
 */
function jwtMaxAge(token: string, fallback: number): number {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: number };
    if (typeof decoded.exp === "number") {
      const remaining = Math.floor(decoded.exp - Date.now() / 1000);
      if (remaining > 0) return remaining;
    }
  } catch {
    // biçimsiz token → varsayılan ömür
  }
  return fallback;
}

/** Access + refresh çiftini httpOnly cookie'lere yazar. */
export function setAuthCookies(res: NextResponse, tokens: TokenPair): void {
  res.cookies.set(AT_COOKIE, tokens.accessToken, {
    ...COOKIE_BASE,
    maxAge: jwtMaxAge(tokens.accessToken, AT_FALLBACK_MAX_AGE),
  });
  res.cookies.set(RT_COOKIE, tokens.refreshToken, {
    ...COOKIE_BASE,
    maxAge: jwtMaxAge(tokens.refreshToken, RT_FALLBACK_MAX_AGE),
  });
}

/** Her iki auth cookie'sini siler (logout / geçersiz oturum). */
export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(AT_COOKIE, "", { ...COOKIE_BASE, maxAge: 0 });
  res.cookies.set(RT_COOKIE, "", { ...COOKIE_BASE, maxAge: 0 });
}
