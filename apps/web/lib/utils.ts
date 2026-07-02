import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind sınıflarını çakışmasız birleştirir. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * WhatsApp derin bağlantısı üretir.
 * @param phone uluslararası numara (+ / boşluk temizlenir)
 * @param text  ön-doldurulmuş mesaj
 */
export function waLink(phone?: string | null, text?: string): string {
  const digits = (phone ?? "").replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** Instagram kullanıcı adını veya tam URL'yi normalize eder. */
export function instagramLink(handle?: string | null): string | null {
  if (!handle) return null;
  const trimmed = handle.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http")) return trimmed;
  return `https://instagram.com/${trimmed.replace(/^@/, "")}`;
}

/** Telefon numarasını tel: bağlantısına çevirir. */
export function telLink(phone?: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}
