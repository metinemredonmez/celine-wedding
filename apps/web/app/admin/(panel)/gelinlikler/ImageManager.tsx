"use client";

// Celine Admin — Gelinlik görsel yöneticisi.
// Akış: POST /media/sign (imza) → tarayıcıdan Cloudinary'e direkt upload →
// POST /dresses/:id/images (metadata). Sıralama oklarla (PATCH images/reorder),
// silme onay diyaloğuyla (DELETE). İlk görsel sitede kapaktır.

import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import {
  AdminApiError,
  adminDelete,
  adminPatch,
  adminPost,
} from "@/lib/admin-api";
import type { AdminImage, SignedUpload } from "@/lib/admin-types";
import { Badge, Card, EmptyState } from "@/components/admin/ui";
import { ConfirmDialog, useToast } from "@/components/admin/ui-client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const UPLOAD_FOLDER = "celine/dresses";
const MAX_FILE_MB = 15;

/** Cloudinary direkt upload yanıtından kullandığımız alanlar. */
type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
};

function IconButton({
  label,
  danger,
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"button"> & { label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-ink/15 bg-white text-ink",
        "transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-40",
        danger && "text-[#8c3232] hover:border-[#8c3232]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

type ImageManagerProps = {
  dressId: string;
  /** yüklenen görsellere alt metin olarak yazılır */
  dressName: string;
  images: AdminImage[];
  onChange: (images: AdminImage[]) => void;
};

export function ImageManager({
  dressId,
  dressName,
  images,
  onChange,
}: ImageManagerProps) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [toDelete, setToDelete] = useState<AdminImage | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─────────────────────────── Upload ───────────────────────────

  async function uploadOne(file: File): Promise<AdminImage> {
    if (!file.type.startsWith("image/")) {
      throw new Error("desteklenmeyen dosya türü");
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      throw new Error(`dosya ${MAX_FILE_MB} MB sınırını aşıyor`);
    }

    // 1) API'den imza al (Cloudinary secret sunucuda kalır)
    const sign = await adminPost<SignedUpload>("media/sign", {
      folder: UPLOAD_FOLDER,
    });

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
      throw new Error("Cloudinary'e ulaşılamadı");
    }
    if (!res.ok) {
      let msg = "Cloudinary yüklemesi reddedildi";
      try {
        const body = (await res.json()) as { error?: { message?: string } };
        if (body?.error?.message) msg = body.error.message;
      } catch {
        // gövde okunamadıysa genel mesajla devam
      }
      throw new Error(msg);
    }
    const uploaded = (await res.json()) as CloudinaryUploadResponse;

    // 3) Metadata'yı gelinliğe bağla
    return adminPost<AdminImage>(`dresses/${dressId}/images`, {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      alt: dressName,
      ...(uploaded.width ? { width: uploaded.width } : {}),
      ...(uploaded.height ? { height: uploaded.height } : {}),
    });
  }

  async function handleFiles(files: File[]) {
    if (files.length === 0 || uploading) return;
    setUploadError(null);
    setUploading({ done: 0, total: files.length });

    let current = images;
    let added = 0;
    const failures: string[] = [];
    let fatal: string | null = null;

    for (const file of files) {
      try {
        const img = await uploadOne(file);
        current = [...current, img];
        onChange(current);
        added += 1;
      } catch (err) {
        // İmza ucu 5xx dönerse Cloudinary büyük olasılıkla yapılandırılmamış —
        // kalan dosyaları denemeden zarifçe vazgeç.
        if (err instanceof AdminApiError && (err.status >= 500 || err.status === 0)) {
          fatal =
            "Görsel yükleme şu anda kullanılamıyor. Cloudinary ayarları eksik veya sunucuya ulaşılamıyor olabilir. Diğer bilgileri kaydetmeye devam edebilirsiniz.";
          break;
        }
        failures.push(
          `${file.name}${err instanceof Error && err.message ? ` (${err.message})` : ""}`,
        );
      } finally {
        setUploading((prev) =>
          prev ? { ...prev, done: prev.done + 1 } : prev,
        );
      }
    }

    setUploading(null);
    if (added > 0) {
      toast.show(added === 1 ? "Görsel eklendi." : `${added} görsel eklendi.`);
    }
    if (fatal) {
      setUploadError(fatal);
    } else if (failures.length > 0) {
      setUploadError(`Yüklenemedi: ${failures.join(" · ")}`);
    }
  }

  // ─────────────────────────── Sıralama ───────────────────────────

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (reordering || target < 0 || target >= images.length) return;

    const previous = images;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next); // iyimser güncelle

    setReordering(true);
    try {
      await adminPatch(`dresses/${dressId}/images/reorder`, {
        ids: next.map((img) => img.id),
      });
    } catch (err) {
      onChange(previous); // geri al
      toast.show(
        err instanceof AdminApiError
          ? err.message
          : "Sıralama kaydedilemedi. Lütfen tekrar deneyin.",
        "error",
      );
    } finally {
      setReordering(false);
    }
  }

  // ─────────────────────────── Silme ───────────────────────────

  async function confirmDelete() {
    if (!toDelete || deleting) return;
    setDeleting(true);
    try {
      await adminDelete(`dresses/${dressId}/images/${toDelete.id}`);
      onChange(images.filter((img) => img.id !== toDelete.id));
      toast.show("Görsel silindi.");
      setToDelete(null);
    } catch (err) {
      toast.show(
        err instanceof AdminApiError
          ? err.message
          : "Görsel silinemedi. Lütfen tekrar deneyin.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card
      title="Görseller"
      subtitle="İlk görsel sitede kapak fotoğrafı olarak kullanılır."
      action={
        <Button
          variant="outline"
          size="sm"
          disabled={Boolean(uploading)}
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus size={15} strokeWidth={1.75} aria-hidden />
          {uploading
            ? `Yükleniyor ${Math.min(uploading.done + 1, uploading.total)}/${uploading.total}…`
            : "Görsel Yükle"}
        </Button>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = ""; // aynı dosya yeniden seçilebilsin
          void handleFiles(files);
        }}
      />

      {uploadError && (
        <p
          role="alert"
          className="mb-4 rounded-[2px] bg-[#f4dcdc] px-3.5 py-2.5 text-sm text-[#8c3232]"
        >
          {uploadError}
        </p>
      )}

      {images.length === 0 ? (
        <EmptyState
          title="Henüz görsel yok"
          description="Sağ üstteki düğmeyle bir veya birden çok görsel yükleyin. İlk görsel kapak olur."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <li
              key={img.id}
              className="relative overflow-hidden rounded-[2px] border border-ink/10 bg-powder-deep"
            >
              <div className="aspect-[3/4]">
                {/* images:{unoptimized:true} — düz <img> yeterli */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt ?? dressName}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              {i === 0 && (
                <Badge tone="rose" className="absolute left-2 top-2 bg-cream/95">
                  Kapak
                </Badge>
              )}
              <div className="flex items-center justify-between gap-1 border-t border-ink/10 bg-cream px-2 py-1.5">
                <div className="flex gap-1">
                  <IconButton
                    label="Öne taşı"
                    disabled={i === 0 || reordering}
                    onClick={() => void move(i, -1)}
                  >
                    <ArrowUp size={16} strokeWidth={1.75} aria-hidden />
                  </IconButton>
                  <IconButton
                    label="Arkaya taşı"
                    disabled={i === images.length - 1 || reordering}
                    onClick={() => void move(i, 1)}
                  >
                    <ArrowDown size={16} strokeWidth={1.75} aria-hidden />
                  </IconButton>
                </div>
                <IconButton
                  label="Görseli sil"
                  danger
                  disabled={Boolean(uploading)}
                  onClick={() => setToDelete(img)}
                >
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Görsel silinsin mi?"
        description="Bu işlem geri alınamaz; görsel arşivden de kaldırılır."
        confirmLabel="Evet, Sil"
        danger
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          if (!deleting) setToDelete(null);
        }}
      />
    </Card>
  );
}
