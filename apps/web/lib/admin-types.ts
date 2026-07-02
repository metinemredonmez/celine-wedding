// Celine Admin — API JSON şekilleri (NestJS admin uçları sözleşmesi).
// Kaynak: apps/api/src altındaki controller/service select'leri + Prisma şeması.

// ─────────────────────────── Ortak ───────────────────────────

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type DressStatus = "DRAFT" | "PUBLISHED";
export type AppointmentStatus = "NEW" | "CONTACTED" | "DONE" | "CANCELLED";

// ─────────────────────────── Gelinlikler ───────────────────────────

export interface AdminImage {
  id: string;
  url: string;
  publicId: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  order: number;
}

/** GET /dresses/admin/all elemanı ve GET /dresses/admin/:id yanıtı. */
export interface AdminDress {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Prisma Decimal → JSON'da string gelir. */
  price: string | null;
  fabric: string | null;
  details: string | null;
  status: DressStatus;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  collectionId: string | null;
  collection: { id: string; name: string; slug: string } | null;
  images: AdminImage[];
}

/** POST /dresses ve PATCH /dresses/:id gövdesi. */
export interface DressInput {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  fabric?: string;
  details?: string;
  status?: DressStatus;
  featured?: boolean;
  order?: number;
  collectionId?: string | null;
}

/** POST /dresses/:id/images gövdesi (Cloudinary upload yanıtından). */
export interface AddImageInput {
  url: string;
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
}

// ─────────────────────────── Koleksiyonlar ───────────────────────────

/** GET /collections/admin/all elemanı — model sayısı dahil. */
export interface AdminCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count: { dresses: number };
}

/** POST /collections ve PATCH /collections/:id gövdesi. */
export interface CollectionInput {
  name?: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  order?: number;
}

// ─────────────────────────── Randevular ───────────────────────────

/** GET /appointments elemanı (tam Prisma modeli). */
export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  preferredDate: string | null;
  startsAt: string | null;
  durationMin: number | null;
  message: string | null;
  status: AppointmentStatus;
  createdAt: string;
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  NEW: "Yeni",
  CONTACTED: "İletişime geçildi",
  DONE: "Tamamlandı",
  CANCELLED: "İptal",
};

export const DRESS_STATUS_LABELS: Record<DressStatus, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
};

// ─────────────────────────── Takvim / müsaitlik ───────────────────────────

/** GET /availability/rules elemanı. */
export interface AvailabilityRule {
  id: string;
  weekday: number; // 0 = Pazar … 6 = Cumartesi
  startMinutes: number; // gün başından dakika (600 = 10:00)
  endMinutes: number;
  slotMinutes: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** POST /availability/rules gövdesi (PATCH için Partial). */
export interface AvailabilityRuleInput {
  weekday: number;
  startMinutes: number;
  endMinutes: number;
  slotMinutes?: number;
  active?: boolean;
}

/** GET /availability/blocked elemanı. */
export interface BlockedDate {
  id: string;
  date: string; // ISO datetime
  reason: string | null;
  createdAt: string;
}

/** POST /availability/blocked gövdesi. */
export interface BlockedDateInput {
  date: string; // YYYY-MM-DD
  reason?: string;
}

// ─────────────────────────── Site ayarları ───────────────────────────

/** GET /site-settings ve PATCH /site-settings yanıtı (singleton). */
export interface SiteSettings {
  id?: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  address: string | null;
  mapUrl: string | null;
  about: string | null;
  heroImage: string | null;
  heroVideo: string | null;
  updatedAt?: string;
}

/** PATCH /site-settings gövdesi. */
export interface SiteSettingsInput {
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
  mapUrl?: string;
  about?: string;
  heroImage?: string;
  heroVideo?: string;
}

// ─────────────────────────── Medya ───────────────────────────

/** POST /media/sign yanıtı — Cloudinary imzalı direkt upload parametreleri. */
export interface SignedUpload {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}
