"use client";

// Celine Admin — giriş sayfası (BFF: POST /api/admin/login → httpOnly cookie).
// Başarıda /admin'e TAM yönlendirme (server guard cookie'yi görsün).

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/admin/ui";
import { adminLogin, AdminApiError } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await adminLogin(email.trim(), password);
      window.location.assign("/admin");
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? err.message
          : "Giriş yapılamadı. Lütfen tekrar deneyin.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-powder px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <p className="u-wordmark text-2xl text-ink">CELINE</p>
          <p className="u-label mt-3 text-faint">Yönetim Paneli</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[2px] border border-ink/10 bg-cream p-6 sm:p-8"
          noValidate
        >
          <Field label="E-posta" htmlFor="admin-email" required>
            <Input
              id="admin-email"
              type="email"
              name="email"
              autoComplete="username"
              inputMode="email"
              placeholder="ornek@celinegelinlik.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </Field>

          <Field label="Şifre" htmlFor="admin-password" required>
            <Input
              id="admin-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && (
            <p
              role="alert"
              className="rounded-[2px] bg-[#f4dcdc] px-3.5 py-2.5 text-sm text-[#8c3232]"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={busy || !email || !password}
            className="w-full"
          >
            {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-faint">
          Bu alan yalnızca butik yönetimi içindir.
        </p>
      </div>
    </div>
  );
}
