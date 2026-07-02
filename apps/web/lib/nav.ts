// Celine Gelinlik — ana menü (8 madde, onaylı).
// DİKKAT: ekranda "GELİNLİKLER" görünür ama route /modeller.

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "ANA SAYFA", href: "/" },
  { label: "KOLEKSİYONLAR", href: "/koleksiyonlar" },
  { label: "GELİNLİKLER", href: "/modeller" },
  { label: "ÖZEL DİKİM", href: "/ozel-dikim" },
  { label: "ATÖLYE", href: "/atolye" },
  { label: "GERÇEK GELİNLER", href: "/gercek-gelinler" },
  { label: "RANDEVU", href: "/randevu" },
  { label: "İLETİŞİM", href: "/iletisim" },
];

// AMSALE header'da nav'ı wordmark'ın iki yanına bölmek için.
export const NAV_LEFT = NAV_ITEMS.slice(0, 4);
export const NAV_RIGHT = NAV_ITEMS.slice(4);
