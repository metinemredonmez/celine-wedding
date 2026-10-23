/**
 * Yüz ve saç tespiti (MediaPipe, Apache-2.0) — TAMAMEN tarayıcıda. Fotoğraf sunucuya gönderilmez;
 * yalnız model dosyaları bir kez indirilir (wasm kendi sunucumuzdan, modeller Google'ın genel
 * deposundan). Kütüphane yalnız "Sen de dene" kullanılınca yüklenir (sayfa açılışını yavaşlatmaz).
 */

import type { FaceData, HairMask } from "./render";

const WASM_BASE = "/mediapipe/wasm";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const HAIR_MODEL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite";

type Models = {
  face: import("@mediapipe/tasks-vision").FaceLandmarker;
  hair: import("@mediapipe/tasks-vision").ImageSegmenter;
};

let models: Promise<Models> | null = null;

export function loadModels(): Promise<Models> {
  models ??= (async () => {
    const { FilesetResolver, FaceLandmarker, ImageSegmenter } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    const [face, hair] = await Promise.all([
      FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: "CPU" },
        runningMode: "IMAGE",
        numFaces: 1,
      }),
      ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: HAIR_MODEL, delegate: "CPU" },
        runningMode: "IMAGE",
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      }),
    ]);
    return { face, hair };
  })().catch((err) => {
    models = null; // ağ hatasında yeniden denenebilsin
    throw err;
  });
  return models;
}

/** Olasılığı yumuşak eşikle alfaya çevirir (kenarlarda sert kesim olmasın). */
export function hairAlpha(prob: Float32Array): Uint8ClampedArray {
  const out = new Uint8ClampedArray(prob.length);
  for (let i = 0; i < prob.length; i++) {
    const v = (prob[i] - 0.2) / 0.6;
    out[i] = v <= 0 ? 0 : v >= 1 ? 255 : Math.round(v * 255);
  }
  return out;
}

/** Yüz bulunamazsa null. */
export async function analyzeFace(image: HTMLCanvasElement): Promise<FaceData | null> {
  const { face, hair } = await loadModels();
  const lm = face.detect(image).faceLandmarks[0];
  if (!lm) return null;
  const points = lm.map((p) => [p.x * image.width, p.y * image.height] as const);

  let mask: HairMask | null = null;
  const seg = hair.segment(image);
  try {
    const masks = seg.confidenceMasks ?? [];
    const m = masks[masks.length - 1]; // son sınıf: saç
    if (m) mask = { width: m.width, height: m.height, alpha: hairAlpha(m.getAsFloat32Array()) };
  } finally {
    seg.close();
  }
  return { points, hair: mask };
}
