// Celine Gelinlik — API JSON şekilleri (NestJS backend sözleşmesi).
// Tüm tipler backend'in döndürdüğü alanlara birebir uyar.

export interface ImageAsset {
  id?: string;
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  order?: number;
}

export interface CollectionSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  order?: number;
}

// GET /collections/:slug — koleksiyon + içindeki modeller
export interface Collection extends CollectionSummary {
  dresses: DressListItem[];
}

// Bir koleksiyon detayında listelenen model (hafif)
export interface DressListItem {
  id: string;
  name: string;
  slug: string;
  fabric?: string | null;
  featured?: boolean;
  order?: number;
  images: ImageAsset[];
  collection?: { name: string; slug: string };
}

// GET /dresses — liste elemanı (koleksiyon bilgisi dahil)
export interface Dress {
  id: string;
  name: string;
  slug: string;
  fabric?: string | null;
  featured?: boolean;
  order?: number;
  collection?: { name: string; slug: string };
  images: ImageAsset[];
}

// GET /dresses/:slug — tam model detayı
export interface DressDetail extends Dress {
  related?: Array<{
    id: string;
    name: string;
    slug: string;
    images: ImageAsset[];
  }>;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DressSlug {
  slug: string;
}

// GET /site-settings
export interface SiteSettings {
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  address?: string | null;
  mapUrl?: string | null;
  about?: string | null;
  heroImage?: string | null;
  heroVideo?: string | null;
}

// GET /availability?date=YYYY-MM-DD
export interface AvailabilitySlot {
  start: string; // ISO datetime
  end: string; // ISO datetime
  available: boolean;
}

// POST /appointments — istek gövdesi
export interface AppointmentInput {
  name: string;
  phone: string;
  email?: string;
  preferredDate?: string; // YYYY-MM-DD
  startsAt?: string; // ISO datetime
  durationMin?: number;
  message?: string;
}

// POST /appointments — yanıt
export interface Appointment {
  id: string;
  status: string;
  startsAt?: string | null;
  createdAt: string;
}

// GET /dresses query parametreleri
export interface DressQuery {
  collection?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  dir?: "asc" | "desc";
}
