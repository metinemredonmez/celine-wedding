"use client";

// Celine Admin — Site Ayarları: iletişim + site bilgileri formu.
// Veri: BFF proxy üzerinden GET/PATCH /api/admin/site-settings.
// Buradaki bilgiler sitenin footer'ında ve İletişim sayfasında görünür.

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { adminGet, adminPatch, AdminApiError } from "@/lib/admin-api";
import type { SiteSettings, SiteSettingsInput } from "@/lib/admin-types";
import { Card, Field, Input, Textarea } from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui-client";
import { Button } from "@/components/ui/Button";

// ─────────────────────────── Form durumu ───────────────────────────

type FormState = {
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  mapUrl: string;
  about: string;
};

const FORM_KEYS = [
  "phone",
  "whatsapp",
  "instagram",
  "address",
  "mapUrl",
  "about",
] as const;

function fromSettings(s: SiteSettings): FormState {
  return {
    phone: s.phone ?? "",
    whatsapp: s.whatsapp ?? "",
    instagram: s.instagram ?? "",
    address: s.address ?? "",
    mapUrl: s.mapUrl ?? "",
    about: s.about ?? "",
  };
}

function toInput(form: FormState): SiteSettingsInput {
  // Trim'lenmiş değerler; boş bırakılan alan boş olarak kaydedilir (temizleme).
  return {
    phone: form.phone.trim(),
    whatsapp: form.whatsapp.trim(),
    instagram: form.instagram.trim(),
    address: form.address.trim(),
    mapUrl: form.mapUrl.trim(),
    about: form.about.trim(),
  };
}

// ─────────────────────────── Sayfa ───────────────────────────

export default function AdminSettingsPage() {
  const toast = useToast();

  // saved: sunucudaki son hali (dirty karşılaştırması için), form: ekrandaki hali.
  const [saved, setSaved] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoadError(null);
    setSaved(null);
    setForm(null);
    adminGet<SiteSettings>("site-settings")
      .then((data) => {
        const state = fromSettings(data);
        setSaved(state);
        setForm(state);
      })
      .catch(() => {
        setLoadError("Ayarlar yüklenemedi. Lütfen tekrar deneyin.");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!saved || !form) return false;
    return FORM_KEYS.some((k) => saved[k] !== form[k]);
  }, [saved, form]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form || saving) return;

    setSaving(true);
    try {
      const updated = await adminPatch<SiteSettings>(
        "site-settings",
        toInput(form),
      );
      const state = fromSettings(updated);
      setSaved(state);
      setForm(state);
      toast.show("Kaydedildi. Değişiklikler sitede birkaç saniye içinde görünür.");
    } catch (err) {
      const message =
        err instanceof AdminApiError && err.status !== 401
          ? err.message
          : "Kaydedilemedi. Lütfen tekrar deneyin.";
      toast.show(message, "error");
    } finally {
      setSaving(false);
    }
  }

  const loading = !form && !loadError;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="font-display text-3xl">Site Ayarları</h1>
        <p className="mt-1 text-sm text-muted">
          Bu bilgiler sitenin alt bölümünde (footer) ve İletişim sayfasında
          görünür.
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
        <form onSubmit={handleSubmit} noValidate>
          <Card
            title="İletişim ve Site Bilgileri"
            subtitle="Boş bıraktığınız alanlar sitede gösterilmez."
          >
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Telefon"
                  htmlFor="settings-phone"
                  hint="Örn: +90 5xx xxx xx xx"
                >
                  <Input
                    id="settings-phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+90 5xx xxx xx xx"
                  />
                </Field>

                <Field
                  label="WhatsApp"
                  htmlFor="settings-whatsapp"
                  hint="Ülke koduyla, boşluksuz: 905xxxxxxxxx"
                >
                  <Input
                    id="settings-whatsapp"
                    type="tel"
                    inputMode="numeric"
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="905xxxxxxxxx"
                  />
                </Field>
              </div>

              <Field
                label="Instagram"
                htmlFor="settings-instagram"
                hint="Profil bağlantısının tamamı"
              >
                <Input
                  id="settings-instagram"
                  type="url"
                  value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                  placeholder="https://www.instagram.com/celinegelinlik/"
                />
              </Field>

              <Field label="Adres" htmlFor="settings-address">
                <Input
                  id="settings-address"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Mahalle, sokak, no — ilçe / şehir"
                />
              </Field>

              <Field
                label="Harita Bağlantısı"
                htmlFor="settings-map-url"
                hint="Google Haritalar'da butiği bulun, Paylaş'a dokunup bağlantıyı buraya yapıştırın."
              >
                <Input
                  id="settings-map-url"
                  type="url"
                  value={form.mapUrl}
                  onChange={(e) => set("mapUrl", e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </Field>

              <Field
                label="Hakkımızda"
                htmlFor="settings-about"
                hint="Butiği anlatan kısa metin — sitenin Hakkımızda bölümünde görünür."
              >
                <Textarea
                  id="settings-about"
                  rows={6}
                  value={form.about}
                  onChange={(e) => set("about", e.target.value)}
                  placeholder="Celine Gelinlik, İstanbul Maltepe'de..."
                />
              </Field>
            </div>

            {/* Kaydet satırı */}
            <div className="mt-6 flex flex-col-reverse items-stretch gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-xs text-muted sm:text-left">
                {dirty
                  ? "Kaydedilmemiş değişiklikleriniz var."
                  : "Tüm değişiklikler kaydedildi."}
              </p>
              <Button
                type="submit"
                size="sm"
                disabled={!dirty || saving}
                className="sm:min-w-40"
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
