import type { SiteSettings } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n/config";
import { telLink, waLink } from "@/lib/utils";

// Atölye bilgi kartı (sağ kolon). SiteSettings'ten adres/telefon/WhatsApp;
// etiketler ve çalışma saatleri aktif dile göre çevrilir.

type Props = {
  settings: SiteSettings;
  locale: Locale;
};

export function AtelierInfo({ settings, locale }: Props) {
  const phone = settings.phone ?? null;
  const wa = settings.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? null;
  const address =
    settings.address ??
    "İdealtepe Mah. Panorama Sok. Defne Apt. No:5 D:7, Maltepe / İstanbul";
  const tel = telLink(phone);
  const waText = t(locale, "cta.whatsappText");

  const hours: Array<{ day: string; time: string }> = [
    { day: t(locale, "hours.weekdays"), time: "10:00 – 19:00" },
    { day: t(locale, "hours.saturday"), time: "10:00 – 18:00" },
    { day: t(locale, "hours.sunday"), time: t(locale, "hours.byAppointment") },
  ];

  return (
    <aside className="flex flex-col gap-8 border border-rose-soft bg-cream p-8 sm:p-10">
      <div className="flex flex-col gap-3">
        <span className="u-label text-rose">{t(locale, "atelier.eyebrow")}</span>
        <h3 className="font-display text-2xl text-ink sm:text-3xl">
          Celine Gelinlik
        </h3>
        <p className="text-sm text-muted leading-relaxed">
          {t(locale, "atelier.intro")}
        </p>
      </div>

      <div className="h-px w-full bg-rose-soft" aria-hidden />

      <InfoRow label={t(locale, "label.address")}>
        {settings.mapUrl ? (
          <a
            href={settings.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline-offset-4 transition-colors hover:text-rose hover:underline"
          >
            {address}
          </a>
        ) : (
          <span className="text-ink">{address}</span>
        )}
      </InfoRow>

      {phone ? (
        <InfoRow label={t(locale, "label.phone")}>
          <a
            href={tel ?? "#"}
            className="text-ink underline-offset-4 transition-colors hover:text-rose hover:underline"
          >
            {phone}
          </a>
        </InfoRow>
      ) : null}

      {wa ? (
        <InfoRow label={t(locale, "label.whatsapp")}>
          <a
            href={waLink(wa, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline-offset-4 transition-colors hover:text-rose hover:underline"
          >
            {t(locale, "atelier.waLink")}
          </a>
        </InfoRow>
      ) : null}

      <InfoRow label={t(locale, "label.hours")}>
        <ul className="flex flex-col gap-1.5">
          {hours.map((h) => (
            <li
              key={h.day}
              className="flex items-baseline justify-between gap-6 text-ink"
            >
              <span>{h.day}</span>
              <span className="text-muted">{h.time}</span>
            </li>
          ))}
        </ul>
      </InfoRow>
    </aside>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="u-label text-faint">{label}</span>
      <div className="text-[0.95rem] leading-relaxed">{children}</div>
    </div>
  );
}

export default AtelierInfo;
