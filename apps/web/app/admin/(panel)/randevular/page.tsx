"use client";

// Celine Admin — Randevular (gelen kutusu).
// Durum sekmeleri (Yeni/Arandı/Tamamlandı/İptal) + tarih filtresi (bu hafta/tümü).
// Satır: ad, telefon (tel:), tarih/slot, kısaltılmış mesaj. Satıra dokun →
// detay diyaloğu: durum değiştir (PATCH /appointments/:id), WhatsApp'tan yaz
// (wa.me + ön dolu Türkçe mesaj), ara. Yeni talepler vurgulu.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { AdminApiError, adminGet, adminPatch } from "@/lib/admin-api";
import {
  APPOINTMENT_STATUS_LABELS,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/admin-types";
import { Badge, Card, EmptyState, type BadgeTone } from "@/components/admin/ui";
import { ConfirmDialog, useToast } from "@/components/admin/ui-client";
import { Button } from "@/components/ui/Button";
import { cn, telLink, waLink } from "@/lib/utils";

// ─────────────────────────── Sabitler ───────────────────────────

const STATUS_ORDER: AppointmentStatus[] = [
  "NEW",
  "CONTACTED",
  "DONE",
  "CANCELLED",
];

/** Sekme etiketleri — kısa ve gündelik ("Arandı"); rozetlerde uzun hali kullanılır. */
const TAB_LABELS: Record<AppointmentStatus, string> = {
  NEW: "Yeni",
  CONTACTED: "Arandı",
  DONE: "Tamamlandı",
  CANCELLED: "İptal",
};

const STATUS_TONES: Record<AppointmentStatus, BadgeTone> = {
  NEW: "rose",
  CONTACTED: "warning",
  DONE: "success",
  CANCELLED: "neutral",
};

const EMPTY_COPY: Record<AppointmentStatus, { title: string; description: string }> = {
  NEW: {
    title: "Yeni talep yok",
    description: "Siteden gelen randevu talepleri burada görünür.",
  },
  CONTACTED: {
    title: "Aranmış talep yok",
    description: "Bir talebi aradığınızda durumunu buradan güncelleyin.",
  },
  DONE: {
    title: "Tamamlanmış randevu yok",
    description: "Gerçekleşen randevuları Tamamlandı olarak işaretleyin.",
  },
  CANCELLED: {
    title: "İptal edilmiş randevu yok",
    description: "İptal ettiğiniz talepler burada listelenir.",
  },
};

type DateFilter = "week" | "all";

// ─────────────────────────── Tarih yardımcıları ───────────────────────────

/** Pazartesi 00:00 → gelecek pazartesi 00:00 (yerel saat). */
function thisWeekRange(): [Date, Date] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return [start, end];
}

/** Filtre/sıralamada esas alınan tarih: slot > tercih edilen gün > talep anı. */
function relevantDate(a: Appointment): Date {
  return new Date(a.startsAt ?? a.preferredDate ?? a.createdAt);
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

/** Satır için kısa tarih/slot: "5 Tem Cmt · 14:00" | "5 Tem (tercih)" | "Tarih yok". */
function formatRowDate(a: Appointment): string {
  if (a.startsAt) {
    const d = new Date(a.startsAt);
    const day = d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      weekday: "short",
    });
    return `${day} · ${formatTime(d)}`;
  }
  if (a.preferredDate) {
    const day = new Date(a.preferredDate).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
    return `${day} (tercih)`;
  }
  return "Tarih yok";
}

/** Detay için uzun slot: "5 Temmuz 2026 Cumartesi · 14:00–15:00". */
function formatSlotLong(a: Appointment): string | null {
  if (!a.startsAt) return null;
  const start = new Date(a.startsAt);
  const day = start.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  if (a.durationMin) {
    const end = new Date(start.getTime() + a.durationMin * 60_000);
    return `${day} · ${formatTime(start)}–${formatTime(end)}`;
  }
  return `${day} · ${formatTime(start)}`;
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─────────────────────────── WhatsApp ───────────────────────────

/** "0532 123 45 67" → "905321234567" (wa.me ülke kodu ister). */
function waPhone(phone: string): string | null {
  let d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("5")) d = `90${d}`;
  else if (d.length === 11 && d.startsWith("0")) d = `9${d}`;
  return d;
}

/** Ön dolu Türkçe mesaj — slot varsa tarih/saatiyle birlikte. */
function waMessage(a: Appointment): string {
  const first = a.name.trim().split(/\s+/)[0] || a.name;
  if (a.startsAt) {
    const d = new Date(a.startsAt);
    const day = d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      weekday: "long",
    });
    return (
      `Merhaba ${first}, Celine Gelinlik'ten yazıyoruz. ` +
      `${day} saat ${formatTime(d)} için randevu talebinizi aldık. ` +
      `Detayları birlikte netleştirmek isteriz.`
    );
  }
  return (
    `Merhaba ${first}, Celine Gelinlik'ten yazıyoruz. ` +
    `Randevu talebinizi aldık. Size en uygun gün ve saati birlikte planlayalım mı?`
  );
}

// ─────────────────────────── Sayfa ───────────────────────────

export default function AdminAppointmentsPage() {
  const toast = useToast();

  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<AppointmentStatus>("NEW");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setError(null);
    adminGet<Appointment[]>("appointments")
      .then(setAppointments)
      .catch(() => setError("Randevular yüklenemedi. Sayfayı yenileyin."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Tarih filtresi → sekme sayıları da bu alt kümeden hesaplanır.
  const dateFiltered = useMemo(() => {
    const list = appointments ?? [];
    if (dateFilter === "all") return list;
    const [start, end] = thisWeekRange();
    return list.filter((a) => {
      const d = relevantDate(a);
      return d >= start && d < end;
    });
  }, [appointments, dateFilter]);

  const counts = useMemo(() => {
    const c: Record<AppointmentStatus, number> = {
      NEW: 0,
      CONTACTED: 0,
      DONE: 0,
      CANCELLED: 0,
    };
    for (const a of dateFiltered) c[a.status] += 1;
    return c;
  }, [dateFiltered]);

  // Gelen kutusu: en yeni talep en üstte.
  const rows = useMemo(
    () =>
      dateFiltered
        .filter((a) => a.status === tab)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [dateFiltered, tab],
  );

  const selected = useMemo(
    () => (appointments ?? []).find((a) => a.id === selectedId) ?? null,
    [appointments, selectedId],
  );

  const patchStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      setSaving(true);
      try {
        const updated = await adminPatch<Appointment>(`appointments/${id}`, {
          status,
        });
        setAppointments((prev) =>
          (prev ?? []).map((a) => (a.id === id ? { ...a, ...updated } : a)),
        );
        toast.show(`Durum güncellendi: ${APPOINTMENT_STATUS_LABELS[status]}`);
      } catch (err) {
        toast.show(
          err instanceof AdminApiError ? err.message : "Durum güncellenemedi.",
          "error",
        );
      } finally {
        setSaving(false);
      }
    },
    [toast],
  );

  const handleSelectStatus = useCallback(
    (status: AppointmentStatus) => {
      if (!selected || saving || status === selected.status) return;
      if (status === "CANCELLED") {
        setConfirmCancel(true);
        return;
      }
      void patchStatus(selected.id, status);
    },
    [selected, saving, patchStatus],
  );

  const loading = appointments === null && !error;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="font-display text-3xl">Randevular</h1>
        <p className="mt-1 text-sm text-muted">
          Gelen talepleri inceleyin, arayın ve durumlarını güncelleyin.
        </p>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2px] bg-[#f4dcdc] px-4 py-3">
          <p className="text-sm text-[#8c3232]">{error}</p>
          <Button variant="outline" size="sm" onClick={load}>
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* Sekmeler + tarih filtresi */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
          {STATUS_ORDER.map((s) => {
            const active = tab === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setTab(s)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-[2px] border px-4",
                  "text-[0.68rem] font-medium uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/15 bg-cream text-muted hover:border-ink/40 hover:text-ink",
                )}
              >
                {TAB_LABELS[s]}
                <span
                  className={cn(
                    "tabular-nums",
                    active
                      ? "text-cream/70"
                      : s === "NEW" && counts.NEW > 0
                        ? "text-rose"
                        : "text-faint",
                  )}
                >
                  {loading ? "…" : counts[s]}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="inline-flex shrink-0 rounded-[2px] border border-ink/15 bg-cream p-0.5"
          role="group"
          aria-label="Tarih filtresi"
        >
          {(
            [
              ["week", "Bu Hafta"],
              ["all", "Tümü"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDateFilter(value)}
              aria-pressed={dateFilter === value}
              className={cn(
                "h-9 rounded-[2px] px-3.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] transition-colors",
                dateFilter === value
                  ? "bg-ink text-cream"
                  : "text-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <Card flush>
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted">
            Yükleniyor…
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={EMPTY_COPY[tab].title}
            description={
              dateFilter === "week"
                ? "Bu hafta için kayıt bulunamadı. Tüm kayıtlar için filtreyi “Tümü” yapın."
                : EMPTY_COPY[tab].description
            }
          />
        ) : (
          <ul className="divide-y divide-ink/5">
            {rows.map((a) => {
              const isNew = a.status === "NEW";
              const tel = telLink(a.phone);
              return (
                <li
                  key={a.id}
                  className={cn("relative", isNew && "bg-rose-soft/15")}
                >
                  {/* Yeni talep vurgusu: sol ince şerit */}
                  {isNew && (
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-0.5 bg-rose"
                    />
                  )}
                  <div className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className="block w-full text-left"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate font-medium text-ink">
                          {a.name}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted">
                          {formatRowDate(a)}
                        </span>
                      </span>
                      {a.message && (
                        <span className="mt-1 block truncate text-sm text-muted">
                          {a.message}
                        </span>
                      )}
                    </button>
                    <div className="mt-1.5 flex items-center gap-2">
                      {tel ? (
                        <a
                          href={tel}
                          className="inline-flex min-h-6 items-center text-sm text-muted underline-offset-2 hover:text-ink hover:underline"
                        >
                          {a.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-muted">{a.phone}</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Detay diyaloğu */}
      {selected && (
        <AppointmentDetail
          appointment={selected}
          saving={saving}
          onSelectStatus={handleSelectStatus}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* İptal onayı */}
      <ConfirmDialog
        open={confirmCancel && selected !== null}
        title="Randevu iptal edilsin mi?"
        description={
          selected
            ? `${selected.name} adlı talebi İptal olarak işaretlemek üzeresiniz. Takvimdeki saati boşa çıkar.`
            : undefined
        }
        confirmLabel="İptal Et"
        cancelLabel="Vazgeç"
        danger
        busy={saving}
        onConfirm={async () => {
          if (selected) await patchStatus(selected.id, "CANCELLED");
          setConfirmCancel(false);
        }}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}

// ─────────────────────────── Detay diyaloğu ───────────────────────────

type DetailProps = {
  appointment: Appointment;
  saving: boolean;
  onSelectStatus: (status: AppointmentStatus) => void;
  onClose: () => void;
};

function AppointmentDetail({
  appointment: a,
  saving,
  onSelectStatus,
  onClose,
}: DetailProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tel = telLink(a.phone);
  const wa = waPhone(a.phone);
  const slot = formatSlotLong(a);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Randevu detayı: ${a.name}`}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[2px] border border-ink/10 bg-cream">
        {/* Başlık */}
        <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-ink/10 bg-cream px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl">{a.name}</h3>
            <div className="mt-1.5">
              <Badge tone={STATUS_TONES[a.status]}>
                {APPOINTMENT_STATUS_LABELS[a.status]}
              </Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center text-muted transition-colors hover:text-ink"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="space-y-5 px-5 py-5">
          {/* İletişim + tarih bilgileri */}
          <dl className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Phone size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-faint" aria-hidden />
              <div>
                <dt className="sr-only">Telefon</dt>
                <dd>
                  {tel ? (
                    <a
                      href={tel}
                      className="text-ink underline-offset-2 hover:underline"
                    >
                      {a.phone}
                    </a>
                  ) : (
                    a.phone
                  )}
                </dd>
              </div>
            </div>

            {a.email && (
              <div className="flex items-start gap-3">
                <Mail size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-faint" aria-hidden />
                <div>
                  <dt className="sr-only">E-posta</dt>
                  <dd>
                    <a
                      href={`mailto:${a.email}`}
                      className="text-ink underline-offset-2 hover:underline"
                    >
                      {a.email}
                    </a>
                  </dd>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CalendarDays size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-faint" aria-hidden />
              <div>
                <dt className="sr-only">Randevu tarihi</dt>
                <dd>
                  {slot ? (
                    <span className="text-ink">{slot}</span>
                  ) : a.preferredDate ? (
                    <span className="text-ink">
                      {formatDateLong(a.preferredDate)}{" "}
                      <span className="text-muted">(tercih edilen gün)</span>
                    </span>
                  ) : (
                    <span className="text-muted">Tarih belirtilmemiş</span>
                  )}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock3 size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-faint" aria-hidden />
              <div>
                <dt className="sr-only">Talep tarihi</dt>
                <dd className="text-muted">
                  Talep: {formatDateLong(a.createdAt)} ·{" "}
                  {formatTime(new Date(a.createdAt))}
                </dd>
              </div>
            </div>
          </dl>

          {/* Mesaj */}
          {a.message && (
            <div>
              <p className="u-label mb-2 text-faint">Mesaj</p>
              <p className="whitespace-pre-wrap rounded-[2px] bg-white px-4 py-3 text-sm leading-relaxed text-ink">
                {a.message}
              </p>
            </div>
          )}

          {/* Hızlı eylemler */}
          <div className="grid grid-cols-2 gap-2">
            {wa ? (
              <a
                href={waLink(wa, waMessage(a))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[2px] bg-ink text-[0.68rem] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:bg-[#3a352f]"
              >
                <MessageCircle size={15} strokeWidth={1.5} aria-hidden />
                WhatsApp&rsquo;tan Yaz
              </a>
            ) : (
              <span className="inline-flex h-11 items-center justify-center rounded-[2px] border border-ink/10 text-[0.68rem] uppercase tracking-[0.18em] text-faint">
                WhatsApp yok
              </span>
            )}
            {tel ? (
              <a
                href={tel}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[2px] border border-rose bg-transparent text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
              >
                <Phone size={15} strokeWidth={1.5} aria-hidden />
                Ara
              </a>
            ) : (
              <span className="inline-flex h-11 items-center justify-center rounded-[2px] border border-ink/10 text-[0.68rem] uppercase tracking-[0.18em] text-faint">
                Numara geçersiz
              </span>
            )}
          </div>

          {/* Durum değiştir */}
          <div>
            <p className="u-label mb-2 text-faint">Durum</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_ORDER.map((s) => {
                const current = s === a.status;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={saving || current}
                    aria-pressed={current}
                    onClick={() => onSelectStatus(s)}
                    className={cn(
                      "h-11 rounded-[2px] border text-sm transition-colors",
                      "disabled:pointer-events-none",
                      current
                        ? "border-ink bg-ink text-cream"
                        : "border-ink/15 bg-white text-ink hover:border-ink disabled:opacity-50",
                    )}
                  >
                    {TAB_LABELS[s]}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">
              {saving
                ? "Kaydediliyor…"
                : "Dokunduğunuz durum hemen kaydedilir."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
