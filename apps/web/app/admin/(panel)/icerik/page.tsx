"use client";

// Celine Admin — İçerik: sitedeki metin ve görselleri düzenler.
// Alanlar lib/content.ts'deki CONTENT_REGISTRY'den üretilir; kaydedilmemiş
// alanlar sitede varsayılan haliyle görünür. Kaydet → PATCH /content.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { adminGet, adminPatch, AdminApiError } from "@/lib/admin-api";
import type { ContentMap } from "@/lib/admin-types";
import { CONTENT_REGISTRY, contentGroups } from "@/lib/content";
import { Card, Field, Input, Textarea } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { useToast } from "@/components/admin/ui-client";
import { Button } from "@/components/ui/Button";

type Form = Record<string, string>;

/** DB haritasını forma çevir: değer yoksa registry varsayılanı gösterilir. */
function fromMap(map: ContentMap): Form {
  const form: Form = {};
  for (const field of CONTENT_REGISTRY) {
    const v = map[field.key];
    form[field.key] = typeof v === "string" && v.length > 0 ? v : field.default;
  }
  return form;
}

export default function AdminContentPage() {
  const toast = useToast();

  const [saved, setSaved] = useState<Form | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoadError(null);
    setSaved(null);
    setForm(null);
    adminGet<ContentMap>("content")
      .then((map) => {
        const state = fromMap(map ?? {});
        setSaved(state);
        setForm(state);
      })
      .catch(() => setLoadError("İçerik yüklenemedi. Lütfen tekrar deneyin."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirtyKeys = useMemo(() => {
    if (!saved || !form) return [];
    return CONTENT_REGISTRY.map((f) => f.key).filter((k) => form[k] !== saved[k]);
  }, [saved, form]);
  const dirty = dirtyKeys.length > 0;

  function set(key: string, value: string) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form || saving || !dirty) return;

    setSaving(true);
    try {
      const items = dirtyKeys.map((k) => ({ key: k, value: form[k] }));
      const updated = await adminPatch<ContentMap>("content", { items });
      const state = fromMap(updated);
      setSaved(state);
      setForm(state);
      toast.show(
        "Kaydedildi. Değişiklikler sitede birkaç dakika içinde görünür.",
      );
    } catch (err) {
      toast.show(
        err instanceof AdminApiError && err.status !== 401
          ? err.message
          : "Kaydedilemedi. Lütfen tekrar deneyin.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  const loading = !form && !loadError;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div>
        <h1 className="font-display text-3xl">İçerik</h1>
        <p className="mt-1 text-sm text-muted">
          Sitedeki metin ve görselleri buradan düzenleyin. Bir alanı boşaltıp
          kaydederseniz o alan varsayılan (fabrika) haline döner.
        </p>
      </div>

      {loading && (
        <Card>
          <div className="py-10 text-center text-sm text-muted">Yükleniyor…</div>
        </Card>
      )}

      {loadError && (
        <Card>
          <div className="py-8 text-center">
            <p className="text-sm text-[#8c3232]">{loadError}</p>
            <div className="mt-5 flex justify-center">
              <Button variant="outline" size="sm" onClick={load}>
                Tekrar Dene
              </Button>
            </div>
          </div>
        </Card>
      )}

      {form && (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {contentGroups().map(({ group, fields }) => (
            <Card key={group} title={group}>
              <div className="space-y-5">
                {fields.map((f) => {
                  const fid = `c-${f.key.replace(/\./g, "-")}`;
                  return (
                    <Field key={f.key} label={f.label} htmlFor={fid} hint={f.hint}>
                      {f.type === "textarea" ? (
                        <Textarea
                          id={fid}
                          rows={f.key.endsWith(".body") ? 6 : 3}
                          value={form[f.key] ?? ""}
                          onChange={(e) => set(f.key, e.target.value)}
                        />
                      ) : f.type === "image" ? (
                        <ImageField
                          id={fid}
                          value={form[f.key] ?? ""}
                          onChange={(url) => set(f.key, url)}
                        />
                      ) : (
                        <Input
                          id={fid}
                          value={form[f.key] ?? ""}
                          onChange={(e) => set(f.key, e.target.value)}
                        />
                      )}
                    </Field>
                  );
                })}
              </div>
            </Card>
          ))}

          {/* Kaydet çubuğu — yapışkan; mobil alt navı geçecek şekilde. */}
          <div className="sticky bottom-16 z-40 md:bottom-2">
            <div className="flex items-center justify-between gap-3 rounded-[2px] border border-ink/10 bg-cream/95 px-4 py-3 shadow-[0_10px_30px_-18px_rgba(51,44,40,0.5)] backdrop-blur">
              <p className="text-xs text-muted">
                {dirty
                  ? `${dirtyKeys.length} değişiklik kaydedilmedi.`
                  : "Tüm değişiklikler kaydedildi."}
              </p>
              <Button
                type="submit"
                size="sm"
                disabled={!dirty || saving}
                className="min-w-40"
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
