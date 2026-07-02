// Celine Admin — login segmenti (shell'siz, sadece metadata + passthrough).

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş · Celine Admin",
  robots: { index: false, follow: false },
};

export default function AdminAuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
