"use client";

// Celine Admin — Takvim: haftalık çalışma saatleri (müsaitlik kuralları)
// ve kapalı günler. Veri: BFF proxy üzerinden /api/admin/availability/*.
//
// Model: her hafta günü için EN FAZLA bir "birincil" kural gösterilir
// (API'de aynı güne birden çok kural olabilir; kapatırken hepsi pasife
// çekilir ki gizli kural slot üretmeye devam etmesin).

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import {
  AdminApiError,
  adminDelete,
  adminGet,
  adminPatch,
  adminPost,
} from "@/lib/admin-api";
import type {
  AvailabilityRule,
  BlockedDate,
} from "@/lib/admin-types";
import { Button } from "@/components/ui/Button";
import {
  Badge,
  Card,
  EmptyState,
  Field,
  Input,
  Select,
} from "@/components/admin/ui";
import { ConfirmDialog, Toggle, useToast } from "@/components/admin/ui-client";
import { cn } from "@/lib/utils";

// ─────────────────────── Dakika ↔ "10:00" çevrimi ───────────────────────

/** Gün başından dakika → time input değeri. 600 → "10:00" */
function minutesToTime(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** time input değeri → gün başından dakika. "10:00" → 600; geçersizse null. */
function timeToMinutes(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const minutes = Number(m[1]) * 60 + Number(m[2]);
  return minutes >= 0 && minutes < 24 * 60 ? minutes : null;
}

// ─────────────────────── Sabitler / yardımcılar ───────────────────────

// API sözleşmesi: weekday 0 = Pazar … 6 = Cumartesi. Görünüm: Pzt → Paz.
const WEEKDAYS: ReadonlyArray<{ weekday: number; label: string }> = [
  { weekday: 1, label: "Pazartesi" },
  { weekday: 2, label: "Salı" },
  { weekday: 3, label: "Çarşamba" },
  { weekday: 4, label: "Perşembe" },
  { weekday: 5, label: "Cuma" },
  { weekday: 6, label: "Cumartesi" },
  { weekday: 0, label: "Pazar" },
];

const SLOT_OPTIONS = [30, 45, 60, 90] as const;
const DEFAULT_START = "10:00";
const DEFAULT_END = "19:00";
const DEFAULT_SLOT = 60;

// Türkiye sabit UTC+3 — kapalı gün tarihleri İstanbul gününe göre gösterilir.
const IST_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Bir anın İstanbul takvimindeki YYYY-MM-DD karşılığı. */
function istanbulDateString(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function formatBlockedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function errorMessage(err: unknown): string {
  if (err instanceof AdminApiError) return err.message;
  return "Bir hata oluştu. Lütfen tekrar deneyin.";
}

/** Saat aralığını doğrular; hatasızsa dakikaları döndürür. */
function validateWindow(
  start: string,
  end: string,
  slot: number,
):
  | { ok: true; startMinutes: number; endMinutes: number }
  | { ok: false; error: string } {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes === null || endMinutes === null) {
    return { ok: false, error: "Geçerli bir saat girin (örn. 10:00)." };
  }
  if (endMinutes <= startMinutes) {
    return { ok: false, error: "Bitiş saati başlangıçtan sonra olmalı." };
  }
  if (endMinutes - startMinutes < slot) {
    return {
      ok: false,
      error: `Aralık en az bir slot süresi (${slot} dk) kadar olmalı.`,
    };
  }
  return { ok: true, startMinutes, endMinutes };
}

// ─────────────────────── Gün satırı durumu ───────────────────────

type DayState = {
  label: string;
  /** birincil kural (varsa) — saat/slot düzenlemeleri buna yazılır */
  ruleId: string | null;
  /** o güne ait TÜM kural id'leri (kapatırken hepsi pasife çekilir) */
  allRuleIds: string[];
  active: boolean;
  start: string; // "10:00"
  end: string; // "19:00"
  slot: number;
  dirty: boolean;
  saving: boolean;
  error: string | null;
};

function buildDays(rules: AvailabilityRule[]): Record<number, DayState> {
  const out: Record<number, DayState> = {};
  for (const { weekday, label } of WEEKDAYS) {
    const dayRules = rules
      .filter((r) => r.weekday === weekday)
      .sort((a, b) => a.startMinutes - b.startMinutes);
    const primary = dayRules.find((r) => r.active) ?? dayRules[0] ?? null;
    out[weekday] = {
      label,
      ruleId: primary?.id ?? null,
      allRuleIds: dayRules.map((r) => r.id),
      active: dayRules.some((r) => r.active),
      start: primary ? minutesToTime(primary.startMinutes) : DEFAULT_START,
      end: primary ? minutesToTime(primary.endMinutes) : DEFAULT_END,
      slot: primary?.slotMinutes ?? DEFAULT_SLOT,
      dirty: false,
      saving: false,
      error: null,
    };
  }
  return out;
}

// ─────────────────────────── Sayfa ───────────────────────────

export default function AdminTakvimPage() {
  const toast = useToast();

  const [days, setDays] = useState<Record<number, DayState> | null>(null);
  const [blocked, setBlocked] = useState<BlockedDate[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Kapalı gün formu
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [addingBlocked, setAddingBlocked] = useState(false);

  // Silme onayı
  const [pendingDelete, setPendingDelete] = useState<BlockedDate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const todayIst = useMemo(() => istanbulDateString(new Date()), []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminGet<AvailabilityRule[]>("availability/rules"),
      adminGet<BlockedDate[]>("availability/blocked"),
    ])
      .then(([rules, blockedDates]) => {
        if (cancelled) return;
        setDays(buildDays(rules));
        setBlocked(blockedDates);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Takvim bilgileri yüklenemedi. Sayfayı yenileyin.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = (days === null || blocked === null) && !loadError;

  function patchDay(weekday: number, patch: Partial<DayState>) {
    setDays((prev) =>
      prev ? { ...prev, [weekday]: { ...prev[weekday], ...patch } } : prev,
    );
  }

  // ─────────────── Haftalık kurallar: toggle + kaydet ───────────────

  async function handleToggle(weekday: number, next: boolean) {
    if (!days) return;
    const day = days[weekday];
    patchDay(weekday, { saving: true, error: null });

    try {
      if (next) {
        if (day.ruleId) {
          await adminPatch<AvailabilityRule>(
            `availability/rules/${day.ruleId}`,
            { active: true },
          );
          patchDay(weekday, { active: true, saving: false });
        } else {
          const v = validateWindow(day.start, day.end, day.slot);
          if (!v.ok) {
            patchDay(weekday, { saving: false, error: v.error });
            return;
          }
          const created = await adminPost<AvailabilityRule>(
            "availability/rules",
            {
              weekday,
              startMinutes: v.startMinutes,
              endMinutes: v.endMinutes,
              slotMinutes: day.slot,
              active: true,
            },
          );
          patchDay(weekday, {
            active: true,
            ruleId: created.id,
            allRuleIds: [created.id],
            saving: false,
          });
        }
        toast.show(`${day.label} randevuya açıldı.`);
      } else {
        // Aynı güne ait tüm kuralları pasife çek (gizli kural kalmasın).
        await Promise.all(
          day.allRuleIds.map((id) =>
            adminPatch<AvailabilityRule>(`availability/rules/${id}`, {
              active: false,
            }),
          ),
        );
        patchDay(weekday, { active: false, saving: false });
        toast.show(`${day.label} kapatıldı.`);
      }
    } catch (err) {
      patchDay(weekday, { saving: false });
      toast.show(errorMessage(err), "error");
    }
  }

  async function handleSaveDay(weekday: number) {
    if (!days) return;
    const day = days[weekday];
    const v = validateWindow(day.start, day.end, day.slot);
    if (!v.ok) {
      patchDay(weekday, { error: v.error });
      return;
    }
    patchDay(weekday, { saving: true, error: null });

    try {
      if (day.ruleId) {
        await adminPatch<AvailabilityRule>(`availability/rules/${day.ruleId}`, {
          startMinutes: v.startMinutes,
          endMinutes: v.endMinutes,
          slotMinutes: day.slot,
        });
      } else {
        const created = await adminPost<AvailabilityRule>(
          "availability/rules",
          {
            weekday,
            startMinutes: v.startMinutes,
            endMinutes: v.endMinutes,
            slotMinutes: day.slot,
            active: day.active,
          },
        );
        patchDay(weekday, { ruleId: created.id, allRuleIds: [created.id] });
      }
      patchDay(weekday, { dirty: false, saving: false });
      toast.show(`${day.label} çalışma saatleri kaydedildi.`);
    } catch (err) {
      patchDay(weekday, { saving: false });
      toast.show(errorMessage(err), "error");
    }
  }

  // ─────────────── Kapalı günler: ekle + sil ───────────────

  async function handleAddBlocked(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newDate || addingBlocked) return;

    const exists = (blocked ?? []).some(
      (b) => istanbulDateString(new Date(b.date)) === newDate,
    );
    if (exists) {
      toast.show("Bu gün zaten kapalı olarak işaretli.", "error");
      return;
    }

    setAddingBlocked(true);
    try {
      const created = await adminPost<BlockedDate>("availability/blocked", {
        date: newDate,
        ...(newReason.trim() ? { reason: newReason.trim() } : {}),
      });
      setBlocked((prev) =>
        [...(prev ?? []), created].sort((a, b) => a.date.localeCompare(b.date)),
      );
      setNewDate("");
      setNewReason("");
      toast.show("Gün kapatıldı. O güne randevu alınmayacak.");
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setAddingBlocked(false);
    }
  }

  async function handleDeleteBlocked() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDelete<{ id: string; deleted: boolean }>(
        `availability/blocked/${pendingDelete.id}`,
      );
      setBlocked((prev) =>
        (prev ?? []).filter((b) => b.id !== pendingDelete.id),
      );
      setPendingDelete(null);
      toast.show("Kapalı gün kaldırıldı. Gün yeniden randevuya açık.");
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  }

  // ─────────────────────────── Görünüm ───────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Takvim</h1>
        <p className="mt-1 text-sm text-muted">
          Haftalık çalışma saatleri ve kapalı günler — randevu saatleri bu
          ayarlara göre oluşur.
        </p>
      </div>

      {loadError && (
        <p className="rounded-[2px] bg-[#f4dcdc] px-4 py-3 text-sm text-[#8c3232]">
          {loadError}
        </p>
      )}

      {/* ─────────────── Haftalık çalışma saatleri ─────────────── */}
      <Card
        title="Haftalık Çalışma Saatleri"
        subtitle="Açık günlerde seçtiğiniz aralık, slot süresine bölünerek randevu saatlerini oluşturur."
        flush
      >
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted">
            Yükleniyor…
          </div>
        ) : days ? (
          <ul className="divide-y divide-ink/5">
            {WEEKDAYS.map(({ weekday }) => {
              const d = days[weekday];
              return (
                <li key={weekday} className="px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    {/* Gün + aç/kapa */}
                    <div className="flex items-center justify-between gap-3 lg:w-48 lg:justify-start">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          !d.active && "text-muted",
                        )}
                      >
                        {d.label}
                      </span>
                      <Toggle
                        checked={d.active}
                        disabled={d.saving}
                        onChange={(next) => handleToggle(weekday, next)}
                        label={`${d.label} randevuya ${d.active ? "açık" : "kapalı"}`}
                      />
                    </div>

                    {d.active ? (
                      <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-3">
                        <Input
                          type="time"
                          value={d.start}
                          disabled={d.saving}
                          aria-label={`${d.label} başlangıç saati`}
                          onChange={(e) =>
                            patchDay(weekday, {
                              start: e.target.value,
                              dirty: true,
                              error: null,
                            })
                          }
                          className="w-[6.75rem] tabular-nums"
                        />
                        <span aria-hidden className="text-faint">
                          –
                        </span>
                        <Input
                          type="time"
                          value={d.end}
                          disabled={d.saving}
                          aria-label={`${d.label} bitiş saati`}
                          onChange={(e) =>
                            patchDay(weekday, {
                              end: e.target.value,
                              dirty: true,
                              error: null,
                            })
                          }
                          className="w-[6.75rem] tabular-nums"
                        />
                        <Select
                          value={d.slot}
                          disabled={d.saving}
                          aria-label={`${d.label} randevu süresi`}
                          onChange={(e) =>
                            patchDay(weekday, {
                              slot: Number(e.target.value),
                              dirty: true,
                              error: null,
                            })
                          }
                          className="w-40"
                        >
                          {SLOT_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s} dk randevu
                            </option>
                          ))}
                        </Select>
                        {d.dirty && (
                          <Button
                            size="sm"
                            disabled={d.saving}
                            onClick={() => handleSaveDay(weekday)}
                          >
                            {d.saving ? "Kaydediliyor…" : "Kaydet"}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted lg:flex-1">
                        Kapalı — bu gün için randevu alınmaz.
                      </p>
                    )}
                  </div>
                  {d.error && (
                    <p className="mt-2 text-xs text-[#a33a3a]">{d.error}</p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </Card>

      {/* ─────────────── Kapalı günler ─────────────── */}
      <Card
        title="Kapalı Günler"
        subtitle="Tatil, özel gün veya izin — işaretlenen günde hiçbir randevu saati açılmaz."
      >
        <form
          onSubmit={handleAddBlocked}
          className="grid gap-4 sm:grid-cols-[11rem_minmax(0,1fr)_auto] sm:items-end"
        >
          <Field label="Tarih" htmlFor="blocked-date" required>
            <Input
              id="blocked-date"
              type="date"
              required
              min={todayIst}
              value={newDate}
              disabled={loading || addingBlocked}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </Field>
          <Field label="Neden" htmlFor="blocked-reason">
            <Input
              id="blocked-reason"
              type="text"
              maxLength={200}
              placeholder="İsteğe bağlı — örn. Bayram tatili"
              value={newReason}
              disabled={loading || addingBlocked}
              onChange={(e) => setNewReason(e.target.value)}
            />
          </Field>
          <Button
            type="submit"
            size="sm"
            disabled={loading || addingBlocked || !newDate}
            className="h-11"
          >
            {addingBlocked ? "Ekleniyor…" : "Günü Kapat"}
          </Button>
        </form>

        <div className="mt-6 border-t border-ink/10 pt-2">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted">
              Yükleniyor…
            </div>
          ) : !blocked || blocked.length === 0 ? (
            <EmptyState
              title="Kapalı gün yok"
              description="Butiğin kapalı olacağı günleri yukarıdan ekleyebilirsiniz."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-ink/5">
              {blocked.map((b) => {
                const isPast =
                  istanbulDateString(new Date(b.date)) < todayIst;
                return (
                  <li
                    key={b.id}
                    className={cn(
                      "flex items-center gap-3 py-3",
                      isPast && "opacity-60",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium capitalize">
                        {formatBlockedDate(b.date)}
                      </p>
                      {b.reason && (
                        <p className="mt-0.5 truncate text-sm text-muted">
                          {b.reason}
                        </p>
                      )}
                    </div>
                    {isPast && <Badge>Geçmiş</Badge>}
                    <button
                      type="button"
                      aria-label={`${formatBlockedDate(b.date)} kapalı gününü sil`}
                      onClick={() => setPendingDelete(b)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] text-faint transition-colors hover:bg-ink/5 hover:text-[#8c3232]"
                    >
                      <Trash2 size={18} strokeWidth={1.5} aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>

      {/* Silme onayı */}
      <ConfirmDialog
        open={pendingDelete !== null}
        danger
        busy={deleting}
        title="Kapalı günü kaldır"
        description={
          pendingDelete
            ? `${formatBlockedDate(pendingDelete.date)} yeniden randevuya açılacak. Emin misiniz?`
            : undefined
        }
        confirmLabel="Kaldır"
        onConfirm={handleDeleteBlocked}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}
