/**
 * Demo (uygulamadan önce dene) tonları. Yalnız tarayıcıda çizim içindir; renk analizi önerisi değildir.
 * depth: koyulaştırma payı (multiply), lift: açma payı (soft-light beyaz) — açık saçı koyultmak kolay,
 * koyu saçı açmak sınırlı olduğundan sarı tonlarda lift kullanılır.
 */

import { isHex, lightness } from "./color";

export type Shade = { id: string; name: string; hex: string; depth: number; lift?: number };

export const LIP_SHADES: Shade[] = [
  { id: "gul-kurusu", name: "Gül kurusu", hex: "#B5656B", depth: 0.35 },
  { id: "nude", name: "Nude", hex: "#C98B7E", depth: 0.2 },
  { id: "pudra-pembe", name: "Pudra pembe", hex: "#CF8A93", depth: 0.25 },
  { id: "seftali", name: "Şeftali", hex: "#E0826A", depth: 0.2 },
  { id: "mercan", name: "Mercan", hex: "#D9574A", depth: 0.3 },
  { id: "pembe", name: "Fuşya", hex: "#C9416E", depth: 0.35 },
  { id: "kirmizi", name: "Klasik kırmızı", hex: "#B3122B", depth: 0.55 },
  { id: "visne", name: "Vişne", hex: "#7A1730", depth: 0.7 },
  { id: "murdum", name: "Mürdüm", hex: "#5E2A40", depth: 0.75 },
];

export const BLUSH_SHADES: Shade[] = [
  { id: "seftali", name: "Şeftali", hex: "#E99273", depth: 0 },
  { id: "gul", name: "Gül", hex: "#D9707E", depth: 0 },
  { id: "pudra", name: "Pudra", hex: "#E3949C", depth: 0 },
  { id: "bronz", name: "Bronz", hex: "#B9765C", depth: 0 },
];

export const SHADOW_SHADES: Shade[] = [
  { id: "sampanya", name: "Şampanya", hex: "#B89272", depth: 0 },
  { id: "gul-altin", name: "Gül altın", hex: "#A8705F", depth: 0 },
  { id: "toprak", name: "Toprak", hex: "#8C6650", depth: 0 },
  { id: "bronz", name: "Bronz", hex: "#A56A3A", depth: 0 },
  { id: "murdum", name: "Mürdüm", hex: "#6E4258", depth: 0 },
  { id: "duman", name: "Füme", hex: "#55505A", depth: 0 },
];

export const HAIR_SHADES: Shade[] = [
  { id: "bakir", name: "Bakır kahve", hex: "#8A4527", depth: 0.45 },
  { id: "kestane", name: "Kestane", hex: "#5A3220", depth: 0.7 },
  { id: "kizil", name: "Kızıl", hex: "#B1381C", depth: 0.35 },
  { id: "bal", name: "Bal köpüğü", hex: "#B98448", depth: 0.2, lift: 0.1 },
  { id: "kullu", name: "Küllü sarı", hex: "#C9B48E", depth: 0.05, lift: 0.3 },
  { id: "bordo", name: "Bordo", hex: "#5C1A2A", depth: 0.65 },
  { id: "siyah", name: "Siyah", hex: "#1E1715", depth: 0.9 },
  { id: "pembe", name: "Pastel pembe", hex: "#D99AA8", depth: 0.05, lift: 0.25 },
];

export const BROW_SHADES: Shade[] = [
  { id: "acik-kahve", name: "Açık kahve", hex: "#8A6A52", depth: 0.35 },
  { id: "kullu-kahve", name: "Küllü kahve", hex: "#6B5A50", depth: 0.5 },
  { id: "koyu-kahve", name: "Koyu kahve", hex: "#3F2D24", depth: 0.7 },
  { id: "siyah", name: "Siyah", hex: "#1F1816", depth: 0.85 },
  { id: "bal", name: "Bal sarısı", hex: "#A9824F", depth: 0.2 },
  { id: "kizil", name: "Kızıl", hex: "#8C4529", depth: 0.4 },
];

/** Maskara renkleri; kirpik telleri ve mevcut kirpik koyulaştırması bu renkle. */
export const LASH_SHADES: Shade[] = [
  { id: "siyah", name: "Siyah", hex: "#141012", depth: 0.9 },
  { id: "kahve", name: "Koyu kahve", hex: "#3A2620", depth: 0.75 },
  { id: "lacivert", name: "Lacivert", hex: "#1D2B52", depth: 0.75 },
  { id: "bordo", name: "Bordo", hex: "#4E1527", depth: 0.75 },
];

export type Look = {
  lip: string | null;
  lipAmount: number;
  blush: string | null;
  shadow: string | null;
  liner: boolean;
  makeupAmount: number;
  hair: string | null;
  hairAmount: number;
  brow: string | null;
  browAmount: number;
  lash: string | null;
  /** Kirpik hacmi/uzunluğu (0–1). */
  lashAmount: number;
  /** Ten: fondöten tonu (cilt eşitleme), kapatıcılık; kapatıcı, aydınlatıcı, kontür. */
  foundation: string | null;
  foundationAmount: number;
  concealer: boolean;
  highlight: boolean;
  contour: string | null;
  sculptAmount: number;
};

/** İlk açılış: örnek yüzde fark hemen görünsün diye hafif bir ruj seçili gelir. */
export const DEFAULT_LOOK: Look = {
  lip: "gul-kurusu",
  lipAmount: 0.6,
  blush: null,
  shadow: null,
  liner: false,
  makeupAmount: 0.6,
  hair: null,
  hairAmount: 0.85,
  brow: null,
  browAmount: 0.6,
  lash: null,
  lashAmount: 0.6,
  foundation: null,
  foundationAmount: 0.5,
  concealer: false,
  highlight: false,
  contour: null,
  sculptAmount: 0.6,
};

/**
 * Özel (sınırsız) renk: seçim değeri hazır ton kimliği yerine "#RRGGBB" olabilir. Koyulaştırma payı
 * rengin açıklığından türetilir (koyu ruj/saç daha derin işlenir); çok açık saç tonlarında açma payı.
 */
export function customShade(hex: string): Shade {
  const l = lightness(hex);
  return {
    id: hex.toUpperCase(),
    name: "Özel renk",
    hex: hex.toUpperCase(),
    depth: Math.round((0.1 + 0.75 * (1 - l)) * 100) / 100,
    ...(l > 0.6 ? { lift: Math.min(0.35, Math.round((l - 0.55) * 120) / 100) } : {}),
  };
}

export function findShade(list: Shade[], id: string | null): Shade | null {
  if (isHex(id)) return customShade(id);
  return (id && list.find((s) => s.id === id)) || null;
}

export function hasMakeup(look: Look): boolean {
  return Boolean(
    look.lip ||
    look.blush ||
    look.shadow ||
    look.liner ||
    look.hair ||
    look.brow ||
    look.lash ||
    look.foundation ||
    look.concealer ||
    look.highlight ||
    look.contour,
  );
}

/** Hazır düğün makyajı görünümleri: tek dokunuşla tam görünüm; ardından sekmelerden ince ayar yapılır. */
export type BridalLook = {
  id: string;
  name: string;
  /** Kısa, tek satırlık tarif (kart altı). */
  note: string;
  look: Look;
};

/** Makyajsız taban: hazır görünümler bunun üstüne yazılır (varsayılan ruj gelmesin). */
export const BARE_LOOK: Look = { ...DEFAULT_LOOK, lip: null };

const bridal = (look: Partial<Look>): Look => ({ ...BARE_LOOK, ...look });

export const BRIDAL_LOOKS: BridalLook[] = [
  {
    id: "klasik",
    name: "Klasik Gelin",
    note: "Gül kurusu dudak, ince eyeliner, aydınlık ten",
    look: bridal({
      foundation: "acik-bej",
      foundationAmount: 0.5,
      concealer: true,
      highlight: true,
      contour: "serin",
      blush: "gul",
      sculptAmount: 0.6,
      lip: "gul-kurusu",
      lipAmount: 0.85,
      shadow: "toprak",
      liner: true,
      makeupAmount: 0.6,
      lash: "siyah",
      lashAmount: 0.8,
      brow: "koyu-kahve",
      browAmount: 0.5,
    }),
  },
  {
    id: "dogal",
    name: "Doğal Gelin",
    note: "Nikâh sabahı tazeliği; nude dudak, şeftali yanak",
    look: bridal({
      foundation: "acik-bej",
      foundationAmount: 0.4,
      concealer: true,
      highlight: true,
      blush: "seftali",
      sculptAmount: 0.5,
      lip: "nude",
      lipAmount: 0.7,
      shadow: "sampanya",
      makeupAmount: 0.5,
      lash: "kahve",
      lashAmount: 0.55,
      brow: "kullu-kahve",
      browAmount: 0.4,
    }),
  },
  {
    id: "romantik",
    name: "Romantik Pembe",
    note: "Pudra pembe dudak ve yanak, gül altın far",
    look: bridal({
      foundation: "porselen",
      foundationAmount: 0.45,
      concealer: true,
      highlight: true,
      blush: "pudra",
      sculptAmount: 0.65,
      lip: "pudra-pembe",
      lipAmount: 0.85,
      shadow: "gul-altin",
      makeupAmount: 0.6,
      lash: "kahve",
      lashAmount: 0.7,
      brow: "acik-kahve",
      browAmount: 0.45,
    }),
  },
  {
    id: "glam",
    name: "Akşam Glam",
    note: "Klasik kırmızı dudak, bronz far, dolgun kirpik",
    look: bridal({
      foundation: "dogal-bej",
      foundationAmount: 0.55,
      concealer: true,
      highlight: true,
      contour: "sicak",
      blush: "bronz",
      sculptAmount: 0.75,
      lip: "kirmizi",
      lipAmount: 0.9,
      shadow: "bronz",
      liner: true,
      makeupAmount: 0.8,
      lash: "siyah",
      lashAmount: 0.95,
      brow: "koyu-kahve",
      browAmount: 0.6,
    }),
  },
  {
    id: "kina",
    name: "Kına Gecesi",
    note: "Vişne dudak, mürdüm dumanlı göz",
    look: bridal({
      foundation: "dogal-bej",
      foundationAmount: 0.5,
      highlight: true,
      contour: "sicak",
      blush: "bronz",
      sculptAmount: 0.7,
      lip: "visne",
      lipAmount: 0.9,
      shadow: "murdum",
      liner: true,
      makeupAmount: 0.85,
      lash: "siyah",
      lashAmount: 1,
      brow: "koyu-kahve",
      browAmount: 0.6,
    }),
  },
  {
    id: "nisan",
    name: "Nişan & Söz",
    note: "Mercan dudak, şampanya ışıltı, yumuşak hatlar",
    look: bridal({
      foundation: "acik-bej",
      foundationAmount: 0.4,
      highlight: true,
      blush: "seftali",
      sculptAmount: 0.55,
      lip: "mercan",
      lipAmount: 0.75,
      shadow: "sampanya",
      makeupAmount: 0.55,
      lash: "kahve",
      lashAmount: 0.65,
      brow: "kullu-kahve",
      browAmount: 0.45,
    }),
  },
];

export const DEFAULT_BRIDAL_LOOK = BRIDAL_LOOKS[0];

/** Fondöten tonları (açık → koyu); cilt eşitleme + hafif ton. */
export const FOUNDATION_SHADES: Shade[] = [
  { id: "porselen", name: "Porselen", hex: "#F1D9C9", depth: 0 },
  { id: "acik-bej", name: "Açık bej", hex: "#E8C7AE", depth: 0 },
  { id: "dogal-bej", name: "Doğal bej", hex: "#D9AE8E", depth: 0 },
  { id: "bugday", name: "Buğday", hex: "#C9966F", depth: 0 },
  { id: "karamel", name: "Karamel", hex: "#A9724D", depth: 0 },
  { id: "bronz", name: "Bronz", hex: "#8A5A3C", depth: 0 },
];

/** Kontür / bronzer tonları. */
export const CONTOUR_SHADES: Shade[] = [
  { id: "serin", name: "Serin kontür", hex: "#8E6E62", depth: 0 },
  { id: "sicak", name: "Sıcak bronzer", hex: "#A0694A", depth: 0 },
  { id: "derin", name: "Derin kontür", hex: "#6E4A3C", depth: 0 },
];
