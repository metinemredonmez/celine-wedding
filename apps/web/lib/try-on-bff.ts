// Sanal gelinlik denemesi — BFF yardımcısı. SADECE app/api/try-on/** route
// handler'ları import eder. Tarayıcı NestJS'e doğrudan değil, bu relative uçlar
// üzerinden ulaşır (API dışarı açık olmak zorunda değil; CORS gerekmez).

import { NextRequest, NextResponse } from "next/server";

/** NestJS API tabanı (server-side). */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * İsteği API'ye iletir. Gerçek istemci IP'si x-forwarded-for ile taşınır ki
 * API'deki saatlik deneme sınırı (IP başına 5) herkesi tek IP saymasın.
 */
export async function proxyTryOn(
  req: NextRequest,
  path: string,
): Promise<NextResponse> {
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;
  const xff = req.headers.get("x-forwarded-for");

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}${path}`, {
      method: req.method,
      headers: {
        accept: "application/json",
        ...(body ? { "content-type": "application/json" } : {}),
        ...(xff ? { "x-forwarded-for": xff } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Sunucuya ulaşılamadı. Lütfen tekrar deneyin." },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  return new NextResponse(text || null, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
