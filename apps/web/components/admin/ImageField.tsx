"use client";

// Celine Admin — içerik görseli alanı: önizleme + Cloudinary yükleme + URL girişi.
// Değer bir görsel URL'idir; yükleme imzalı akışı (lib/admin-upload) kullanır.

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { uploadImage } from "@/lib/admin-upload";
import { Input } from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui-client";
import { Button } from "@/components/ui/Button";

export function ImageField({
  id,
  value,
  onChange,
  folder = "celine/content",
}: {
  id?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File) {
    setBusy(true);
    try {
      const up = await uploadImage(file, folder);
      onChange(up.url);
      toast.show("Görsel yüklendi.");
    } catch (err) {
      toast.show(
        err instanceof Error ? err.message : "Görsel yüklenemedi.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[2px] border border-ink/10 bg-powder-deep">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display absolute inset-0 flex items-center justify-center text-[0.55rem] tracking-[0.3em] text-rose/50">
            CELINE
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus size={15} strokeWidth={1.75} aria-hidden />
            {busy ? "Yükleniyor…" : "Görsel Yükle"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onChange("")}
            >
              <X size={15} strokeWidth={1.75} aria-hidden />
              Kaldır
            </Button>
          ) : null}
        </div>
        <Input
          id={id}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… (ya da yukarıdan yükle)"
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void pick(f);
        }}
      />
    </div>
  );
}
