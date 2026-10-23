/**
 * MediaPipe yüz ağı (478 nokta) üzerinden makyaj bölgeleri. Noktalar piksel koordinatındadır.
 * İndeksler MediaPipe Face Mesh topolojisinden (dudak dış/iç çevresi, üst göz kapağı, kaş alt çizgisi).
 */

export type Pt = readonly [number, number];

export const LIPS_OUTER = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
];
export const LIPS_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
];

/** Üst göz kapağı dış köşeden iç köşeye; kaşın alt çizgisi. */
export const EYES = [
  { lid: [33, 246, 161, 160, 159, 158, 157, 173, 133], brow: [46, 53, 52, 65, 55] },
  { lid: [263, 466, 388, 387, 386, 385, 384, 398, 362], brow: [276, 283, 282, 295, 285] },
] as const;

export const CHEEKS = [50, 280] as const;
const FACE_EDGES = [234, 454] as const;

export const pick = (points: readonly Pt[], idx: readonly number[]): Pt[] => idx.map((i) => points[i]);

export function centroid(pts: readonly Pt[]): Pt {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p[0];
    y += p[1];
  }
  return [x / pts.length, y / pts.length];
}

export function faceWidth(points: readonly Pt[]): number {
  const [a, b] = FACE_EDGES.map((i) => points[i]);
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/**
 * Far bölgesi: üst kapak çizgisi + kaşa doğru kaldırılmış üst kenar (ortada en yüksek, köşelerde incelir).
 * Dönen çokgen kapak noktaları (dış→iç) ve ardından üst kenar (iç→dış).
 */
export function shadowPolygon(points: readonly Pt[], eye: (typeof EYES)[number], reach = 0.55): Pt[] {
  const lid = pick(points, eye.lid);
  const [bx, by] = centroid(pick(points, eye.brow));
  const [lx, ly] = centroid(lid);
  const ux = bx - lx;
  const uy = by - ly;
  const top = lid.map(([x, y], i) => {
    const t = i / (lid.length - 1);
    const k = reach * (0.3 + 0.7 * Math.sin(Math.PI * (0.12 + 0.88 * t))); // dış köşe biraz daha geniş
    return [x + ux * k, y + uy * k] as Pt;
  });
  return [...lid, ...top.reverse()];
}

/** Eyeliner: kapak çizgisi + dış köşede yukarı-dışa küçük kuyruk. */
export function linerPath(points: readonly Pt[], eye: (typeof EYES)[number]): Pt[] {
  const lid = pick(points, eye.lid);
  const [ox, oy] = lid[0];
  const [nx, ny] = lid[1];
  const fw = faceWidth(points);
  const dx = ox - nx;
  const dy = oy - ny;
  const len = Math.hypot(dx, dy) || 1;
  const wing: Pt = [ox + (dx / len) * fw * 0.035, oy + (dy / len) * fw * 0.035 - fw * 0.012];
  return [wing, ...lid];
}

/** Kaşlar: üst çizgi ve alt çizgi, ikisi de dış köşeden iç köşeye. */
export const BROWS = [
  { upper: [70, 63, 105, 66, 107], lower: [46, 53, 52, 65, 55] },
  { upper: [300, 293, 334, 296, 336], lower: [276, 283, 282, 295, 285] },
] as const;

/** Kaş çokgeni: üst çizgi (dış→iç) + alt çizgi (iç→dış). */
export function browPolygon(points: readonly Pt[], brow: (typeof BROWS)[number]): Pt[] {
  return [...pick(points, brow.upper), ...pick(points, brow.lower).reverse()];
}

export type Stroke = { from: Pt; ctrl: Pt; to: Pt };

function unit(x: number, y: number): Pt {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}

/** Kapak çizgisi üzerinde, yay uzunluğuna göre t (0 = dış köşe, 1 = iç köşe) noktası. */
function along(line: readonly Pt[], t: number): Pt {
  const seg = line.slice(1).map((p, i) => Math.hypot(p[0] - line[i][0], p[1] - line[i][1]));
  let rest = t * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (rest <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, rest / seg[i]) : 0;
      return [line[i][0] + (line[i + 1][0] - line[i][0]) * k, line[i][1] + (line[i + 1][1] - line[i][1]) * k];
    }
    rest -= seg[i];
  }
  return line[line.length - 1];
}

/**
 * Üst kirpik telleri (maskara): kapak çizgisi boyunca eşit aralıklı, yukarı kıvrık; dış köşede daha uzun
 * ve dışa açık, iç köşede kısa. length: hacim/uzunluk çarpanı (1 = doğal).
 */
export function lashStrokes(
  points: readonly Pt[],
  eye: (typeof EYES)[number],
  count = 26,
  length = 1,
): Stroke[] {
  const lid = pick(points, eye.lid);
  const fw = faceWidth(points);
  const [bx, by] = centroid(pick(points, eye.brow));
  const [lx, ly] = centroid(lid);
  const up = unit(bx - lx, by - ly);
  const out = unit(lid[0][0] - lid[lid.length - 1][0], lid[0][1] - lid[lid.length - 1][1]);
  return Array.from({ length: count }, (_, k) => {
    const t = (k + 0.5) / count;
    const outer = 1 - t;
    const base = along(lid, t);
    // Sabit (tohumlu) doğal varyasyon: her tel biraz farklı uzunluk/açıda; çizim her seferinde aynı.
    const j1 = Math.sin(k * 12.9898 + 4.1) * 0.5;
    const j2 = Math.sin(k * 78.233 + 1.7) * 0.5;
    const len = fw * (0.014 + 0.03 * outer ** 1.3) * length * (1 + 0.28 * j1);
    const flare = -0.2 + 1.15 * outer ** 1.4 + 0.14 * j2; // iç köşede hafif içe, dış köşede belirgin dışa
    const dir = unit(up[0] + out[0] * flare, up[1] + out[1] * flare);
    const to: Pt = [base[0] + dir[0] * len, base[1] + dir[1] * len];
    const ctrl: Pt = [
      base[0] + up[0] * len * 0.8 + out[0] * flare * len * 0.15,
      base[1] + up[1] * len * 0.8 + out[1] * flare * len * 0.15,
    ];
    return { from: base, ctrl, to };
  });
}

/** Yüz ovali (MediaPipe FACE_OVAL, saat yönünde alından başlayarak). */
export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149,
  150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];
/** Göz çevresi (tam kontur) — fondötenden hariç tutulur. */
export const EYE_RINGS = [
  [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466],
] as const;
/** Alt kapak (dış köşe → iç köşe): kapatıcı bölgesinin üst kenarı. */
export const LOWER_LIDS = [
  [33, 7, 163, 144, 145, 153, 154, 155, 133],
  [263, 249, 390, 373, 374, 380, 381, 382, 362],
] as const;
const MOUTH_CORNERS = [61, 291] as const;
const NOSE_BRIDGE = [6, 197, 195, 5] as const;

export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Göz altı (kapatıcı): alt kapak + aşağı kaydırılmış alt kenar; ortada en derin, köşelerde incelir. */
export function underEyePolygon(points: readonly Pt[], lid: readonly number[]): Pt[] {
  const top = pick(points, lid);
  const fw = faceWidth(points);
  const bottom = top.map(([x, y], i) => {
    const t = i / (top.length - 1);
    return [x, y + fw * (0.03 + 0.06 * Math.sin(Math.PI * t))] as Pt;
  });
  return [...top, ...bottom.reverse()];
}

/**
 * Kontür ve aydınlatıcı noktaları (yüz genişliğine göre). side 0 = görüntüde sol yüz yarısı (234 kenarı).
 * cheekHollow: elmacık altı çukuru boyunca kulaktan ağız köşesine doğru çizgi; cheekbone: elmacık tepesi.
 */
export function sculptPoints(points: readonly Pt[]) {
  const edges = [points[234], points[454]];
  const sides = [0, 1].map((side) => {
    const edge = edges[side];
    const mouth = points[MOUTH_CORNERS[side]];
    const eyeOuter = points[EYES[side].lid[0]];
    const cheek = points[CHEEKS[side]];
    return {
      cheekHollow: [lerp(edge, mouth, 0.06), lerp(edge, mouth, 0.5)] as [Pt, Pt],
      cheekbone: lerp(lerp(cheek, eyeOuter, 0.45), edge, 0.2),
      temple: lerp(points[side === 0 ? 54 : 284], eyeOuter, 0.25),
    };
  });
  return { sides, noseBridge: pick(points, NOSE_BRIDGE), cupid: points[0], chin: points[152] };
}
