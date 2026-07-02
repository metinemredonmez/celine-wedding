"use client";

// Celine Admin — Koleksiyonlar: tek sayfa CRUD.
// Liste (ad, slug, gelinlik sayısı) + satır içi yeni/düzenle/sil.
// Veri (BFF proxy): GET /collections/admin/all, POST /collections,
// PATCH /collections/:id, DELETE /collections/:id (gelinlikler silinmez,
// koleksiyonsuz kalır — onDelete: SetNull).

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminApiError,
  adminDelete,
  adminGet,
  adminPatch,
  adminPost,
} from "@/lib/admin-api";
import type { AdminCollection, CollectionInput } from "@/lib/admin-types";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  Field,
  Input,
  TableShell,
  Td,
  Textarea,
} from "@/components/admin/ui";
import { ConfirmDialog, useToast } from "@/components/admin/ui-client";

// ─────────────────────────── Satır içi form ───────────────────────────

type FormValues = {
  name: string;
  slug: string;
  description: string;
};

function toValues(c?: AdminCollection): FormValues {
  return {
    name: c?.name ?? "",
    slug: c?.slug ?? "",
    description: c?.description ?? "",
  };
}

type EditorProps = {
  initial: FormValues;
  slugHint: string;
  submitLabel: string;
  busy: boolean;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
};

/** Yeni + düzenle için ortak satır içi form (tablo satırının içinde açılır). */
function CollectionEditor({
  initial,
  slugHint,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: EditorProps) {
  const [values, setValues] = useState<FormValues>(initial);
  const [nameError, setNameError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = values.name.trim();
    if (name.length < 2) {
      setNameError("Koleksiyon adı en az 2 karakter olmalı.");
      return;
    }
    setNameError(null);
    onSubmit({
      name,
      slug: values.slug.trim(),
      description: values.description.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ad" htmlFor="collection-name" required error={nameError}>
          <Input
            id="collection-name"
            value={values.name}
            onChange={(e) =>
              setValues((v) => ({ ...v, name: e.target.value }))
            }
            placeholder="Örn. Klasik Koleksiyon"
            maxLength={120}
            invalid={Boolean(nameError)}
            disabled={busy}
            autoFocus
          />
        </Field>
        <Field label="Slug" htmlFor="collection-slug" hint={slugHint}>
          <Input
            id="collection-slug"
            value={values.slug}
            onChange={(e) =>
              setValues((v) => ({ ...v, slug: e.target.value }))
            }
            placeholder="klasik-koleksiyon"
            maxLength={140}
            disabled={busy}
          />
        </Field>
      </div>
      <Field
        label="Açıklama"
        htmlFor="collection-description"
        hint="İsteğe bağlı — koleksiyon sayfasında kısa tanıtım olarak görünür."
      >
        <Textarea
          id="collection-description"
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
          rows={3}
          disabled={busy}
        />
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={onCancel}
          className="sm:min-w-28"
        >
          Vazgeç
        </Button>
        <Button type="submit" size="sm" disabled={busy} className="sm:min-w-28">
          {busy ? "Kaydediliyor…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────── Sayfa ───────────────────────────

const TABLE_HEAD = [
  "Ad",
  "Slug",
  "Gelinlik",
  <span key="actions" className="sr-only">
    İşlemler
  </span>,
];

export default function AdminCollectionsPage() {
  const toast = useToast();

  const [collections, setCollections] = useState<AdminCollection[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminCollection | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminCollection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      setCollections(await adminGet<AdminCollection[]>("collections/admin/all"));
    } catch {
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const list = collections ?? [];
  const loading = collections === null && !loadFailed;

  function openCreate() {
    setEditing(null);
    setCreating(true);
  }

  function openEdit(c: AdminCollection) {
    setCreating(false);
    setEditing(c);
  }

  function closeEditor() {
    if (saving) return;
    setCreating(false);
    setEditing(null);
  }

  function errorMessage(e: unknown, fallback: string): string {
    return e instanceof AdminApiError ? e.message : fallback;
  }

  async function handleCreate(values: FormValues) {
    setSaving(true);
    try {
      const body: CollectionInput = { name: values.name };
      if (values.slug) body.slug = values.slug;
      if (values.description) body.description = values.description;
      await adminPost("collections", body);
      toast.show("Koleksiyon eklendi.");
      setCreating(false);
      await load();
    } catch (e) {
      toast.show(errorMessage(e, "Koleksiyon eklenemedi."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(values: FormValues) {
    if (!editing) return;
    setSaving(true);
    try {
      // Slug boş bırakıldıysa göndermiyoruz → mevcut slug korunur.
      const body: CollectionInput = {
        name: values.name,
        description: values.description,
      };
      if (values.slug) body.slug = values.slug;
      await adminPatch(`collections/${editing.id}`, body);
      toast.show("Değişiklikler kaydedildi.");
      setEditing(null);
      await load();
    } catch (e) {
      toast.show(errorMessage(e, "Değişiklikler kaydedilemedi."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDelete(`collections/${deleteTarget.id}`);
      toast.show("Koleksiyon silindi.");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.show(errorMessage(e, "Koleksiyon silinemedi."), "error");
    } finally {
      setDeleting(false);
    }
  }

  const deleteCount = deleteTarget?._count.dresses ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="font-display text-3xl">Koleksiyonlar</h1>
        <p className="mt-1 text-sm text-muted">
          Gelinlikleri gruplayan koleksiyonları ekleyin, düzenleyin, silin.
        </p>
      </div>

      <Card
        title="Tüm Koleksiyonlar"
        subtitle={loading ? undefined : `${list.length} koleksiyon`}
        action={
          <Button
            size="sm"
            onClick={openCreate}
            disabled={creating || saving}
          >
            <Plus size={14} strokeWidth={2} aria-hidden />
            Yeni Koleksiyon
          </Button>
        }
        flush
      >
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted">
            Yükleniyor…
          </div>
        ) : loadFailed ? (
          <EmptyState
            title="Koleksiyonlar yüklenemedi"
            description="Bağlantınızı kontrol edip tekrar deneyin."
            action={
              <Button variant="outline" size="sm" onClick={() => void load()}>
                Tekrar Dene
              </Button>
            }
          />
        ) : list.length === 0 && !creating ? (
          <EmptyState
            title="Henüz koleksiyon yok"
            description="İlk koleksiyonu ekleyerek gelinlikleri gruplamaya başlayın."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus size={14} strokeWidth={2} aria-hidden />
                Yeni Koleksiyon
              </Button>
            }
          />
        ) : (
          <TableShell head={TABLE_HEAD}>
            {/* Satır içi yeni koleksiyon formu */}
            {creating && (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="bg-white/60 px-4 py-5 sm:px-5">
                  <CollectionEditor
                    initial={toValues()}
                    slugHint="Boş bırakılırsa addan otomatik üretilir."
                    submitLabel="Ekle"
                    busy={saving}
                    onSubmit={handleCreate}
                    onCancel={closeEditor}
                  />
                </td>
              </tr>
            )}

            {list.map((c) =>
              editing?.id === c.id ? (
                // Satır içi düzenleme formu
                <tr key={c.id}>
                  <td colSpan={TABLE_HEAD.length} className="bg-white/60 px-4 py-5 sm:px-5">
                    <CollectionEditor
                      initial={toValues(c)}
                      slugHint="Boş bırakılırsa mevcut slug korunur."
                      submitLabel="Kaydet"
                      busy={saving}
                      onSubmit={handleUpdate}
                      onCancel={closeEditor}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={c.id}>
                  <Td className="font-medium text-ink">{c.name}</Td>
                  <Td className="text-muted">{c.slug}</Td>
                  <Td className="tabular-nums">{c._count.dresses}</Td>
                  <Td className="text-right">
                    <div className="inline-flex flex-wrap justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        onClick={() => openEdit(c)}
                      >
                        <Pencil size={14} strokeWidth={1.5} aria-hidden />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        onClick={() => setDeleteTarget(c)}
                        className="border-[#8c3232]/40 text-[#8c3232] hover:border-[#8c3232] hover:bg-[#f4dcdc]/40"
                      >
                        <Trash2 size={14} strokeWidth={1.5} aria-hidden />
                        Sil
                      </Button>
                    </div>
                  </Td>
                </tr>
              ),
            )}
          </TableShell>
        )}
      </Card>

      {/* Silme onayı */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteTarget ? `"${deleteTarget.name}" silinsin mi?` : ""}
        description={
          deleteCount > 0
            ? `Bu koleksiyondaki ${deleteCount} gelinlik silinmez ancak koleksiyonsuz kalır. Bu işlem geri alınamaz.`
            : "Bu işlem geri alınamaz."
        }
        confirmLabel="Evet, Sil"
        danger
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
