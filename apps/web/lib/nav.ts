// Celine Gelinlik — ana menü (8 madde, onaylı).
// DİKKAT: ekranda "GELİNLİKLER" görünür ama route /modeller.

export interface NavItem {
  label: string;
  href: string;
  /** i18n çeviri anahtarı (lib/i18n/translations) */
  key: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "ANA SAYFA", href: "/", key: "nav.home" },
  { label: "KOLEKSİYONLAR", href: "/koleksiyonlar", key: "nav.collections" },
  { label: "GELİNLİKLER", href: "/modeller", key: "nav.gowns" },
  { label: "ÖZEL DİKİM", href: "/ozel-dikim", key: "nav.bespoke" },
  { label: "ATÖLYE", href: "/atolye", key: "nav.atelier" },
  { label: "GERÇEK GELİNLER", href: "/gercek-gelinler", key: "nav.realBrides" },
  { label: "RANDEVU", href: "/randevu", key: "nav.appointment" },
  { label: "İLETİŞİM", href: "/iletisim", key: "nav.contact" },
];

// AMSALE header'da nav'ı wordmark'ın iki yanına bölmek için.
export const NAV_LEFT = NAV_ITEMS.slice(0, 4);
export const NAV_RIGHT = NAV_ITEMS.slice(4);
