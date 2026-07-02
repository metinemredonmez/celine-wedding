// Celine Admin — client fetch yardımcıları.
// Admin client kodu SADECE relative /api/admin/... uçlarını çağırır;
// token'lara hiçbir zaman dokunmaz (httpOnly cookie'lerde, BFF yönetir).

/** NestJS hata gövdesi: { statusCode, message: string | string[], error }. */
function extractMessage(body: unknown): string | null {
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
    if (Array.isArray(m) && m.length > 0) return m.map(String).join(" · ");
  }
  return null;
}

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

/** "dresses/admin/all" | "/dresses/admin/all" → "/api/admin/dresses/admin/all" */
function toUrl(path: string): string {
  return `/api/admin/${path.replace(/^\/+/, "")}`;
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  opts: { redirectOn401?: boolean } = {},
): Promise<T> {
  const { redirectOn401 = true } = opts;

  let res: Response;
  try {
    res = await fetch(toUrl(path), {
      method,
      headers:
        body !== undefined ? { "content-type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new AdminApiError(0, "Bağlantı kurulamadı. İnternetinizi kontrol edin.");
  }

  // Oturum düşmüş (BFF refresh de deneyip başaramadı) → login'e.
  if (res.status === 401 && redirectOn401) {
    if (typeof window !== "undefined") {
      window.location.assign("/admin/login");
    }
    throw new AdminApiError(401, "Oturum süresi doldu.");
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw new AdminApiError(
      res.status,
      extractMessage(data) ?? `İstek başarısız oldu (${res.status}).`,
      data,
    );
  }

  return data as T;
}

// ─────────────────────── Genel CRUD yardımcıları ───────────────────────

/** GET /api/admin/<path> */
export function adminGet<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

/** POST /api/admin/<path> */
export function adminPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

/** PATCH /api/admin/<path> */
export function adminPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, body);
}

/** DELETE /api/admin/<path> */
export function adminDelete<T>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

// ─────────────────────────── Oturum ───────────────────────────

/**
 * Giriş — /api/admin/login (BFF). Hatalı kimlikte AdminApiError fırlatır,
 * login sayfasında yönlendirme DÖNGÜSÜ olmasın diye 401'de redirect etmez.
 */
export function adminLogin(email: string, password: string): Promise<{ ok: true }> {
  return request<{ ok: true }>("POST", "login", { email, password }, {
    redirectOn401: false,
  });
}

/** Çıkış — /api/admin/logout (BFF, cookie'leri siler). */
export function adminLogout(): Promise<{ ok: true }> {
  return request<{ ok: true }>("POST", "logout", undefined, {
    redirectOn401: false,
  });
}
