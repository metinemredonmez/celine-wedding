"use client";

// Celine Admin — İçerik: sol bölüm menüsü + sağ panel (sekmeli, tam genişlik).
// Alanlar lib/content.ts'deki CONTENT_REGISTRY'den üretilir; tüm bölümlerin
// düzenlemeleri tek form state'te tutulur, tek "Kaydet" hepsini gönderir.

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
import { cn } from "@/lib/utils";

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
  const groups = useMemo(() => contentGroups(), []);

  const [saved, setSaved] = useState<Form | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<string>(groups[0]?.group ?? "");

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

  // Hangi bölümlerde kaydedilmemiş değişiklik var (nav'da nokta göstergesi).
  const dirtyGroups = useMemo(() => {
    const set = new Set<string>();
    if (!saved || !form) return set;
    for (const f of CONTENT_REGISTRY) {
      if (form[f.key] !== saved[f.key]) set.add(f.group);
    }
    return set;
  }, [saved, form]);

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
  const activeGroup = groups.find((g) => g.group === active) ?? groups[0];

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="font-display text-3xl">İçerik</h1>
        <p className="mt-1 text-sm text-muted">
          Soldan bir bölüm seçin, sağdaki metin ve görselleri düzenleyin. Bir
          alanı boşaltıp kaydederseniz o alan varsayılan (fabrika) haline döner.
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

      {form && activeGroup && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Sol: bölüm menüsü (mobilde yatay kaydırılır) */}
          <nav
            aria-label="İçerik bölümleri"
            className="lg:w-64 lg:shrink-0"
          >
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
              {groups.map((g) => {
                const isActive = g.group === active;
                return (
                  <li key={g.group} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => setActive(g.group)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-[2px] px-3.5 py-2.5 text-left text-sm transition-colors lg:whitespace-normal",
                        isActive
                          ? "bg-ink text-cream"
                          : "text-muted hover:bg-powder hover:text-ink",
                      )}
                    >
                      <span className={cn(isActive && "font-medium")}>
                        {g.group}
                      </span>
                      {dirtyGroups.has(g.group) ? (
                        <span
                          aria-label="kaydedilmemiş"
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            isActive ? "bg-cream" : "bg-rose",
                          )}
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sağ: seçili bölümün alanları */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="min-w-0 flex-1 space-y-6"
          >
            <Card title={activeGroup.group}>
              <div className="space-y-5">
                {activeGroup.fields.map((f) => {
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

            {/* Kaydet çubuğu — yapışkan; tüm bölümlerdeki değişiklikleri kaydeder */}
            <div className="sticky bottom-16 z-40 md:bottom-2">
              <div className="flex items-center justify-between gap-3 rounded-[2px] border border-ink/10 bg-cream/95 px-4 py-3 shadow-[0_10px_30px_-18px_rgba(51,44,40,0.5)] backdrop-blur">
                <p className="text-xs text-muted">
                  {dirty
                    ? `${dirtyKeys.length} değişiklik kaydedilmedi`
                    : "Tüm değişiklikler kaydedildi"}
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
        </div>
      )}
    </div>
  );
}
