// Celine Admin — tek görsel yükleme (imzalı Cloudinary akışı).
// Akış: POST media/sign (imza; secret sunucuda) → tarayıcıdan Cloudinary'e direkt
// yükleme → secure_url. Gelinlik görsellerinden bağımsız; içerik görselleri için de kullanılır.

import { adminPost } from "./admin-api";
import type { SignedUpload } from "./admin-types";

const MAX_FILE_MB = 15;

export type UploadedImage = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
};

export async function uploadImage(
  file: File,
  folder = "celine/content",
): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Desteklenmeyen dosya türü (görsel bekleniyor).");
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`Dosya ${MAX_FILE_MB} MB sınırını aşıyor.`);
  }

  // 1) İmza al (Cloudinary secret sunucuda kalır)
  const sign = await adminPost<SignedUpload>("media/sign", { folder });

  // 2) Tarayıcıdan Cloudinary'e direkt yükle
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", String(sign.timestamp));
  fd.append("signature", sign.signature);
  fd.append("folder", sign.folder);

  let res: Response;
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
      { method: "POST", body: fd },
    );
  } catch {
    throw new Error("Cloudinary'e ulaşılamadı.");
  }
  if (!res.ok) {
    let msg = "Cloudinary yüklemesi reddedildi.";
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body?.error?.message) msg = body.error.message;
    } catch {
      // gövde okunamadı — genel mesaj
    }
    throw new Error(msg);
  }
  const up = (await res.json()) as {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
  };
  return {
    url: up.secure_url,
    publicId: up.public_id,
    width: up.width,
    height: up.height,
  };
}
