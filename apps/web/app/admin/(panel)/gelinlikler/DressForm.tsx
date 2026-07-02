"use client";

// Celine Admin — Gelinlik formu (oluşturma + düzenleme ortak).
// Oluşturmada POST /dresses → görsellerin eklendiği editöre yönlendirir;
// düzenlemede PATCH /dresses/:id → onSaved ile üst bileşeni tazeler.

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminApiError, adminGet, adminPatch, adminPost } from "@/lib/admin-api";
import {
  DRESS_STATUS_LABELS,
  type AdminCollection,
  type AdminDress,
  type DressInput,
} from "@/lib/admin-types";
import {
  Badge,
  Card,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/admin/ui";
import { Toggle, useToast } from "@/components/admin/ui-client";
import { Button } from "@/components/ui/Button";

// API'deki Türkçe-duyarlı slugify'ın birebir istemci kopyası
// (apps/api/src/common/utils/slugify.ts) — önizleme sunucuyla aynı olsun.
const TR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

function slugifyTr(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[çğıİöşü]/g, (ch) => TR_MAP[ch] ?? ch)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

type DressFormProps = {
  /** düzenleme modunda mevcut gelinlik; verilmezse oluşturma modu */
  initial?: AdminDress;
  /** PATCH sonrası güncel kaydı üst bileşene bildirir (başlık/slug tazelenir) */
  onSaved?: (dress: AdminDress) => void;
};

export function DressForm({ initial, onSaved }: DressFormProps) {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  // Düzenlemede mevcut slug korunur (ad değişse de URL bozulmasın);
  // oluşturmada kullanıcı elle yazana kadar addan otomatik türetilir.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fabric, setFabric] = useState(initial?.fabric ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [collectionId, setCollectionId] = useState(initial?.collectionId ?? "");
  const [published, setPublished] = useState(initial?.status === "PUBLISHED");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const [collections, setCollections] = useState<AdminCollection[] | null>(null);
  const [collectionsFailed, setCollectionsFailed] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminGet<AdminCollection[]>("collections/admin/all")
      .then((data) => {
        if (!cancelled) setCollections(data);
      })
      .catch(() => {
        if (!cancelled) setCollectionsFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugifyTr(value));
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    // tamamen silinirse otomatik türetme yeniden devreye girer
    setSlugTouched(value.trim() !== "");
  }

  const previewSlug = slugifyTr(slug || name);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setNameError("Ad en az 2 karakter olmalı.");
      return;
    }
    setNameError(null);
    setError(null);
    setSaving(true);

    const body: DressInput = {
      name: trimmedName,
      status: published ? "PUBLISHED" : "DRAFT",
      featured,
    };
    const trimmedSlug = slug.trim();
    if (trimmedSlug) body.slug = slugifyTr(trimmedSlug);
    // Koleksiyon listesi yüklenemediyse alana dokunma (yanlışlıkla
    // koleksiyonsuz bırakmayalım); yüklendiyse "" → null (koleksiyonsuz).
    if (collections !== null) body.collectionId = collectionId || null;
    if (initial) {
      // düzenlemede boş bırakılan alanlar temizlenebilsin
      body.description = description.trim();
      body.fabric = fabric.trim();
      body.details = details.trim();
    } else {
      if (description.trim()) body.description = description.trim();
      if (fabric.trim()) body.fabric = fabric.trim();
      if (details.trim()) body.details = details.trim();
    }

    try {
      if (initial) {
        const saved = await adminPatch<AdminDress>(
          `dresses/${initial.id}`,
          body,
        );
        setName(saved.name);
        setSlug(saved.slug);
        setSlugTouched(true);
        toast.show("Değişiklikler kaydedildi.");
        onSaved?.(saved);
        setSaving(false);
      } else {
        const created = await adminPost<AdminDress>("dresses", body);
        toast.show("Gelinlik oluşturuldu. Şimdi görsellerini ekleyebilirsiniz.");
        router.replace(`/admin/gelinlikler/${created.id}`);
        // yönlendirme sürerken buton kilitli kalsın
      }
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? err.message
          : "Kaydedilemedi. Lütfen tekrar deneyin.",
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card title="Model Bilgileri">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ad" htmlFor="dress-name" required error={nameError}>
              <Input
                id="dress-name"
                value={name}
                invalid={Boolean(nameError)}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Örn. Vera"
                autoFocus={!initial}
              />
            </Field>
            <Field
              label="Bağlantı (slug)"
              htmlFor="dress-slug"
              hint={`celinegelinlik.com/modeller/${previewSlug || "…"}`}
            >
              <Input
                id="dress-slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="addan otomatik oluşur"
              />
            </Field>
          </div>

          <Field
            label="Açıklama"
            htmlFor="dress-description"
            hint="Model sayfasında görünen kısa tanıtım."
          >
            <Textarea
              id="dress-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu modelin hikâyesi…"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Kumaş" htmlFor="dress-fabric">
              <Input
                id="dress-fabric"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="Örn. İpek şifon"
              />
            </Field>
            <Field
              label="Koleksiyon"
              htmlFor="dress-collection"
              error={
                collectionsFailed
                  ? "Koleksiyon listesi yüklenemedi; bu alan şimdilik değiştirilemez."
                  : undefined
              }
            >
              {collections === null ? (
                <Select id="dress-collection" disabled value="">
                  <option value="">
                    {collectionsFailed
                      ? (initial?.collection?.name ?? "—")
                      : "Yükleniyor…"}
                  </option>
                </Select>
              ) : (
                <Select
                  id="dress-collection"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                >
                  <option value="">Koleksiyonsuz</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field
            label="Detaylar"
            htmlFor="dress-details"
            hint="Kesim, kuyruk, işleme gibi ayrıntılar."
          >
            <Textarea
              id="dress-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="A kesim, şapel kuyruk…"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Durum" hint="Taslaklar sitede görünmez.">
              <div className="flex h-11 items-center gap-3">
                <Toggle
                  checked={published}
                  onChange={setPublished}
                  label="Yayında"
                />
                <Badge tone={published ? "success" : "neutral"}>
                  {DRESS_STATUS_LABELS[published ? "PUBLISHED" : "DRAFT"]}
                </Badge>
              </div>
            </Field>
            <Field label="Öne Çıkan" hint="Ana sayfadaki vitrinde gösterilir.">
              <div className="flex h-11 items-center">
                <Toggle
                  checked={featured}
                  onChange={setFeatured}
                  label="Öne çıkan"
                  showLabel
                />
              </div>
            </Field>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-[2px] bg-[#f4dcdc] px-3.5 py-2.5 text-sm text-[#8c3232]"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" disabled={saving} className="sm:min-w-44">
              {saving
                ? "Kaydediliyor…"
                : initial
                  ? "Kaydet"
                  : "Oluştur ve Devam Et"}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
