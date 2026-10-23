import type { Metadata } from "next";
import { getLocale, isRtl } from "@/lib/i18n";
// Fontlar npm paketinden, kendi alan adımızdan sunulur (build sırasında Google Fonts'a
// istek yok — sunucuda Google uzantısız font adresi döndürünce next/font build'i kırıyordu).
// Serif başlık — AMSALE benzeri zarif, yüksek-kontrast his.
import "@fontsource-variable/cormorant-garamond/wght.css";
// Gövde metni.
import "@fontsource-variable/inter/wght.css";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://celinegelinlik.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Celine Gelinlik — Kişiye Özel Couture Gelinlik | Maltepe İstanbul",
    template: "%s · Celine Gelinlik",
  },
  description:
    "Celine Gelinlik (Seda Dönmez Couture) — ölçüye özel, kişiye özel couture gelinlik tasarımı. Maltepe, İstanbul. Randevu ile atölye deneyimi.",
  keywords: [
    "gelinlik",
    "couture gelinlik",
    "özel dikim gelinlik",
    "Maltepe gelinlik",
    "İstanbul gelinlik",
    "Celine Gelinlik",
    "Seda Dönmez",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Celine Gelinlik",
    url: SITE_URL,
    title: "Celine Gelinlik — Kişiye Özel Couture Gelinlik",
    description:
      "Ölçüye özel, kişiye özel couture gelinlik. Maltepe, İstanbul. Randevu ile atölye deneyimi.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
    >
      <body className="min-h-screen bg-powder text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
