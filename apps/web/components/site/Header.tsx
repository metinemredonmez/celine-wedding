import { HeaderNav } from "./HeaderNav";

/**
 * Server wrapper. İleride SiteSettings'ten duyuru/telefon çekmek için buradan
 * geçebiliriz; şimdilik statik duyuru şeridiyle client HeaderNav'ı sarar.
 */
export function Header() {
  return <HeaderNav />;
}

export default Header;
