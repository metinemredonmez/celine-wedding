"use client";

// Celine Admin — Yeni gelinlik. Kaydettikten sonra görsellerin
// eklendiği düzenleme ekranına yönlendirir (DressForm hallediyor).

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DressForm } from "../DressForm";

export default function NewDressPage() {
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
        <h1 className="font-display text-3xl">Yeni Gelinlik</h1>
        <p className="mt-1 text-sm text-muted">
          Önce model bilgilerini kaydedin; görselleri bir sonraki adımda
          ekleyeceksiniz.
        </p>
      </div>

      <DressForm />
    </div>
  );
}
