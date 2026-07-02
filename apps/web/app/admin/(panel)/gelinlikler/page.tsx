"use client";

// Celine Admin — Gelinlikler listesi.
// Kapak küçük görseli, ad, koleksiyon, durum rozeti, öne çıkan işareti.
// Veri: BFF proxy → GET /dresses/admin/all (sayfalı).

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { adminGet } from "@/lib/admin-api";
import {
  DRESS_STATUS_LABELS,
  type AdminDress,
  type Paginated,
} from "@/lib/admin-types";
import { Badge, Card, EmptyState, TableShell, Td } from "@/components/admin/ui";
import { Button, ButtonLink } from "@/components/ui/Button";

const PAGE_SIZE = 30;

function CoverThumb({ dress }: { dress: AdminDress }) {
  const cover = dress.images[0];
  return (
    <span className="block h-16 w-12 overflow-hidden rounded-[2px] border border-ink/10 bg-powder-deep">
      {cover ? (
        // images:{unoptimized:true} — düz <img> yeterli (bkz. components/site/Media)
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.url}
          alt={cover.alt ?? dress.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : null}
    </span>
  );
}

export default function AdminDressesPage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<AdminDress> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    adminGet<Paginated<AdminDress>>(
      `dresses/admin/all?page=${page}&limit=${PAGE_SIZE}`,
    )
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setError("Gelinlikler yüklenemedi.");
      });
    return () => {
      cancelled = true;
    };
  }, [page, attempt]);

  const loading = result === null && !error;
  const dresses = result?.data ?? [];
  const meta = result?.meta;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Başlık + Yeni Gelinlik */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Gelinlikler</h1>
          <p className="mt-1 text-sm text-muted">
            {meta
              ? `Toplam ${meta.total} model`
              : "Modelleri ekleyin ve düzenleyin."}
          </p>
        </div>
        <ButtonLink href="/admin/gelinlikler/yeni" size="sm">
          <Plus size={15} strokeWidth={2} aria-hidden />
          Yeni Gelinlik
        </ButtonLink>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2px] bg-[#f4dcdc] px-4 py-3 text-sm text-[#8c3232]">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="font-medium underline underline-offset-2"
          >
            Tekrar dene
          </button>
        </div>
      )}

      <Card flush>
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-muted">
            Yükleniyor…
          </div>
        ) : dresses.length === 0 && !error ? (
          <EmptyState
            title="Henüz gelinlik eklenmemiş"
            description="İlk modeli ekleyin; görsellerini yükleyip yayına alabilirsiniz."
            action={
              <ButtonLink href="/admin/gelinlikler/yeni" size="sm">
                <Plus size={15} strokeWidth={2} aria-hidden />
                Yeni Gelinlik
              </ButtonLink>
            }
          />
        ) : (
          <>
            <TableShell
              head={["Görsel", "Ad", "Koleksiyon", "Durum", "Öne Çıkan", ""]}
            >
              {dresses.map((dress) => (
                <tr
                  key={dress.id}
                  className="transition-colors hover:bg-powder/60"
                >
                  <Td className="w-16">
                    <Link
                      href={`/admin/gelinlikler/${dress.id}`}
                      className="block"
                    >
                      <CoverThumb dress={dress} />
                    </Link>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/gelinlikler/${dress.id}`}
                      className="block"
                    >
                      <span className="block font-medium text-ink">
                        {dress.name}
                      </span>
                      <span className="block text-xs text-faint">
                        /{dress.slug}
                      </span>
                    </Link>
                  </Td>
                  <Td className="text-muted">
                    {dress.collection?.name ?? (
                      <span className="text-faint">—</span>
                    )}
                  </Td>
                  <Td>
                    <Badge
                      tone={dress.status === "PUBLISHED" ? "success" : "neutral"}
                    >
                      {DRESS_STATUS_LABELS[dress.status]}
                    </Badge>
                  </Td>
                  <Td>
                    {dress.featured ? (
                      <Star
                        size={16}
                        className="text-rose"
                        fill="currentColor"
                        aria-label="Öne çıkan"
                      />
                    ) : (
                      <span className="text-faint" aria-hidden>
                        —
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    <Link
                      href={`/admin/gelinlikler/${dress.id}`}
                      className="u-label inline-flex min-h-11 items-center text-faint transition-colors hover:text-ink"
                    >
                      Düzenle
                    </Link>
                  </Td>
                </tr>
              ))}
            </TableShell>

            {/* Sayfalama */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Önceki
                </Button>
                <span className="text-xs text-muted">
                  Sayfa {meta.page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
