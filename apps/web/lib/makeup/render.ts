/**
 * Demo çizimi (yalnız tarayıcı, canvas). Taban fotoğraf + yüz noktaları + saç maskesi üzerine
 * ruj, allık, far, eyeliner, kaş rengi, maskara ve saç rengi katmanları birleştirilir. Hiçbir piksel cihazdan çıkmaz.
 *
 * Yumuşak kenar: katman düşük çözünürlükte çizilip büyütülür (Safari'de ctx.filter olmadan da çalışır).
 */

import {
  BROWS,
  CHEEKS,
  EYE_RINGS,
  EYES,
  FACE_OVAL,
  LOWER_LIDS,
  LIPS_INNER,
  LIPS_OUTER,
  centroid,
  faceWidth,
  browPolygon,
  lashStrokes,
  linerPath,
  pick,
  sculptPoints,
  underEyePolygon,
  shadowPolygon,
  type Pt,
} from "./face";
import {
  BLUSH_SHADES,
  BROW_SHADES,
  CONTOUR_SHADES,
  FOUNDATION_SHADES,
  HAIR_SHADES,
  LASH_SHADES,
  LIP_SHADES,
  SHADOW_SHADES,
  findShade,
  type Look,
} from "./looks";

/** Saç olasılık maskesi (0–255), model çözünürlüğünde. */
export type HairMask = { width: number; height: number; alpha: Uint8ClampedArray };
export type FaceData = { points: Pt[]; hair: HairMask | null };

function layer(w: number, h: number, scale: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w * scale));
  c.height = Math.max(1, Math.round(h * scale));
  const ctx = c.getContext("2d")!;
  ctx.scale(scale, scale);
  draw(ctx);
  return c;
}

/** Destekleyen tarayıcıda gerçek bulanıklık (Safari'de yok sayılır; düşük ölçek yine yumuşatır). */
function soften(ctx: CanvasRenderingContext2D, px: number) {
  if ("filter" in ctx) ctx.filter = `blur(${Math.max(0.5, px).toFixed(1)}px)`;
}

function polygon(ctx: CanvasRenderingContext2D, pts: readonly Pt[]) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

function blend(
  out: CanvasRenderingContext2D,
  src: CanvasImageSource,
  mode: GlobalCompositeOperation,
  alpha: number,
  w: number,
  h: number,
) {
  if (alpha <= 0) return;
  out.save();
  out.globalCompositeOperation = mode;
  out.globalAlpha = Math.min(1, alpha);
  out.imageSmoothingEnabled = true;
  out.imageSmoothingQuality = "high";
  out.drawImage(src, 0, 0, w, h);
  out.restore();
}

/** Maske katmanını verilen renkle boyar (maske dışı şeffaf). */
function tint(mask: HTMLCanvasElement, color: string) {
  const c = document.createElement("canvas");
  c.width = mask.width;
  c.height = mask.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

const hairMaskCache = new WeakMap<HairMask, HTMLCanvasElement>();

function hairMaskCanvas(mask: HairMask): HTMLCanvasElement {
  const hit = hairMaskCache.get(mask);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = mask.width;
  c.height = mask.height;
  const img = new ImageData(mask.width, mask.height);
  for (let i = 0; i < mask.alpha.length; i++) {
    img.data[i * 4 + 3] = mask.alpha[i];
  }
  c.getContext("2d")!.putImageData(img, 0, 0);
  hairMaskCache.set(mask, c);
  return c;
}

/**
 * Kıl maskesi (kaş, kirpik dibi): bölge içinde fotoğrafın koyu pikselleri (kıl) yüksek, aradaki ten düşük
 * alfa alır; böylece yalnız kıllar renklenir. fill: bölgenin tamamına verilen hafif taban (kalem dolgusu).
 * Bölgenin ten parlaklığı, bölge içi piksellerin üst yüzdeliğinden kestirilir (ten kıldan açıktır).
 */
function hairlineMask(
  base: CanvasImageSource,
  w: number,
  h: number,
  regions: readonly (readonly Pt[])[],
  feather: number,
  fill: number,
): HTMLCanvasElement {
  const mask = document.createElement("canvas");
  mask.width = w;
  mask.height = h;
  const mctx = mask.getContext("2d")!;
  for (const poly of regions) {
    const pad = Math.ceil(feather * 3 + 2);
    const x0 = Math.max(0, Math.floor(Math.min(...poly.map((p) => p[0])) - pad));
    const y0 = Math.max(0, Math.floor(Math.min(...poly.map((p) => p[1])) - pad));
    const x1 = Math.min(w, Math.ceil(Math.max(...poly.map((p) => p[0])) + pad));
    const y1 = Math.min(h, Math.ceil(Math.max(...poly.map((p) => p[1])) + pad));
    const bw = x1 - x0;
    const bh = y1 - y0;
    if (bw < 2 || bh < 2) continue;
    // Bölge kapsaması (yumuşak kenarlı) ve aynı kutudaki fotoğraf pikselleri.
    const cov = document.createElement("canvas");
    cov.width = bw;
    cov.height = bh;
    const cctx = cov.getContext("2d")!;
    soften(cctx, feather);
    cctx.fillStyle = "#fff";
    cctx.beginPath();
    polygon(
      cctx,
      poly.map(([x, y]) => [x - x0, y - y0] as const),
    );
    cctx.fill();
    const coverage = cctx.getImageData(0, 0, bw, bh).data;
    const src = document.createElement("canvas");
    src.width = bw;
    src.height = bh;
    const sctx = src.getContext("2d", { willReadFrequently: true })!;
    sctx.drawImage(base, x0, y0, bw, bh, 0, 0, bw, bh);
    const px = sctx.getImageData(0, 0, bw, bh).data;
    const lum = new Float32Array(bw * bh);
    const inside: number[] = [];
    for (let i = 0; i < lum.length; i++) {
      lum[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
      if (coverage[i * 4 + 3] > 128) inside.push(lum[i]);
    }
    if (!inside.length) continue;
    inside.sort((a, b) => a - b);
    const skin = inside[Math.floor(inside.length * 0.85)];
    const out = mctx.getImageData(x0, y0, bw, bh);
    for (let i = 0; i < lum.length; i++) {
      const c = coverage[i * 4 + 3] / 255;
      if (!c) continue;
      const dark = Math.min(1, Math.max(0, (skin - lum[i]) / (skin * 0.28 + 1)));
      const a = c * Math.min(1, fill + dark * (1 - fill) * 1.15);
      out.data[i * 4 + 3] = Math.max(out.data[i * 4 + 3], Math.round(a * 255));
    }
    mctx.putImageData(out, x0, y0);
  }
  return mask;
}

const browCache = new WeakMap<FaceData, HTMLCanvasElement>();
const lashCache = new WeakMap<FaceData, HTMLCanvasElement>();

function cached(
  cache: WeakMap<FaceData, HTMLCanvasElement>,
  face: FaceData,
  w: number,
  h: number,
  make: () => HTMLCanvasElement,
): HTMLCanvasElement {
  const hit = cache.get(face);
  if (hit && hit.width === w && hit.height === h) return hit;
  const m = make();
  cache.set(face, m);
  return m;
}

/** Çokgeni ağırlık merkezi etrafında büyütür (hariç tutma bölgelerinde pay). */
function grow(poly: readonly Pt[], k: number): Pt[] {
  const [cx, cy] = centroid(poly);
  return poly.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k] as Pt);
}

const skinCache = new WeakMap<FaceData, HTMLCanvasElement>();

/** Cilt maskesi: yüz ovali − gözler − kaşlar − dudaklar (yumuşak kenarlı). */
function skinMask(face: FaceData, w: number, h: number, fw: number) {
  return cached(skinCache, face, w, h, () => {
    const pts = face.points;
    const m = layer(w, h, 0.5, (c) => {
      soften(c, fw * 0.02);
      c.fillStyle = "#fff";
      c.beginPath();
      polygon(c, grow(pick(pts, FACE_OVAL), 0.97));
      c.fill();
      c.globalCompositeOperation = "destination-out";
      soften(c, fw * 0.01);
      for (const ring of EYE_RINGS) {
        c.beginPath();
        polygon(c, grow(pick(pts, ring), 1.35));
        c.fill();
      }
      for (const b of BROWS) {
        c.beginPath();
        polygon(c, grow(browPolygon(pts, b), 1.25));
        c.fill();
      }
      c.beginPath();
      polygon(c, grow(pick(pts, LIPS_OUTER), 1.12));
      c.fill();
    });
    // Tam boyuta getir (cached boyut kontrolü w×h ister).
    const full = document.createElement("canvas");
    full.width = w;
    full.height = h;
    const fctx = full.getContext("2d")!;
    fctx.imageSmoothingQuality = "high";
    fctx.drawImage(m, 0, 0, w, h);
    return full;
  });
}

/** Küçült-büyüt bulanıklığı (her tarayıcıda; ctx.filter gerekmez). */
function smallBlur(src: HTMLCanvasElement, w: number, h: number, factor: number) {
  const s = document.createElement("canvas");
  s.width = Math.max(1, Math.round(w / factor));
  s.height = Math.max(1, Math.round(h / factor));
  const sctx = s.getContext("2d")!;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(src, 0, 0, s.width, s.height);
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d")!;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(s, 0, 0, w, h);
  return out;
}

/** Yüz (ten) katmanları: fondöten, kapatıcı, kontür, aydınlatıcı. */
function renderBase(
  out: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  face: FaceData,
  look: Look,
  w: number,
  h: number,
) {
  const pts = face.points;
  const fw = faceWidth(pts);
  const foundation = findShade(FOUNDATION_SHADES, look.foundation);
  if (foundation) {
    const fa = look.foundationAmount;
    const mask = skinMask(face, w, h, fw);
    // 1) Eşitleme: bulanık kopya cilt maskesiyle (çil, gözenek, kızarıklık yumuşar; hatlar korunur).
    const smooth = smallBlur(out, w, h, Math.max(4, fw / 70));
    const sctx = smooth.getContext("2d")!;
    sctx.globalCompositeOperation = "destination-in";
    sctx.drawImage(mask, 0, 0);
    blend(ctx, smooth, "source-over", 0.6 * fa, w, h);
    // 2) Ton: seçilen fondötene doğru hafif renk + ışık.
    blend(ctx, tint(mask, foundation.hex), "color", 0.25 * fa, w, h);
    blend(ctx, tint(mask, foundation.hex), "soft-light", 0.3 * fa, w, h);
  }
  const sa = look.sculptAmount;
  if (look.concealer) {
    const L = layer(w, h, 0.5, (c) => {
      soften(c, fw * 0.012);
      c.fillStyle = "#F6DCCB";
      for (const lid of LOWER_LIDS) {
        c.beginPath();
        polygon(c, underEyePolygon(pts, lid));
        c.fill();
      }
    });
    blend(ctx, L, "soft-light", 0.6 * sa, w, h);
    blend(ctx, L, "screen", 0.12 * sa, w, h);
  }
  const sculpt = sculptPoints(pts);
  const contour = findShade(CONTOUR_SHADES, look.contour);
  if (contour) {
    const L = layer(w, h, 0.5, (c) => {
      soften(c, fw * 0.025);
      c.strokeStyle = contour.hex;
      c.fillStyle = contour.hex;
      c.lineCap = "round";
      for (const side of sculpt.sides) {
        c.lineWidth = fw * 0.075;
        c.beginPath();
        c.moveTo(...side.cheekHollow[0]);
        c.lineTo(...side.cheekHollow[1]);
        c.stroke();
        c.beginPath();
        c.arc(side.temple[0], side.temple[1], fw * 0.07, 0, Math.PI * 2);
        c.fill();
      }
      // Çene hattı: ovalin alt kenarı, yalnız yüz içinde kalsın.
      c.lineWidth = fw * 0.06;
      c.beginPath();
      const jaw = pick(pts, [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397]);
      c.moveTo(...jaw[0]);
      for (const p of jaw.slice(1)) c.lineTo(...p);
      c.stroke();
      c.globalCompositeOperation = "destination-in";
      c.beginPath();
      polygon(c, pick(pts, FACE_OVAL));
      c.fill();
    });
    blend(ctx, L, "multiply", 0.45 * sa, w, h);
    blend(ctx, L, "soft-light", 0.25 * sa, w, h);
  }
  if (look.highlight) {
    const L = layer(w, h, 0.5, (c) => {
      soften(c, fw * 0.018);
      c.fillStyle = "#FFF4E8";
      c.strokeStyle = "#FFF4E8";
      c.lineCap = "round";
      for (const side of sculpt.sides) {
        c.save();
        c.translate(side.cheekbone[0], side.cheekbone[1]);
        c.scale(1.6, 0.8);
        c.beginPath();
        c.arc(0, 0, fw * 0.045, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      c.lineWidth = fw * 0.022;
      c.beginPath();
      c.moveTo(...sculpt.noseBridge[0]);
      for (const p of sculpt.noseBridge.slice(1)) c.lineTo(...p);
      c.stroke();
      c.beginPath();
      c.arc(sculpt.cupid[0], sculpt.cupid[1] - fw * 0.025, fw * 0.018, 0, Math.PI * 2);
      c.fill();
    });
    blend(ctx, L, "screen", 0.3 * sa, w, h);
    blend(ctx, L, "soft-light", 0.4 * sa, w, h);
  }
}

export function renderLook(
  out: HTMLCanvasElement,
  base: CanvasImageSource & { width: number; height: number },
  face: FaceData | null,
  look: Look,
  showOriginal = false,
) {
  const w = base.width;
  const h = base.height;
  if (out.width !== w) out.width = w;
  if (out.height !== h) out.height = h;
  const ctx = out.getContext("2d")!;
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.drawImage(base, 0, 0, w, h);
  if (showOriginal || !face) return;

  const pts = face.points;
  const fw = faceWidth(pts);

  // Saç: önce (yüz makyajı saçın üstünde kalsın).
  const hair = findShade(HAIR_SHADES, look.hair);
  if (hair && face.hair) {
    // İlk demo sürümündeki karışım: "renk" saçın kendi ışığını/derinliğini korur, yalnız tonu verir;
    // "çarpma" koyuluk, açık tonlarda "yumuşak ışık" açma. Piksel bazlı oran/ten ayıklama denemeleri koyu
    // saçta yapay sonuç verdi; kurucu bu sürümü daha doğal buldu.
    const a = look.hairAmount;
    const mask = hairMaskCanvas(face.hair);
    if (hair.lift) blend(ctx, tint(mask, "#FFFFFF"), "soft-light", hair.lift * a * 2, w, h);
    blend(ctx, tint(mask, hair.hex), "color", 0.85 * a, w, h);
    blend(ctx, tint(mask, hair.hex), "multiply", hair.depth * a, w, h);
  }

  // Ten (fondöten, kapatıcı, kontür, aydınlatıcı) göz/dudak makyajından önce.
  renderBase(out, ctx, face, look, w, h);

  const m = look.makeupAmount;
  const shadow = findShade(SHADOW_SHADES, look.shadow);
  if (shadow) {
    // Göz bölgesi küçük: düşük ölçekte kaybolur; yarım ölçek + iki geçiş (yumuşak kenar, belirgin renk).
    const L = layer(w, h, 0.5, (c) => {
      soften(c, fw * 0.01);
      for (const eye of EYES) {
        const poly = shadowPolygon(pts, eye, 0.6);
        const n = poly.length / 2;
        const [lx, ly] = centroid(poly.slice(0, n));
        const [tx, ty] = centroid(poly.slice(n));
        // Kirpik dibinde yoğun, kaşa doğru sönen geçiş (şerit gibi durmasın).
        const g = c.createLinearGradient(lx, ly, tx + (tx - lx) * 0.4, ty + (ty - ly) * 0.4);
        g.addColorStop(0, `${shadow.hex}FF`);
        g.addColorStop(0.55, `${shadow.hex}99`);
        g.addColorStop(1, `${shadow.hex}00`);
        c.fillStyle = g;
        c.beginPath();
        polygon(c, poly);
        c.fill();
      }
    });
    blend(ctx, L, "multiply", 0.7 * m, w, h);
    blend(ctx, L, "soft-light", 0.4 * m, w, h);
  }

  const blush = findShade(BLUSH_SHADES, look.blush);
  if (blush) {
    // Elmacık kemiğine doğru yatay elips; merkezden dışa yumuşak sönüm.
    const r = fw * 0.12;
    const L = layer(w, h, 0.25, (c) => {
      soften(c, fw * 0.01);
      for (const [x, y] of pick(pts, CHEEKS)) {
        c.save();
        c.translate(x, y - r * 0.15);
        c.scale(1, 0.72);
        const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, `${blush.hex}E6`);
        g.addColorStop(0.55, `${blush.hex}73`);
        g.addColorStop(1, `${blush.hex}00`);
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, r, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    });
    blend(ctx, L, "multiply", 0.35 * look.sculptAmount * 1.25, w, h);
    blend(ctx, L, "soft-light", 0.3 * look.sculptAmount * 1.25, w, h);
  }

  const brow = findShade(BROW_SHADES, look.brow);
  if (brow) {
    // Yalnız kaş kılları renklenir (+ hafif kalem dolgusu); ten boyanmaz.
    const mask = cached(browCache, face, w, h, () =>
      hairlineMask(
        base,
        w,
        h,
        BROWS.map((b) => browPolygon(pts, b)),
        fw * 0.006,
        0.2,
      ),
    );
    const a = look.browAmount;
    if (brow.lift) blend(ctx, tint(mask, "#FFFFFF"), "soft-light", brow.lift * a * 2, w, h);
    blend(ctx, tint(mask, brow.hex), "color", 0.85 * a, w, h);
    blend(ctx, tint(mask, brow.hex), "multiply", (0.2 + 0.8 * brow.depth) * a, w, h);
  }

  if (look.liner) {
    const L = layer(w, h, 1, (c) => {
      c.strokeStyle = "#2B1D24";
      c.lineWidth = Math.max(2, fw * 0.011);
      c.lineJoin = "round";
      c.lineCap = "round";
      for (const eye of EYES) {
        const p = linerPath(pts, eye);
        c.beginPath();
        c.moveTo(p[0][0], p[0][1]);
        for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
        c.stroke();
      }
    });
    blend(ctx, L, "multiply", Math.min(1, 0.95 * m + 0.2), w, h);
  }

  const lash = findShade(LASH_SHADES, look.lash);
  if (lash) {
    const v = look.lashAmount; // hacim / uzunluk
    // 1) Mevcut kirpikler: kapak çizgisinin hemen üstündeki koyu pikseller maskara rengiyle koyulaşır.
    const band = cached(lashCache, face, w, h, () =>
      hairlineMask(
        base,
        w,
        h,
        EYES.map((eye) => {
          const lid = pick(pts, eye.lid);
          return [
            ...lid,
            ...lashStrokes(pts, eye, lid.length, 0.9)
              .map((s) => s.to)
              .reverse(),
          ];
        }),
        fw * 0.003,
        0.1,
      ),
    );
    blend(ctx, tint(band, lash.hex), "multiply", 0.55 + 0.4 * v, w, h);
    // 2) Kıvrık teller: dipte kalın, uca doğru incelir (üç parça); dış köşede uzun ve dışa açık.
    const L = layer(w, h, 1, (c) => {
      c.strokeStyle = lash.hex;
      c.lineCap = "round";
      const base = Math.max(0.9, fw * 0.003 * (0.8 + 0.5 * v));
      for (const eye of EYES) {
        for (const s of lashStrokes(pts, eye, 24, 0.75 + 0.55 * v)) {
          const at = (u: number): Pt => [
            (1 - u) ** 2 * s.from[0] + 2 * (1 - u) * u * s.ctrl[0] + u ** 2 * s.to[0],
            (1 - u) ** 2 * s.from[1] + 2 * (1 - u) * u * s.ctrl[1] + u ** 2 * s.to[1],
          ];
          const marks = [0, 0.35, 0.7, 1].map(at);
          [1, 0.65, 0.35].forEach((k, i) => {
            c.lineWidth = Math.max(0.5, base * k);
            c.beginPath();
            c.moveTo(marks[i][0], marks[i][1]);
            c.lineTo(marks[i + 1][0], marks[i + 1][1]);
            c.stroke();
          });
        }
      }
    });
    blend(ctx, L, "multiply", Math.min(1, 0.55 + 0.45 * v), w, h);
  }

  const lip = findShade(LIP_SHADES, look.lip);
  if (lip) {
    const a = look.lipAmount;
    const L = layer(w, h, 0.5, (c) => {
      soften(c, fw * 0.003);
      c.fillStyle = lip.hex;
      c.beginPath();
      polygon(c, pick(pts, LIPS_OUTER));
      polygon(c, pick(pts, LIPS_INNER));
      c.fill("evenodd");
    });
    blend(ctx, L, "color", 0.9 * a, w, h);
    blend(ctx, L, "multiply", lip.depth * a, w, h);
    blend(ctx, L, "soft-light", 0.25 * a, w, h);
  }
}
