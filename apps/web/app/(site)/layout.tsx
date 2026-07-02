import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

/**
 * Public site kabuğu — Header + içerik + Footer.
 * Route group "(site)" URL'leri DEĞİŞTİRMEZ; sadece admin'in bu kabuğun
 * dışında kalmasını sağlar (admin kendi shell'ini kullanır).
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
