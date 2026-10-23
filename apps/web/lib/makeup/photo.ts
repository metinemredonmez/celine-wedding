/**
 * Fotoğrafı yalnız bellekte bir canvas'a çizer (en uzun kenar 1080 px). Hiçbir yere yüklenmez,
 * kaydedilmez; sayfadan çıkınca kaybolur.
 */

import type { Pt } from "./face";
import type { FaceData, HairMask } from "./render";

/**
 * Demo mankenleri (Pexels lisansı; ticari kullanım + düzenleme serbest, fotoğrafçı sayfada anılır).
 * Gerçek kişiler: uydurma isim verilmez, yalnız görünüm tanımı. Her biri için yüz noktaları + saç maskesi
 * önceden hesaplanmıştır (`/makeup/models/<id>.json`); demo model indirmeden anında açılır.
 * hair=false: saç görünmüyor (ör. eşarp) — saç boyama bu modelde kapalı.
 */
export type DemoModel = { id: string; label: string; credit: string; hair: boolean };

export const MODELS: DemoModel[] = [
  { id: "bun", label: "Topuz", credit: "Sound On", hair: true },
  { id: "straight", label: "Düz sarı saç", credit: "Michelle Leman", hair: true },
  { id: "wavy", label: "Dalgalı kahve saç", credit: "ehsan ahmadnejad", hair: true },
  { id: "curly", label: "Kıvırcık saç", credit: "Betül Üstün", hair: true },
  { id: "hijab", label: "Tesettür", credit: "Fariz Hermawan", hair: false },
  { id: "asian", label: "Toplu siyah saç", credit: "seesouk souvannaphongsay", hair: true },
  { id: "afro", label: "Afro saç", credit: "Kadiatou Baldé", hair: true },
  { id: "closeup", label: "Yakın plan", credit: "Bruno Curly", hair: true },
  { id: "mature", label: "Olgun cilt", credit: "Kindel Media", hair: true },
];

/** Topuz: gelin saçına en yakın örnek. */
export const DEFAULT_MODEL = "bun";

export function modelById(id: string): DemoModel {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}

export const modelImage = (id: string) => `/makeup/models/${modelById(id).id}.jpg`;

const MAX_SIDE = 1080;

function toCanvas(src: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const s = Math.min(1, MAX_SIDE / Math.max(width, height));
  const c = document.createElement("canvas");
  c.width = Math.round(width * s);
  c.height = Math.round(height * s);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image_load_failed"));
    img.src = url;
  });
}

/** Orijinal ölçü (kontrol için) + işlenecek, oranı korunmuş küçültülmüş kopya. */
export type Photo = { image: HTMLCanvasElement; width: number; height: number };

/** Kod çözme belleği için üst sınır: 48 MP bir telefon fotoğrafı bile bunun altında kalır. */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export async function photoFromFile(file: File): Promise<Photo> {
  if (!file.type.startsWith("image/")) throw new Error("not_an_image");
  if (file.size > MAX_FILE_BYTES) throw new Error("file_too_large");
  try {
    const bmp = await createImageBitmap(file); // EXIF yönü uygulanır
    try {
      return { image: toCanvas(bmp, bmp.width, bmp.height), width: bmp.width, height: bmp.height };
    } finally {
      bmp.close();
    }
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const { naturalWidth: width, naturalHeight: height } = img;
      return { image: toCanvas(img, width, height), width, height };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

type SampleJson = {
  width: number;
  height: number;
  points: number[];
  hair?: { width: number; height: number; png: string } | null;
};

async function maskFromPng(url: string, width: number, height: number): Promise<HairMask> {
  const img = await loadImage(url);
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  const px = ctx.getImageData(0, 0, width, height).data;
  const alpha = new Uint8ClampedArray(width * height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = px[i * 4]; // gri tonlama: kırmızı kanal = olasılık
  return { width, height, alpha };
}

/** Örnek yüz: önce hazır veri, yoksa tarayıcıda tespit (analyze verilir). */
export async function loadSample(
  analyze: (image: HTMLCanvasElement) => Promise<FaceData | null>,
  modelId: string = DEFAULT_MODEL,
): Promise<{ image: HTMLCanvasElement; face: FaceData | null }> {
  const model = modelById(modelId);
  const img = await loadImage(modelImage(model.id));
  const image = toCanvas(img, img.naturalWidth, img.naturalHeight);
  try {
    const res = await fetch(`/makeup/models/${model.id}.json`);
    if (res.ok) {
      const d = (await res.json()) as SampleJson;
      const sx = image.width / d.width;
      const sy = image.height / d.height;
      const points: Pt[] = [];
      for (let i = 0; i + 1 < d.points.length; i += 2) points.push([d.points[i] * sx, d.points[i + 1] * sy]);
      const hair =
        d.hair && model.hair ? await maskFromPng(d.hair.png, d.hair.width, d.hair.height) : null;
      return { image, face: { points, hair } };
    }
  } catch {
    // hazır veri yoksa canlı tespit
  }
  return { image, face: await analyze(image) };
}
