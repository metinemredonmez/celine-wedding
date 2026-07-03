"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { AvailabilitySlot, SiteSettings } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n/config";
import { cn, waLink } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  createAppointmentAction,
  fetchAvailabilityAction,
} from "./actions";

// TR mobil: 05XXXXXXXXX, +905XXXXXXXXX, 905XXXXXXXXX, 5XXXXXXXXX gibi
// yaygın yazımları kabul eder (boşluk/parantez/tire serbest).
const TR_MOBILE_RE = /^(?:\+?90|0)?5\d{9}$/;

/** Aktif dile göre doğrulama şeması (mesajlar çevrilir). */
function makeSchema(locale: Locale) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t(locale, "form.name.error.min"))
      .max(80, t(locale, "form.name.error.max")),
    phone: z
      .string()
      .trim()
      .min(1, t(locale, "form.phone.error.required"))
      .refine(
        (v) => TR_MOBILE_RE.test(v.replace(/[\s()-]/g, "")),
        t(locale, "form.phone.error.invalid"),
      ),
    email: z
      .string()
      .trim()
      .email(t(locale, "form.email.error.invalid"))
      .optional()
      .or(z.literal("")),
    date: z.string().trim().optional().or(z.literal("")),
    slot: z.string().trim().optional().or(z.literal("")),
    message: z
      .string()
      .trim()
      .max(1000, t(locale, "form.message.error.max"))
      .optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>;

type SubmitState =
  | { status: "idle" | "submitting" }
  | { status: "success"; startsAt?: string | null }
  | { status: "error" };

const INTL: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-GB",
  ar: "ar",
  ru: "ru-RU",
};

/** Bugünün yerel tarihini YYYY-MM-DD verir. */
function todayISODate(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function slotLabel(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(INTL[locale], { hour: "2-digit", minute: "2-digit" });
}

function prettyDateTime(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(INTL[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  settings: SiteSettings;
  locale: Locale;
};

export function AppointmentForm({ settings, locale }: Props) {
  const minDate = todayISODate();
  const schema = useMemo(() => makeSchema(locale), [locale]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", date: "", slot: "", message: "" },
  });

  const selectedDate = watch("date");
  const selectedSlot = watch("slot");

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, startSlotsLoad] = useTransition();
  const [slotsFetchedFor, setSlotsFetchedFor] = useState<string | null>(null);
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const availableSlots = slots.filter((s) => s.available);
  const wa = settings.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";
  const optionalLabel = t(locale, "form.optional");

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setSubmit({ status: "submitting" });
      const result = await createAppointmentAction({
        name: values.name,
        phone: values.phone.replace(/[\s()-]/g, ""),
        email: values.email ? values.email : undefined,
        preferredDate: values.date || undefined,
        startsAt: values.slot || undefined,
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

  // ── Başarı ekranı ──
  if (submit.status === "success") {
    const when = prettyDateTime(submit.startsAt, locale);
    const body = t(
      locale,
      when ? "form.success.body.withDate" : "form.success.body.noDate",
    ).replace("{when}", when ?? "");
    const waText = t(
      locale,
      when ? "form.wa.message.withDate" : "form.wa.message.noDate",
    ).replace("{when}", when ?? "");

    return (
      <div className="flex flex-col items-start gap-6 border border-rose-soft bg-cream p-8 sm:p-10">
        <span className="u-label text-rose">{t(locale, "form.success.eyebrow")}</span>
        <h3 className="font-display text-3xl text-ink sm:text-4xl">
          {t(locale, "form.success.title")}
        </h3>
        <p className="max-w-md text-muted leading-relaxed">{body}</p>
        <p className="text-sm text-faint leading-relaxed">
          {t(locale, "form.success.whatsappHint")}
        </p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          {wa ? (
            <a
              href={waLink(wa, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-[2px] bg-ink px-8 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] leading-none text-cream transition-colors duration-300 hover:bg-[#3a352f]"
            >
              {t(locale, "form.success.whatsappButton")}
            </a>
          ) : null}
          <Button variant="outline" onClick={() => setSubmit({ status: "idle" })}>
            {t(locale, "form.success.newAppointment")}
          </Button>
        </div>
      </div>
    );
  }

  // ── Form ──
  const isSubmitting = submit.status === "submitting";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6 border border-rose-soft bg-cream p-8 sm:p-10"
    >
      <Field label={t(locale, "form.name.label")} htmlFor="name" error={errors.name?.message}>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder={t(locale, "form.name.placeholder")}
          className={inputCls(!!errors.name)}
          {...register("name")}
        />
      </Field>

      <Field label={t(locale, "form.phone.label")} htmlFor="phone" error={errors.phone?.message}>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t(locale, "form.phone.placeholder")}
          className={inputCls(!!errors.phone)}
          {...register("phone")}
        />
      </Field>

      <Field
        label={t(locale, "form.email.label")}
        htmlFor="email"
        optionalLabel={optionalLabel}
        error={errors.email?.message}
      >
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t(locale, "form.email.placeholder")}
          className={inputCls(!!errors.email)}
          {...register("email")}
        />
      </Field>

      <Field
        label={t(locale, "form.date.label")}
        htmlFor="date"
        optionalLabel={optionalLabel}
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

      {selectedDate ? (
        <div className="flex flex-col gap-3">
          <span className="u-label text-faint">{t(locale, "form.slots.label")}</span>
          {slotsLoading ? (
            <p className="text-sm text-muted">{t(locale, "form.slots.loading")}</p>
          ) : availableSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableSlots.map((s) => {
                const active = selectedSlot === s.start;
                return (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() =>
                      setValue("slot", active ? "" : s.start, { shouldValidate: false })
                    }
                    aria-pressed={active}
                    className={cn(
                      "rounded-[2px] border px-4 py-2 text-sm transition-colors duration-200",
                      active
                        ? "border-ink bg-ink text-cream"
                        : "border-rose-soft bg-transparent text-ink hover:border-ink",
                    )}
                  >
                    {slotLabel(s.start, locale)}
                  </button>
                );
              })}
            </div>
          ) : slotsFetchedFor === selectedDate ? (
            <p className="text-sm text-muted leading-relaxed">
              {t(locale, "form.slots.empty")}
            </p>
          ) : null}
        </div>
      ) : null}

      <Field
        label={t(locale, "form.message.label")}
        htmlFor="message"
        optionalLabel={optionalLabel}
        error={errors.message?.message}
      >
        <textarea
          id="message"
          rows={4}
          placeholder={t(locale, "form.message.placeholder")}
          className={cn(inputCls(!!errors.message), "resize-none")}
          {...register("message")}
        />
      </Field>

      {submit.status === "error" ? (
        <p
          role="alert"
          className="rounded-[2px] border border-rose bg-powder px-4 py-3 text-sm text-ink"
        >
          {t(locale, "form.submit.error")}
        </p>
      ) : null}

      <div className="mt-1">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? t(locale, "form.submit.button.loading")
            : t(locale, "form.submit.button")}
        </Button>
      </div>

      <p className="text-xs text-faint leading-relaxed">{t(locale, "form.footnote")}</p>
    </form>
  );
}

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
  /** verilirse etiketin yanında "(opsiyonel)" gösterilir */
  optionalLabel?: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, error, optionalLabel, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="u-label text-faint flex items-center gap-2">
        {label}
        {optionalLabel ? (
          <span className="text-[0.6rem] tracking-normal normal-case text-faint/70">
            {optionalLabel}
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
