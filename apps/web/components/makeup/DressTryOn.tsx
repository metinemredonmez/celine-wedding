"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { photoFromFile } from "@/lib/makeup/photo";
import studio from "./studio.module.css";
import styles from "./tryon.module.css";

export type DressOption = { id: string; name: string; slug: string; image: string | null };

type Phase = "idle" | "reading" | "submitting" | "processing" | "done" | "failed";
type Photo = { dataUrl: string; width: number; height: number };
type TryOnRow = { id: string; status: "PENDING" | "DONE" | "FAILED"; resultUrl?: string | null; error?: string | null };

/** nginx'in varsayılan gövde sınırı 1 MB; base64 + JSON payıyla bunun altında kalınır. */
const MAX_PAYLOAD_CHARS = 900_000;
/** Küçültme basamakları: uzun kenar / JPEG kalitesi. fashn ~1024 px'te çalışır; daha büyüğü fayda etmez. */
const ENCODE_STEPS: ReadonlyArray<readonly [number, number]> = [
  [1280, 0.85],
  [1152, 0.8],
  [1024, 0.75],
  [896, 0.7],
];
const POLL_MS = 2_000;
const MAX_WAIT_MS = 170_000;

const PHASE_TEXT: Partial<Record<Phase, string>> = {
  reading: "Fotoğraf hazırlanıyor…",
  submitting: "Fotoğrafınız gönderiliyor…",
  processing: "Gelinlik üzerinize giydiriliyor… Genellikle 20–60 saniye sürer.",
};

const SUBMIT_ERROR: Record<number, string> = {
  400: "Fotoğraf okunamadı. JPEG ya da PNG bir fotoğraf seçin.",
  413: "Fotoğraf çok büyük. Daha küçük bir fotoğraf deneyin.",
  429: "Saatlik deneme sınırına ulaştınız (en fazla 5). Lütfen daha sonra tekrar deneyin.",
  503: "Sanal gelinlik denemesi şu an kapalı.",
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function scaled(src: HTMLCanvasElement, maxSide: number): HTMLCanvasElement {
  const s = Math.min(1, maxSide / Math.max(src.width, src.height));
  if (s === 1) return src;
  const c = document.createElement("canvas");
  c.width = Math.round(src.width * s);
  c.height = Math.round(src.height * s);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/** Dosya bir kez çözülür; sınırın altına inene dek küçültülüp yeniden kodlanır. */
async function encodePhoto(file: File): Promise<Photo> {
  const base = await photoFromFile(file, ENCODE_STEPS[0][0]);
  for (const [side, quality] of ENCODE_STEPS) {
    const c = scaled(base.image, side);
    const dataUrl = c.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_PAYLOAD_CHARS) return { dataUrl, width: c.width, height: c.height };
  }
  throw new Error("too_large_after_resize");
}

/** Kullanıcıya gösterilecek hata metni + teknik ayrıntı (prod'da teşhis için). */
function failureText(error: string | null | undefined): { text: string; detail?: string } {
  if (error?.includes("içerik filtresine")) {
    return { text: "Fotoğraf içerik filtresine takıldı. Lütfen başka bir fotoğrafla deneyin." };
  }
  return {
    text: "Bu fotoğrafla deneme oluşturulamadı. Boydan, önden ve net bir fotoğrafla tekrar deneyin.",
    detail: error ?? undefined,
  };
}

function PhotoGuide({ onPick }: { onPick: () => void }) {
  return (
    <div className={studio.guide}>
      <h3 className={studio.guideTitle}>Boydan bir fotoğraf yükleyin</h3>
      <p className={studio.guideLead}>Gelinlik doğru otursun diye:</p>
      <ul className={studio.guideList}>
        <li>
          <strong>Baştan ayağa</strong> görünün, tam önden ve dik durun.
        </li>
        <li>
          <strong>Vücudu saran kıyafet</strong> tercih edin; bol ve katlı giysiler sonucu bozar.
        </li>
        <li>
          <strong>Sade bir arka plan</strong>, kollar gövdeden hafif açık, eller serbest.
        </li>
        <li>
          <strong>İyi ışık</strong>; filtre ve güzellik modu kapalı.
        </li>
      </ul>
      <Button onClick={onPick} className="justify-self-start">
        Fotoğraf seçin ya da çekin
      </Button>
      <p className={studio.guideNote}>
        Fotoğrafınız yalnızca bu deneme için yapay zekâ servisine iletilir; sunucularımızda saklanmaz.
      </p>
    </div>
  );
}

export function DressTryOn({ dresses }: { dresses: DressOption[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  // Her gönderim/sıfırlama yeni bir dönem: eski yoklama sonuç yazamaz.
  const epochRef = useRef(0);
  const mountedRef = useRef(true);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [dressId, setDressId] = useState<string | null>(dresses[0]?.id ?? null);
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<{ text: string; detail?: string } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hold, setHold] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    const epoch = epochRef;
    return () => {
      mountedRef.current = false;
      epoch.current++;
    };
  }, []);

  // Geçen süre sayacı (bekleme hissini azaltır).
  useEffect(() => {
    if (phase !== "processing" && phase !== "submitting") return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (!hold || typeof window === "undefined") return;
    const off = () => setHold(false);
    window.addEventListener("blur", off);
    return () => window.removeEventListener("blur", off);
  }, [hold]);

  const live = (epoch: number) => mountedRef.current && epoch === epochRef.current;
  const pick = () => fileRef.current?.click();
  const busy = phase === "reading" || phase === "submitting" || phase === "processing";
  const dress = dresses.find((d) => d.id === dressId) ?? null;

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const epoch = ++epochRef.current;
    setError(null);
    setNotice(null);
    setResultUrl(null);
    setHold(false);
    setPhase("reading");
    try {
      const p = await encodePhoto(file);
      if (!live(epoch)) return;
      setPhoto(p);
      setPhase("idle");
    } catch (err) {
      if (!live(epoch)) return;
      const code = err instanceof Error ? err.message : "";
      setPhoto(null);
      setPhase("idle");
      setError({
        text:
          code === "file_too_large" || code === "too_large_after_resize"
            ? "Dosya çok büyük (en fazla 25 MB). Telefonunuzun normal kamera ayarıyla çektiğiniz bir fotoğraf seçin."
            : code === "not_an_image"
              ? "Lütfen bir fotoğraf dosyası seçin (JPEG, PNG)."
              : "Fotoğraf okunamadı. Başka bir fotoğraf deneyin.",
      });
    }
  }

  async function submit() {
    if (!photo || !dressId || !consent || busy) return;
    const epoch = ++epochRef.current;
    setError(null);
    setNotice(null);
    setResultUrl(null);
    setHold(false);
    setPhase("submitting");
    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ personImage: photo.dataUrl, dressId }),
      });
      if (!live(epoch)) return;
      if (!res.ok) {
        setPhase("failed");
        setError({ text: SUBMIT_ERROR[res.status] ?? "Deneme başlatılamadı. Lütfen tekrar deneyin." });
        return;
      }
      let row = (await res.json()) as TryOnRow;
      setPhase("processing");

      const deadline = Date.now() + MAX_WAIT_MS;
      let misses = 0;
      while (row.status === "PENDING") {
        if (Date.now() > deadline) {
          setPhase("failed");
          setError({ text: "Deneme beklenenden uzun sürdü. Lütfen biraz sonra tekrar deneyin." });
          return;
        }
        await sleep(POLL_MS);
        if (!live(epoch)) return;
        const poll = await fetch(`/api/try-on/${encodeURIComponent(row.id)}`, { cache: "no-store" });
        if (!live(epoch)) return;
        if (!poll.ok) {
          // Geçici ağ hatası: birkaç kez tolere et.
          if (++misses >= 5) {
            setPhase("failed");
            setError({ text: "Sonuç alınamadı. Lütfen tekrar deneyin." });
            return;
          }
          continue;
        }
        misses = 0;
        row = (await poll.json()) as TryOnRow;
      }
      if (row.status === "DONE" && row.resultUrl) {
        setResultUrl(row.resultUrl);
        setPhase("done");
      } else {
        setPhase("failed");
        setError(failureText(row.error));
      }
    } catch {
      if (!live(epoch)) return;
      setPhase("failed");
      setError({ text: "Bağlantı hatası. Lütfen tekrar deneyin." });
    }
  }

  /** Başka gelinlik: fotoğraf kalır, sonuç temizlenir. */
  function again() {
    epochRef.current++;
    setResultUrl(null);
    setError(null);
    setNotice(null);
    setHold(false);
    setPhase("idle");
  }

  async function save() {
    if (!resultUrl) return;
    try {
      const blob = await (await fetch(resultUrl)).blob();
      const file = new File([blob], "celine-gelinlik-deneme.jpg", { type: blob.type || "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Celine Gelinlik — gelinlik denemem" });
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Görsel indirildi.");
    } catch {
      // Sağlayıcı CORS vermezse: yeni sekmede aç, kullanıcı kaydeder.
      window.open(resultUrl, "_blank", "noopener");
    }
  }

  const holdOff = () => setHold(false);
  const holdKey = (e: KeyboardEvent, on: boolean) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setHold(on);
    }
  };

  const phaseText = PHASE_TEXT[phase];
  const showResult = phase === "done" && resultUrl;
  const stageSrc = showResult && !hold ? resultUrl : photo?.dataUrl;
  const canSubmit = Boolean(photo && dressId && consent) && !busy && phase !== "done";

  return (
    <div className={studio.studio}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onFile}
      />

      <div className={styles.layout}>
        <figure className={styles.stage}>
          {photo || phase === "reading" ? (
            <>
              {stageSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stageSrc}
                  alt={showResult && !hold ? "Seçili gelinlikle sizin fotoğrafınız" : "Sizin fotoğrafınız"}
                />
              )}
              {busy && <span className={studio.scan} aria-hidden="true" />}
              <span className={studio.badge}>{showResult && !hold ? "Deneme sonucu" : "Sizin fotoğrafınız"}</span>
              {phaseText && (
                <p className={studio.status} role="status">
                  {phaseText}
                  {(phase === "processing" || phase === "submitting") && (
                    <span className={styles.elapsed}> {elapsed} sn</span>
                  )}
                </p>
              )}
              {showResult && (
                <button
                  type="button"
                  className={studio.compare}
                  onPointerDown={() => setHold(true)}
                  onPointerUp={holdOff}
                  onPointerLeave={holdOff}
                  onPointerCancel={holdOff}
                  onBlur={holdOff}
                  onKeyDown={(e) => holdKey(e, true)}
                  onKeyUp={(e) => holdKey(e, false)}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {hold ? "Öncesi" : "Öncesi — basılı tutun"}
                </button>
              )}
            </>
          ) : (
            <PhotoGuide onPick={pick} />
          )}
        </figure>

        <div className={styles.panel}>
          {error && (
            <div className={styles.error} role="alert">
              {error.text}
              {error.detail && (
                <details className={styles.detail}>
                  <summary>Teknik ayrıntı</summary>
                  {error.detail}
                </details>
              )}
            </div>
          )}

          <div className={studio.group} role="group" aria-label="Gelinlik seçin">
            <span className={studio.groupLabel}>
              Gelinlik
              {dress && <span className={studio.groupValue}> · {dress.name}</span>}
            </span>
            {dresses.length === 0 ? (
              <p className={styles.empty}>Denenecek gelinlikler çok yakında burada olacak.</p>
            ) : (
              <div className={styles.dresses}>
                {dresses.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={styles.dress}
                    aria-pressed={dressId === d.id}
                    disabled={busy}
                    onClick={() => {
                      setDressId(d.id);
                      if (phase === "done" || phase === "failed") again();
                    }}
                  >
                    {d.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        // Kırık görsel ikonu yerine pudra zemin kalsın.
                        onError={(e) => (e.currentTarget.style.opacity = "0")}
                      />
                    ) : (
                      <span aria-hidden="true" />
                    )}
                    <span className={styles.dressName}>{d.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {phase !== "done" && (
            <label className={styles.consent}>
              <input
                type="checkbox"
                checked={consent}
                disabled={busy}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                Fotoğrafımın yalnızca bu deneme için yurt dışındaki yapay zekâ servisine (fal.ai) iletilmesini
                kabul ediyorum. Fotoğraf Celine Gelinlik sunucularında saklanmaz.{" "}
                <Link href="/kvkk">KVKK aydınlatma metni</Link>
              </span>
            </label>
          )}

          <div className={studio.actions}>
            {phase === "done" ? (
              <>
                <Button size="sm" onClick={save}>
                  Kaydet / paylaş
                </Button>
                <Button size="sm" variant="outline" onClick={again}>
                  Başka gelinlik dene
                </Button>
                {dress && (
                  <ButtonLink size="sm" variant="outline" href={`/modeller/${dress.slug}`}>
                    Modeli incele
                  </ButtonLink>
                )}
                <ButtonLink size="sm" variant="outline" href="/randevu">
                  Randevu al
                </ButtonLink>
              </>
            ) : (
              <>
                <Button size="sm" onClick={submit} disabled={!canSubmit}>
                  {busy ? "Deneniyor…" : "Gelinliği dene"}
                </Button>
                {photo && !busy && (
                  <Button size="sm" variant="outline" onClick={pick}>
                    Fotoğrafı değiştir
                  </Button>
                )}
                {phase === "failed" && photo && (
                  <Button size="sm" variant="outline" onClick={again}>
                    Tekrar dene
                  </Button>
                )}
              </>
            )}
          </div>
          {notice && (
            <p className={studio.hint} role="status">
              {notice}
            </p>
          )}
          {phase === "done" && (
            <p className={styles.resultNote}>
              Bu bir yapay zekâ ön izlemesidir; kumaşın dokusu, oturuşu ve ölçüye özel detaylar gerçek provada
              görülür. Fotoğrafı değiştirmek için &ldquo;Başka gelinlik dene&rdquo; deyip yeni fotoğraf seçin.
            </p>
          )}

          <p className={studio.privacy}>
            Deneme için fotoğrafınız şifreli bağlantıyla yapay zekâ servisine iletilir ve sunucularımızda
            saklanmaz; yalnızca sonuç görselinin adresi kısa süre tutulur. Saatte en fazla 5 deneme yapılabilir.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DressTryOn;
