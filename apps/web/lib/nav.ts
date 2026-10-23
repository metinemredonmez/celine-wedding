// Celine Gelinlik — ana menü (8 madde, onaylı) + Düğün Makyajı (sanal deneme demosu).
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
  { label: "DÜĞÜN MAKYAJI", href: "/dugun-makyaji", key: "nav.bridalMakeup" },
  { label: "ATÖLYE", href: "/atolye", key: "nav.atelier" },
  { label: "GERÇEK GELİNLER", href: "/gercek-gelinler", key: "nav.realBrides" },
  { label: "RANDEVU", href: "/randevu", key: "nav.appointment" },
  { label: "İLETİŞİM", href: "/iletisim", key: "nav.contact" },
];

// AMSALE header'da nav'ı wordmark'ın iki yanına bölmek için.
// Sol 5 madde (Düğün Makyajı dahil), sağda 3 bağlantı + Randevu düğmesi + dil.
export const NAV_LEFT = NAV_ITEMS.slice(0, 5);
export const NAV_RIGHT = NAV_ITEMS.slice(5);
