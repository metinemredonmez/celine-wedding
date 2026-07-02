"use client";

// Celine Admin — Panel (dashboard): bugünkü randevular, yeni talep sayısı,
// hızlı linkler. Veri: BFF proxy üzerinden GET /api/admin/appointments.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  CalendarDays,
  FolderOpen,
  Settings,
  Sparkles,
} from "lucide-react";
import { adminGet } from "@/lib/admin-api";
import {
  APPOINTMENT_STATUS_LABELS,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/admin-types";
import { Badge, Card, EmptyState, type BadgeTone } from "@/components/admin/ui";
import { telLink } from "@/lib/utils";

const STATUS_TONES: Record<AppointmentStatus, BadgeTone> = {
  NEW: "rose",
  CONTACTED: "warning",
  DONE: "success",
  CANCELLED: "neutral",
};

const QUICK_LINKS = [
  { label: "Gelinlikler", href: "/admin/gelinlikler", icon: Sparkles, hint: "Model ekle, düzenle" },
  { label: "Koleksiyonlar", href: "/admin/koleksiyonlar", icon: FolderOpen, hint: "Koleksiyonları yönet" },
  { label: "Randevular", href: "/admin/randevular", icon: CalendarCheck2, hint: "Talepleri incele" },
  { label: "Takvim", href: "/admin/takvim", icon: CalendarDays, hint: "Müsaitlik ve kapalı günler" },
  { label: "Ayarlar", href: "/admin/ayarlar", icon: Settings, hint: "İletişim ve site bilgileri" },
] as const;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTodayLong(): string {
  return new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminGet<Appointment[]>("appointments")
      .then((data) => {
        if (!cancelled) setAppointments(data);
      })
      .catch(() => {
        if (!cancelled) setError("Randevular yüklenemedi. Sayfayı yenileyin.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { todays, newCount } = useMemo(() => {
    const list = appointments ?? [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const todays = list
      .filter((a) => {
        if (!a.startsAt || a.status === "CANCELLED") return false;
        const t = new Date(a.startsAt);
        return t >= start && t < end;
      })
      .sort(
        (a, b) =>
          new Date(a.startsAt as string).getTime() -
          new Date(b.startsAt as string).getTime(),
      );

    const newCount = list.filter((a) => a.status === "NEW").length;
    return { todays, newCount };
  }, [appointments]);

  const loading = appointments === null && !error;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="font-display text-3xl">Panel</h1>
        <p className="mt-1 text-sm capitalize text-muted">{formatTodayLong()}</p>
      </div>

      {error && (
        <p className="rounded-[2px] bg-[#f4dcdc] px-4 py-3 text-sm text-[#8c3232]">
          {error}
        </p>
      )}

      {/* Özet kartları */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="u-label text-faint">Bugünkü Randevu</p>
          <p className="mt-2 font-display text-4xl">
            {loading ? "—" : todays.length}
          </p>
        </Card>
        <Link href="/admin/randevular" className="block">
          <Card className="h-full transition-colors hover:border-rose">
            <p className="u-label text-faint">Yeni Talep</p>
            <p className="mt-2 font-display text-4xl">
              {loading ? "—" : newCount}
            </p>
            {!loading && newCount > 0 && (
              <p className="mt-1 text-xs text-rose">İncelemek için dokunun</p>
            )}
          </Card>
        </Link>
      </div>

      {/* Bugünkü randevular */}
      <Card title="Bugünkü Randevular" flush>
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted">
            Yükleniyor…
          </div>
        ) : todays.length === 0 ? (
          <EmptyState
            title="Bugün için planlanmış randevu yok"
            description="Yeni talepler geldiğinde burada ve Randevular sayfasında görünür."
          />
        ) : (
          <ul className="divide-y divide-ink/5">
            {todays.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4"
              >
                <span className="w-14 font-display text-lg tabular-nums">
                  {formatTime(a.startsAt as string)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{a.name}</span>
                  {telLink(a.phone) ? (
                    <a
                      href={telLink(a.phone) as string}
                      className="text-sm text-muted underline-offset-2 hover:underline"
                    >
                      {a.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-muted">{a.phone}</span>
                  )}
                </span>
                <Badge tone={STATUS_TONES[a.status]}>
                  {APPOINTMENT_STATUS_LABELS[a.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Hızlı linkler */}
      <div>
        <p className="u-label mb-3 text-faint">Hızlı Erişim</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_LINKS.map(({ label, href, icon: Icon, hint }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-[2px] border border-ink/10 bg-cream p-4 transition-colors hover:border-rose"
            >
              <Icon
                size={20}
                strokeWidth={1.5}
                className="text-faint transition-colors group-hover:text-rose"
                aria-hidden
              />
              <p className="mt-3 text-sm font-medium">{label}</p>
              <p className="mt-0.5 text-xs text-muted">{hint}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
