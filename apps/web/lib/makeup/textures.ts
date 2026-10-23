/**
 * Doku örnekleri: renk noktası yerine gerçek bir saç tutamı, dudak, kaş ya da göz kırpıntısı; seçilen ton
 * demo motoruyla (renderLook) üstüne uygulanmış hâlde. Kaynak demo mankenleridir; yalnız tarayıcıda çizilir,
 * hiçbir yere gönderilmez. Ton başına sonuç önbellekte tutulur.
 */

import { BROWS, EYES, LIPS_OUTER, pick, type Pt } from "./face";
import { DEFAULT_LOOK, type Look, type Shade } from "./looks";
import { loadSample } from "./photo";
import { renderLook, type FaceData, type HairMask } from "./render";

export type TextureKind = "lip" | "brow" | "lash" | "hair";

/**
 * Yakın plan yüz dudak için; açık ten ve açık kaş/kirpikli manken göz ve kaş için (koyu tonlar farkı
 * gösterir); dalgalı saç tutam dokusu için (ışık-gölge geçişi belirgin).
 */
const SOURCE: Record<TextureKind, string> = {
  lip: "closeup",
  brow: "straight",
  lash: "straight",
  hair: "wavy",
};

/** Çıktı kenarı (px): 56 px'lik kutuda iki kat yoğunluk. */
const TILE = 112;

type Sample = { image: HTMLCanvasElement; face: FaceData | null };
type Crop = { image: HTMLCanvasElement; face: FaceData };

const samples = new Map<string, Promise<Sample>>();
const crops = new Map<TextureKind, Promise<Crop | null>>();
const tiles = new Map<string, Promise<string | null>>();

function sample(model: string): Promise<Sample> {
  let p = samples.get(model);
  if (!p) {
    p = loadSample(async () => null, model);
    p.catch(() => samples.delete(model));
    samples.set(model, p);
  }
  return p;
}

function bounds(pts: readonly Pt[]) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

/** Saç maskesinin kare bir bölgesini kırpıntı boyutuna ölçekler. */
function cropMask(m: HairMask, W: number, H: number, x: number, y: number, s: number): HairMask {
  const src = document.createElement("canvas");
  src.width = m.width;
  src.height = m.height;
  const img = new ImageData(m.width, m.height);
  for (let i = 0; i < m.alpha.length; i++) img.data[i * 4 + 3] = m.alpha[i];
  src.getContext("2d")!.putImageData(img, 0, 0);
  const kx = m.width / W;
  const ky = m.height / H;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(src, x * kx, y * ky, s * kx, s * ky, 0, 0, s, s);
  const px = ctx.getImageData(0, 0, s, s).data;
  const alpha = new Uint8ClampedArray(s * s);
  for (let i = 0; i < alpha.length; i++) alpha[i] = px[i * 4 + 3];
  return { width: s, height: s, alpha };
}

/** Kare kırpıntı: görüntü, yüz noktaları ve saç maskesi aynı pencereye taşınır. */
function crop(src: Sample & { face: FaceData }, cx: number, cy: number, side: number): Crop {
  const { image, face } = src;
  const s = Math.round(Math.min(side, image.width, image.height));
  const x = Math.round(Math.min(Math.max(0, cx - s / 2), image.width - s));
  const y = Math.round(Math.min(Math.max(0, cy - s / 2), image.height - s));
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  c.getContext("2d")!.drawImage(image, x, y, s, s, 0, 0, s, s);
  const points = face.points.map(([px, py]) => [px - x, py - y] as Pt);
  const hair = face.hair ? cropMask(face.hair, image.width, image.height, x, y, s) : null;
  return { image: c, face: { points, hair } };
}

/**
 * Saç tutamı: maskede (neredeyse) tamamı saç olan en büyük kare pencere. Bütünleşik toplam tablosuyla
 * kaba ızgarada aranır; bulunamazsa null (düz renk noktası kalır).
 */
export function hairWindow(m: HairMask, W: number) {
  const iw = m.width + 1;
  const sum = new Uint32Array(iw * (m.height + 1));
  for (let y = 0; y < m.height; y++) {
    let row = 0;
    for (let x = 0; x < m.width; x++) {
      row += m.alpha[y * m.width + x] > 200 ? 1 : 0;
      sum[(y + 1) * iw + x + 1] = sum[y * iw + x + 1] + row;
    }
  }
  const k = m.width / W;
  for (const frac of [0.22, 0.17, 0.12]) {
    const s = Math.round(W * frac * k);
    const step = Math.max(1, Math.round(s / 6));
    let best = { score: 0, x: 0, y: 0 };
    for (let y = 0; y + s <= m.height; y += step)
      for (let x = 0; x + s <= m.width; x += step) {
        const n = sum[(y + s) * iw + x + s] - sum[y * iw + x + s] - sum[(y + s) * iw + x] + sum[y * iw + x];
        const score = n / (s * s);
        if (score > best.score) best = { score, x, y };
      }
    if (best.score >= 0.97) return { cx: (best.x + s / 2) / k, cy: (best.y + s / 2) / k, side: s / k };
  }
  return null;
}

async function regionOf(kind: TextureKind): Promise<Crop | null> {
  const src = await sample(SOURCE[kind]);
  const face = src.face;
  if (!face) return null;
  const s = { ...src, face };
  const pts = face.points;
  if (kind === "hair") {
    const win = face.hair && hairWindow(face.hair, src.image.width);
    return win ? crop(s, win.cx, win.cy, win.side) : null;
  }
  if (kind === "lip") {
    const b = bounds(pick(pts, LIPS_OUTER));
    return crop(s, b.cx, b.cy, b.w * 1.15);
  }
  // Kameraya daha dönük (daha geniş görünen) taraf seçilir.
  const side = [0, 1].reduce((a, i) =>
    bounds(pick(pts, EYES[i].lid)).w > bounds(pick(pts, EYES[a].lid)).w ? i : a,
  );
  if (kind === "brow") {
    const b = bounds(pick(pts, [...BROWS[side].upper, ...BROWS[side].lower]));
    return crop(s, b.cx, b.cy, b.w * 1.05);
  }
  // Maskara: kapak çizgisi ortada, kirpikler büyük görünsün.
  const lid = bounds(pick(pts, EYES[side].lid));
  return crop(s, lid.cx, lid.cy, lid.w * 1.15);
}

function region(kind: TextureKind): Promise<Crop | null> {
  let p = crops.get(kind);
  if (!p) {
    p = regionOf(kind);
    p.catch(() => crops.delete(kind));
    crops.set(kind, p);
  }
  return p;
}

const BARE: Look = { ...DEFAULT_LOOK, lip: null };

function lookFor(kind: TextureKind, id: string): Look {
  switch (kind) {
    case "lip":
      return { ...BARE, lip: id, lipAmount: 0.8 };
    case "brow":
      return { ...BARE, brow: id, browAmount: 1 };
    case "lash":
      return { ...BARE, lash: id, lashAmount: 1 };
    case "hair":
      return { ...BARE, hair: id, hairAmount: 0.95 };
  }
}

/** Ana iş parçacığını kilitlememek için tonlar arasında bir kare beklenir. */
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

async function tile(kind: TextureKind, id: string): Promise<string | null> {
  const c = await region(kind);
  if (!c) return null;
  await nextFrame();
  const full = document.createElement("canvas");
  renderLook(full, c.image, c.face, lookFor(kind, id));
  const out = document.createElement("canvas");
  out.width = TILE;
  out.height = TILE;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(full, 0, 0, TILE, TILE);
  return out.toDataURL("image/jpeg", 0.86);
}

/** Tonların doku görselleri (kimlik → data URL). Hazırlanamayanlar sonuçta yer almaz. */
export async function shadeTextures(kind: TextureKind, shades: Shade[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const s of shades) {
    const key = `${kind}:${s.id}`;
    let p = tiles.get(key);
    if (!p) {
      p = tile(kind, s.id).catch(() => null);
      tiles.set(key, p);
    }
    const url = await p;
    if (url) out[s.id] = url;
  }
  return out;
}
