// Celine Gelinlik — seçili gerçek stüdyo görselleri.
//
// public/gelinlikler/ altındaki 34 fotoğraftan elle seçilmiş kareler.
// Amaç: hero, "Hikâyemiz" ve koleksiyon kapakları DB boş/eksik olsa bile
// site DOLU ve GERÇEK görünsün. Admin'den kapak atandığında DB değeri
// bunların önüne geçer (collectionCover'a bakın).

/** Hero arka planı — tam boy dantel A-kesim, çiçekli stüdyo çekimi. */
export const HERO_IMAGE = "/gelinlikler/m01-7.jpg";

/** "Hikâyemiz" bölümü — korse sırt detayı (Seda Dönmez filigranlı). */
export const STORY_IMAGE = "/gelinlikler/m01-4.jpg";

/**
 * Koleksiyon kartları için sıra bazlı kapak yedeği.
 * 0: Dantel · 1: Saten · 2: Modern — DB'de coverImage yoksa devreye girer.
 */
export const COLLECTION_COVERS = [
  "/gelinlikler/m02-1.jpg", // dantel — tam boy dantel siluet
  "/gelinlikler/m01-1.jpg", // saten — inci işlemeli korsaj
  "/gelinlikler/m10-1.jpg", // modern — sade krep, çağdaş kesim
];

/**
 * DB kapağı varsa onu, yoksa sıraya göre gerçek bir foto döndürür.
 * Böylece koleksiyon kartları asla boş "CELINE" placeholder'ına düşmez.
 */
export function collectionCover(
  coverImage: string | null | undefined,
  index: number,
): string {
  if (coverImage && coverImage.trim().length > 0) return coverImage;
  return COLLECTION_COVERS[index % COLLECTION_COVERS.length];
}
