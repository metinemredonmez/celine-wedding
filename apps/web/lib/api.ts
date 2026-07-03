// Celine Gelinlik — sunucu tarafı API sarmalayıcı.
// Tüm fetch'ler server-side çalışır (Server Component / route handler).
// Hata durumunda site ÇÖKMEZ: boş dizi / null / güvenli varsayılan döner.

import type {
  AvailabilitySlot,
  Appointment,
  AppointmentInput,
  Collection,
  CollectionSummary,
  Dress,
  DressDetail,
  DressQuery,
  DressSlug,
  Paginated,
  SiteSettings,
} from "./types";

import { resolveContentMap } from "./content";
import { getLocale } from "./i18n";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ISR: veriyi 5 dk cache'le (couture showcase — sık değişmez).
const DEFAULT_REVALIDATE = 300;

type FetchOpts = {
  revalidate?: number | false;
  cache?: RequestCache;
  method?: string;
  body?: unknown;
};

/**
 * Merkezî fetch. Başarısızlıkta null döner (throw etmez) — sayfa fallback gösterir.
 */
async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  const { revalidate = DEFAULT_REVALIDATE, cache, method = "GET", body } = opts;

  const url = `${API_BASE}${path}`;

  const init: RequestInit & { next?: { revalidate?: number } } = {
    method,
    headers: { Accept: "application/json" },
  };

  if (body !== undefined) {
    init.method = method === "GET" ? "POST" : method;
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
    // Mutasyonlar cache'lenmez.
    init.cache = "no-store";
  } else if (cache) {
    init.cache = cache;
  } else if (revalidate !== false) {
    init.next = { revalidate };
  }

  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      console.error(`[api] ${method} ${path} → ${res.status}`);
      return null;
    }
    // 204/boş gövde güvenliği
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (err) {
    console.error(`[api] ${method} ${path} başarısız:`, err);
    return null;
  }
}

function toQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    sp.set(key, String(value));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ------------------------------------------------------------------ //
//  Koleksiyonlar                                                       //
// ------------------------------------------------------------------ //

/** GET /collections → CollectionSummary[] (hata: []) */
export async function getCollections(): Promise<CollectionSummary[]> {
  const data = await apiFetch<CollectionSummary[]>("/collections");
  return data ?? [];
}

/** GET /collections/:slug → Collection | null */
export async function getCollection(slug: string): Promise<Collection | null> {
  return apiFetch<Collection>(`/collections/${encodeURIComponent(slug)}`);
}

// ------------------------------------------------------------------ //
//  Modeller (gelinlikler)                                             //
// ------------------------------------------------------------------ //

/** GET /dresses?... → Paginated<Dress> (hata: boş sayfa) */
export async function getDresses(
  params: DressQuery = {},
): Promise<Paginated<Dress>> {
  const qs = toQuery({
    collection: params.collection,
    featured: params.featured,
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    dir: params.dir,
  });
  const data = await apiFetch<Paginated<Dress>>(`/dresses${qs}`);
  return (
    data ?? {
      data: [],
      meta: {
        total: 0,
        page: params.page ?? 1,
        limit: params.limit ?? 12,
        totalPages: 0,
      },
    }
  );
}

/** GET /dresses/slugs → DressSlug[] (SSG için; hata: []) */
export async function getDressSlugs(): Promise<DressSlug[]> {
  const data = await apiFetch<DressSlug[]>("/dresses/slugs");
  return data ?? [];
}

/** GET /dresses/:slug → DressDetail | null */
export async function getDress(slug: string): Promise<DressDetail | null> {
  return apiFetch<DressDetail>(`/dresses/${encodeURIComponent(slug)}`);
}

// ------------------------------------------------------------------ //
//  Site ayarları                                                      //
// ------------------------------------------------------------------ //

/** GET /site-settings → SiteSettings (hata: {}) */
export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await apiFetch<SiteSettings>("/site-settings");
  return data ?? {};
}

/**
 * Bir dil için çözülmüş içerik haritası.
 * TR: admin DB içeriği (+ TR varsayılan). Diğer diller: statik çeviri sözlüğü.
 * (Per-locale DB düzenlemesi sonra; şimdilik EN/AR/RU koddan gelir.)
 */
export async function getContent(): Promise<Record<string, string>> {
  const locale = await getLocale();
  const db =
    locale === "tr" ? (await apiFetch<Record<string, string>>("/content")) ?? {} : {};
  return resolveContentMap(locale, db);
}

// ------------------------------------------------------------------ //
//  Randevu / müsaitlik                                                //
// ------------------------------------------------------------------ //

/** GET /availability?date=YYYY-MM-DD → AvailabilitySlot[] (hata: []) */
export async function getAvailability(date: string): Promise<AvailabilitySlot[]> {
  const data = await apiFetch<AvailabilitySlot[]>(
    `/availability${toQuery({ date })}`,
    { revalidate: false, cache: "no-store" },
  );
  return data ?? [];
}

/**
 * POST /appointments → Appointment | null.
 * Başarısızsa null döner; çağıran taraf kullanıcıya hata gösterir.
 */
export async function createAppointment(
  input: AppointmentInput,
): Promise<Appointment | null> {
  return apiFetch<Appointment>("/appointments", {
    method: "POST",
    body: input,
  });
}
