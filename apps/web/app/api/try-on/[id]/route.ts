// GET /api/try-on/:id → NestJS GET /try-on/:id (durum/sonuç yoklama).
import type { NextRequest } from "next/server";
import { proxyTryOn } from "@/lib/try-on-bff";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return proxyTryOn(req, `/try-on/${encodeURIComponent(id)}`);
}
