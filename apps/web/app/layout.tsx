import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// Serif başlık — AMSALE benzeri zarif, yüksek-kontrast his.
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

// Gövde metni.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
  display: "swap",
});

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-powder text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
