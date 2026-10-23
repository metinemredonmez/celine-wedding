// POST /api/try-on → NestJS POST /try-on (sanal gelinlik denemesi oluştur).
import type { NextRequest } from "next/server";
import { proxyTryOn } from "@/lib/try-on-bff";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return proxyTryOn(req, "/try-on");
}
