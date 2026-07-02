"use client";

// Celine Admin — Gelinlik düzenleme. Kaydı yükler → DressForm (düzenleme modu)
// + ImageManager (görsel ekle/sırala/sil). "Oluştur ve Devam Et" akışı da buraya döner.

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminApiError, adminGet } from "@/lib/admin-api";
import type { AdminDress, AdminImage } from "@/lib/admin-types";
import { DressForm } from "../DressForm";
import { ImageManager } from "../ImageManager";

export default function EditDressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [dress, setDress] = useState<AdminDress | null>(null);
  const [images, setImages] = useState<AdminImage[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminGet<AdminDress>(`dresses/admin/${id}`)
      .then((d) => {
        if (cancelled) return;
        setDress(d);
        setImages(d.images ?? []);
        setName(d.name);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof AdminApiError
            ? err.message
            : "Gelinlik yüklenemedi. Lütfen tekrar deneyin.",
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/gelinlikler"
          className="u-label inline-flex min-h-11 items-center gap-1.5 text-faint transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} strokeWidth={2} aria-hidden />
          Gelinlikler
        </Link>
        <h1 className="font-display text-3xl">{name || "Gelinlik Düzenle"}</h1>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : error ? (
        <p
          role="alert"
          className="rounded-[2px] bg-[#f4dcdc] px-3.5 py-2.5 text-sm text-[#8c3232]"
        >
          {error}
        </p>
      ) : dress ? (
        <>
          <DressForm initial={dress} onSaved={(d) => setName(d.name)} />
          <ImageManager
            dressId={dress.id}
            dressName={name}
            images={images}
            onChange={setImages}
          />
        </>
      ) : null}
    </div>
  );
}
