import type { SiteSettings } from "@/lib/types";
import { telLink, waLink } from "@/lib/utils";

// Atölye bilgi kartı (sağ kolon). Salt gösterim — server component olabilir.
// SiteSettings'ten adres / telefon / WhatsApp; çalışma saatleri statik.

const HOURS: Array<{ day: string; time: string }> = [
  { day: "Pazartesi – Cuma", time: "10:00 – 19:00" },
  { day: "Cumartesi", time: "10:00 – 18:00" },
  { day: "Pazar", time: "Randevu ile" },
];

type Props = {
  settings: SiteSettings;
};

export function AtelierInfo({ settings }: Props) {
  const phone = settings.phone ?? null;
  const wa = settings.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? null;
  const address = settings.address ?? "Maltepe, İstanbul";
  const tel = telLink(phone);
  const waText = "Merhaba, Celine Gelinlik için randevu almak istiyorum.";

  return (
    <aside className="flex flex-col gap-8 border border-rose-soft bg-cream p-8 sm:p-10">
      <div className="flex flex-col gap-3">
        <span className="u-label text-rose">Atölye</span>
        <h3 className="font-display text-2xl text-ink sm:text-3xl">
          Celine Gelinlik
        </h3>
        <p className="text-sm text-muted leading-relaxed">
          Sizi atölyemizde ağırlamayı, hikâyenizi dinlemeyi ve size özel
          tasarım yolculuğuna birlikte başlamayı çok isteriz.
        </p>
      </div>

      <div className="h-px w-full bg-rose-soft" aria-hidden />

      {/* Adres */}
      <InfoRow label="Adres">
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

      {/* Telefon */}
      {phone ? (
        <InfoRow label="Telefon">
          <a
            href={tel ?? "#"}
            className="text-ink underline-offset-4 transition-colors hover:text-rose hover:underline"
          >
            {phone}
          </a>
        </InfoRow>
      ) : null}

      {/* WhatsApp */}
      {wa ? (
        <InfoRow label="WhatsApp">
          <a
            href={waLink(wa, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline-offset-4 transition-colors hover:text-rose hover:underline"
          >
            Mesaj gönder
          </a>
        </InfoRow>
      ) : null}

      {/* Çalışma saatleri */}
      <InfoRow label="Çalışma Saatleri">
        <ul className="flex flex-col gap-1.5">
          {HOURS.map((h) => (
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
