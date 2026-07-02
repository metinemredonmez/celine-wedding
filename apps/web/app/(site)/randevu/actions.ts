"use server";

// Randevu sayfası için sunucu eylemleri (Server Actions).
// Form bir client bileşeni; API çağrıları server-only apiFetch üzerinden
// buradan yapılır. Böylece NEXT_PUBLIC_API_URL fetch'i sunucuda çalışır,
// hatalar sunucuda loglanır ve istemci paketine sızmaz.

import { createAppointment, getAvailability } from "@/lib/api";
import type {
  Appointment,
  AppointmentInput,
  AvailabilitySlot,
} from "@/lib/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Seçilen gün (YYYY-MM-DD) için uygun slot'ları döner. Hata/boşta []. */
export async function fetchAvailabilityAction(
  date: string,
): Promise<AvailabilitySlot[]> {
  if (!date || !DATE_RE.test(date)) return [];
  return getAvailability(date);
}

export type AppointmentResult =
  | { ok: true; appointment: Appointment }
  | { ok: false };

/** Randevu talebi oluşturur. Başarısızsa { ok:false }. */
export async function createAppointmentAction(
  input: AppointmentInput,
): Promise<AppointmentResult> {
  const appointment = await createAppointment(input);
  if (!appointment) return { ok: false };
  return { ok: true, appointment };
}
