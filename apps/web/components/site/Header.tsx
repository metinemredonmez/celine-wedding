import { getLocale } from "@/lib/i18n";
import { HeaderNav } from "./HeaderNav";

/**
 * Server wrapper — aktif dili okuyup client HeaderNav'a geçirir (menü/butonlar
 * ve dil değiştirici o dile göre render olur).
 */
export async function Header() {
  const locale = await getLocale();
  return <HeaderNav locale={locale} />;
}

export default Header;
