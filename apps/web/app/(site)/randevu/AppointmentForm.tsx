"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { AvailabilitySlot, SiteSettings } from "@/lib/types";
import { cn, waLink } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  createAppointmentAction,
  fetchAvailabilityAction,
} from "./actions";

// ------------------------------------------------------------------ //
//  Doğrulama şeması (zod) — Türkçe mesajlar                           //
// ------------------------------------------------------------------ //

// TR mobil: 05XXXXXXXXX, +905XXXXXXXXX, 905XXXXXXXXX, 5XXXXXXXXX gibi
// yaygın yazımları kabul eder (boşluk/parantez/tire serbest).
const TR_MOBILE_RE = /^(?:\+?90|0)?5\d{9}$/;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Lütfen adınızı ve soyadınızı yazın.")
    .max(80, "İsim çok uzun."),
  phone: z
    .string()
    .trim()
    .min(1, "Telefon numaranızı girin.")
    .refine(
      (v) => TR_MOBILE_RE.test(v.replace(/[\s()-]/g, "")),
      "Geçerli bir cep telefonu girin (örn. 05XX XXX XX XX).",
    ),
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta girin.")
    .optional()
    .or(z.literal("")),
  date: z.string().trim().optional().or(z.literal("")),
  slot: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Mesaj çok uzun.").optional(),
});

type FormValues = z.infer<typeof schema>;

type SubmitState =
  | { status: "idle" | "submitting" }
  | { status: "success"; startsAt?: string | null }
  | { status: "error" };

// ------------------------------------------------------------------ //
//  Yardımcılar                                                        //
// ------------------------------------------------------------------ //

/** Bugünün yerel tarihini YYYY-MM-DD verir (min= için). */
function todayISODate(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** ISO datetime → "14:30" (yerel). */
function slotLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ISO datetime → "2 Temmuz 2026, 14:30". */
function prettyDateTime(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ------------------------------------------------------------------ //
//  Bileşen                                                            //
// ------------------------------------------------------------------ //

type Props = {
  settings: SiteSettings;
};

export function AppointmentForm({ settings }: Props) {
  const minDate = todayISODate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      date: "",
      slot: "",
      message: "",
    },
  });

  const selectedDate = watch("date");
  const selectedSlot = watch("slot");

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, startSlotsLoad] = useTransition();
  const [slotsFetchedFor, setSlotsFetchedFor] = useState<string | null>(null);

  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

  // Tarih değişince o günün slot'larını çek; slot seçimini sıfırla.
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      setSlotsFetchedFor(null);
      return;
    }
    setValue("slot", "");
    startSlotsLoad(async () => {
      const result = await fetchAvailabilityAction(selectedDate);
      setSlots(result);
      setSlotsFetchedFor(selectedDate);
    });
    // setValue/startSlotsLoad kimliği kararlı; sadece tarihe bağlıyız.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const availableSlots = slots.filter((s) => s.available);
  const wa = settings.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setSubmit({ status: "submitting" });

      const startsAt = values.slot || undefined;
      const preferredDate = values.date || undefined;

      const result = await createAppointmentAction({
        name: values.name,
        phone: values.phone.replace(/[\s()-]/g, ""),
        email: values.email ? values.email : undefined,
        preferredDate,
        startsAt,
        message: values.message ? values.message : undefined,
      });

      if (result.ok) {
        setSubmit({ status: "success", startsAt: result.appointment.startsAt });
        reset();
        setSlots([]);
        setSlotsFetchedFor(null);
      } else {
        setSubmit({ status: "error" });
      }
    },
    [reset],
  );

  // -------------------------------------------------------------- //
  //  Başarı ekranı                                                 //
  // -------------------------------------------------------------- //
  if (submit.status === "success") {
    const when = prettyDateTime(submit.startsAt);
    const waText = when
      ? `Merhaba, ${when} için randevu talebi oluşturdum. Bilgi almak istiyorum.`
      : "Merhaba, Celine Gelinlik için randevu talebi oluşturdum. Bilgi almak istiyorum.";

    return (
      <div className="flex flex-col items-start gap-6 border border-rose-soft bg-cream p-8 sm:p-10">
        <span className="u-label text-rose">Teşekkürler</span>
        <h3 className="font-display text-3xl text-ink sm:text-4xl">
          Talebiniz alındı
        </h3>
        <p className="max-w-md text-muted leading-relaxed">
          Randevu talebinizi aldık. En kısa sürede sizi arayarak
          {when ? (
            <>
              {" "}
              <span className="text-ink">{when}</span> için uygunluğu teyit
              edeceğiz.
            </>
          ) : (
            " uygun bir zaman için teyit alacağız."
          )}
        </p>
        <p className="text-sm text-faint leading-relaxed">
          Dilerseniz WhatsApp üzerinden hemen bize yazarak süreci
          hızlandırabilirsiniz.
        </p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          {wa ? (
            <a
              href={waLink(wa, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-[2px] bg-ink px-8 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] leading-none text-cream transition-colors duration-300 hover:bg-[#3a352f]"
            >
              WhatsApp&apos;tan Devam Et
            </a>
          ) : null}
          <Button
            variant="outline"
            onClick={() => setSubmit({ status: "idle" })}
          >
            Yeni Randevu
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------- //
  //  Form                                                          //
  // -------------------------------------------------------------- //
  const isSubmitting = submit.status === "submitting";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6 border border-rose-soft bg-cream p-8 sm:p-10"
    >
      {/* Ad Soyad */}
      <Field label="Ad Soyad" htmlFor="name" error={errors.name?.message}>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Adınız ve soyadınız"
          className={inputCls(!!errors.name)}
          {...register("name")}
        />
      </Field>

      {/* Telefon */}
      <Field
        label="Telefon"
        htmlFor="phone"
        error={errors.phone?.message}
      >
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="05XX XXX XX XX"
          className={inputCls(!!errors.phone)}
          {...register("phone")}
        />
      </Field>

      {/* E-posta (opsiyonel) */}
      <Field
        label="E-posta"
        htmlFor="email"
        optional
        error={errors.email?.message}
      >
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@eposta.com"
          className={inputCls(!!errors.email)}
          {...register("email")}
        />
      </Field>

      {/* Tarih */}
      <Field
        label="Tercih Ettiğiniz Tarih"
        htmlFor="date"
        optional
        error={errors.date?.message}
      >
        <input
          id="date"
          type="date"
          min={minDate}
          className={inputCls(!!errors.date)}
          {...register("date")}
        />
      </Field>

      {/* Slot'lar — tarih seçilince görünür */}
      {selectedDate ? (
        <div className="flex flex-col gap-3">
          <span className="u-label text-faint">Uygun Saatler</span>

          {slotsLoading ? (
            <p className="text-sm text-muted">Uygun saatler getiriliyor…</p>
          ) : availableSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableSlots.map((s) => {
                const active = selectedSlot === s.start;
                return (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() =>
                      setValue("slot", active ? "" : s.start, {
                        shouldValidate: false,
                      })
                    }
                    aria-pressed={active}
                    className={cn(
                      "rounded-[2px] border px-4 py-2 text-sm transition-colors duration-200",
                      active
                        ? "border-ink bg-ink text-cream"
                        : "border-rose-soft bg-transparent text-ink hover:border-ink",
                    )}
                  >
                    {slotLabel(s.start)}
                  </button>
                );
              })}
            </div>
          ) : slotsFetchedFor === selectedDate ? (
            <p className="text-sm text-muted leading-relaxed">
              Seçtiğiniz gün için uygun saat görünmüyor. Farklı bir tarih
              deneyin ya da talebinizi yine iletin; sizi arayıp en uygun zamanı
              birlikte belirleyelim.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Mesaj */}
      <Field
        label="Mesajınız"
        htmlFor="message"
        optional
        error={errors.message?.message}
      >
        <textarea
          id="message"
          rows={4}
          placeholder="Hayalinizdeki gelinlik, düğün tarihiniz veya sormak istedikleriniz…"
          className={cn(inputCls(!!errors.message), "resize-none")}
          {...register("message")}
        />
      </Field>

      {submit.status === "error" ? (
        <p
          role="alert"
          className="rounded-[2px] border border-rose bg-powder px-4 py-3 text-sm text-ink"
        >
          Talebiniz gönderilemedi. Lütfen birazdan tekrar deneyin ya da
          telefon/WhatsApp üzerinden bize ulaşın.
        </p>
      ) : null}

      <div className="mt-1">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Gönderiliyor…" : "Randevu Talebi Gönder"}
        </Button>
      </div>

      <p className="text-xs text-faint leading-relaxed">
        Bu form bir talep oluşturur; kesin randevu ekibimizin teyidiyle
        netleşir. Bilgileriniz yalnızca randevunuz için kullanılır.
      </p>
    </form>
  );
}

// ------------------------------------------------------------------ //
//  Alt bileşenler / stiller                                          //
// ------------------------------------------------------------------ //

function inputCls(hasError: boolean): string {
  return cn(
    "w-full rounded-[2px] border bg-transparent px-4 py-3 text-ink",
    "placeholder:text-faint/80 transition-colors duration-200",
    "focus:outline-none focus:border-ink",
    hasError ? "border-rose" : "border-rose-soft",
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
};

function Field({ label, htmlFor, error, optional, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="u-label text-faint flex items-center gap-2"
      >
        {label}
        {optional ? (
          <span className="text-[0.6rem] tracking-normal normal-case text-faint/70">
            (opsiyonel)
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <span role="alert" className="text-xs text-rose">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export default AppointmentForm;
