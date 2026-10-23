/**
 * Yüklenen fotoğrafın ölçü ve kadraj kontrolü (cihazda). Makyaj katmanları yüz noktalarına göre
 * çizildiğinden ölçü kritik: küçük fotoğrafta dudak/göz birkaç piksele düşer, uzaktaki ya da yan
 * dönmüş yüzde bölgeler kayar. Engelleyen sorun yalnız "çok küçük"; diğerleri uyarıdır.
 */

import { faceWidth, type Pt } from "./face";

export const PHOTO_GUIDE = {
  minShort: 480, // altı reddedilir
  idealShort: 600, // önerilen: en az 600 × 800 (dikey 3:4)
  minFaceRatio: 0.28, // yüz genişliği / fotoğraf genişliği
  maxYaw: 0.14, // burun ucunun yüz ortasından sapması / yüz genişliği
  maxTiltDeg: 15, // göz çizgisinin eğimi
};

export type PhotoIssue = {
  code: "too_large" | "too_small" | "low_res" | "face_far" | "turned" | "tilted";
  text: string;
  blocking: boolean;
};

const NOSE_TIP = 1;
const FACE_LEFT = 234;
const FACE_RIGHT = 454;
const EYE_OUTER_R = 33;
const EYE_OUTER_L = 263;

export function sizeIssues(width: number, height: number): PhotoIssue[] {
  const short = Math.min(width, height);
  if (short < PHOTO_GUIDE.minShort) {
    return [
      {
        code: "too_small",
        text: `Fotoğraf çok küçük (${width}×${height}). En az ${PHOTO_GUIDE.idealShort}×800 piksel bir fotoğraf seçin.`,
        blocking: true,
      },
    ];
  }
  if (short < PHOTO_GUIDE.idealShort) {
    return [
      {
        code: "low_res",
        text: `Çözünürlük düşük (${width}×${height}); ayrıntılar yumuşak görünebilir.`,
        blocking: false,
      },
    ];
  }
  return [];
}

export function faceIssues(width: number, points: readonly Pt[]): PhotoIssue[] {
  const out: PhotoIssue[] = [];
  const fw = faceWidth(points);
  if (fw / width < PHOTO_GUIDE.minFaceRatio) {
    out.push({
      code: "face_far",
      text: "Yüz kadrajda küçük kalmış. Telefonu yaklaştırın; yüzünüz genişliğin en az üçte birini kaplasın.",
      blocking: false,
    });
  }
  const mid = (points[FACE_LEFT][0] + points[FACE_RIGHT][0]) / 2;
  if (Math.abs(points[NOSE_TIP][0] - mid) / fw > PHOTO_GUIDE.maxYaw) {
    out.push({ code: "turned", text: "Yüz yana dönük. Kameraya tam önden bakın.", blocking: false });
  }
  const [rx, ry] = points[EYE_OUTER_R];
  const [lx, ly] = points[EYE_OUTER_L];
  const tilt = Math.abs((Math.atan2(ly - ry, lx - rx) * 180) / Math.PI);
  if (Math.min(tilt, 180 - tilt) > PHOTO_GUIDE.maxTiltDeg) {
    out.push({
      code: "tilted",
      text: "Baş eğik. Başınızı dik tutun, telefonu göz hizasında tutun.",
      blocking: false,
    });
  }
  return out;
}
