"use client";

// Celine Admin — durumlu (client) UI parçaları: Toggle, ConfirmDialog, Toast.
// Durumsuz parçalar → ./ui.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ─────────────────────────── Toggle ───────────────────────────

type ToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** erişilebilirlik etiketi (görünmez) veya yanda görünen metin */
  label?: string;
  showLabel?: boolean;
  disabled?: boolean;
  id?: string;
};

export function Toggle({
  checked,
  onChange,
  label,
  showLabel,
  disabled,
  id,
}: ToggleProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          // 44px dokunma alanı için dikey padding'li sarmal
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full",
          "border transition-colors duration-200",
          "disabled:opacity-50 disabled:pointer-events-none",
          checked ? "border-ink bg-ink" : "border-ink/20 bg-ink/10",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
      {showLabel && label && <span className="text-sm text-ink">{label}</span>}
    </span>
  );
}

// ─────────────────────────── ConfirmDialog ───────────────────────────

type ConfirmDialogProps = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** silme gibi geri alınamaz eylemlerde koyu kırmızı onay */
  danger?: boolean;
  /** onay isteği sürerken butonları kilitle */
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  danger,
  busy,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-[2px] border border-ink/10 bg-cream p-6">
        <h3 className="font-display text-xl">{title}</h3>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            autoFocus
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onClose}
            className="sm:min-w-28"
          >
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            disabled={busy}
            onClick={onConfirm}
            className={cn(
              "sm:min-w-28",
              danger && "bg-[#8c3232] hover:bg-[#7a2b2b]",
            )}
          >
            {busy ? "Bekleyin…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Toast ───────────────────────────

type ToastTone = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  /** toast göster — varsayılan ton "success" */
  show: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Admin shell'in sardığı sağlayıcı. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string, tone: ToastTone = "success") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* mobilde alt nav'ın üstünde kalsın */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 md:bottom-8"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto w-full max-w-sm rounded-[2px] border px-4 py-3 text-center text-sm",
              t.tone === "success"
                ? "border-ink/10 bg-ink text-cream"
                : "border-[#8c3232]/30 bg-[#f4dcdc] text-[#8c3232]",
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** const toast = useToast(); toast.show("Kaydedildi") */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast, ToastProvider içinde kullanılmalı");
  }
  return ctx;
}
