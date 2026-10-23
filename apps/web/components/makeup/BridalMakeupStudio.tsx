"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { hexToHsl, hslToHex, isHex, type Hsl } from "@/lib/makeup/color";
import { analyzeFace } from "@/lib/makeup/detect";
import { crossfade, prefersReducedMotion, sweepReveal } from "@/lib/makeup/fx";
import {
  BARE_LOOK,
  BLUSH_SHADES,
  BRIDAL_LOOKS,
  BROW_SHADES,
  CONTOUR_SHADES,
  DEFAULT_BRIDAL_LOOK,
  FOUNDATION_SHADES,
  HAIR_SHADES,
  LASH_SHADES,
  LIP_SHADES,
  SHADOW_SHADES,
  findShade,
  type BridalLook,
  type Look,
  type Shade,
} from "@/lib/makeup/looks";
import { DEFAULT_MODEL, MODELS, loadSample, modelById, modelImage, photoFromFile } from "@/lib/makeup/photo";
import { PHOTO_GUIDE, faceIssues, sizeIssues, type PhotoIssue } from "@/lib/makeup/quality";
import { renderLook, type FaceData } from "@/lib/makeup/render";
import { shadeTextures, type TextureKind } from "@/lib/makeup/textures";
import styles from "./studio.module.css";

type Source = {
  image: HTMLCanvasElement;
  face: FaceData | null;
  width: number;
  height: number;
};
type Mode = "sample" | "own";
type Status = "loading" | "ready" | "analyzing" | "noface" | "rejected" | "error";
type Tab = "lip" | "face" | "eye" | "brow" | "hair";

const TOO_LARGE_TEXT =
  "Dosya çok büyük (en fazla 25 MB). Telefonunuzun normal kamera ayarıyla çektiğiniz bir fotoğraf seçin.";

const STATUS_TEXT: Partial<Record<Status, string>> = {
  loading: "Örnek yüz hazırlanıyor…",
  analyzing: "Fotoğrafınız cihazınızda inceleniyor… İlk seferde yüz modeli indirilir.",
  noface: "Yüz bulunamadı. Yüzünüzün önden ve net göründüğü bir fotoğraf deneyin.",
  error: "Demo yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.",
};

const TABS: { id: Tab; label: string }[] = [
  { id: "lip", label: "Ruj" },
  { id: "face", label: "Ten" },
  { id: "eye", label: "Göz" },
  { id: "brow", label: "Kaş" },
  { id: "hair", label: "Saç" },
];

/** Görünüm kartındaki renk noktaları: dudak, far, allık. */
function presetDots(look: Look): string[] {
  return [
    findShade(LIP_SHADES, look.lip)?.hex,
    findShade(SHADOW_SHADES, look.shadow)?.hex,
    findShade(BLUSH_SHADES, look.blush)?.hex,
  ].filter((h): h is string => Boolean(h));
}

/**
 * Ton seçici. texture verilirse ton kutuları gerçek doku gösterir (saç tutamı, dudak, kaş, kirpik; o tonla
 * boyanmış); doku hazırlanana kadar ya da hazırlanamazsa düz renk kalır. pan: pudra kutusu görünümü
 * (far, allık, kontür, fondöten).
 */
function Swatches({
  label,
  shades,
  value,
  onChange,
  disabled,
  texture,
  pan,
}: {
  label: string;
  shades: Shade[];
  value: string | null;
  onChange: (id: string | null) => void;
  disabled: boolean;
  texture?: TextureKind;
  pan?: boolean;
}) {
  const custom = isHex(value) ? value.toUpperCase() : null;
  const chosen = findShade(shades, value);
  const [tex, setTex] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!texture) return;
    let live = true;
    shadeTextures(texture, shades).then(
      (t) => live && setTex(t),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [texture, shades]);
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.groupLabel}>
        {label}
        {chosen && <span className={styles.groupValue}> · {chosen.name}</span>}
      </span>
      <div className={styles.swatches} data-texture={texture} data-pan={pan || undefined}>
        <button
          type="button"
          className={`${styles.swatch} ${styles.none}`}
          aria-pressed={value === null}
          aria-label={`${label}: yok`}
          title="Yok"
          disabled={disabled}
          onClick={() => onChange(null)}
        />
        {shades.map((s) => (
          <button
            key={s.id}
            type="button"
            className={styles.swatch}
            style={
              tex[s.id]
                ? { backgroundColor: s.hex, backgroundImage: `url(${tex[s.id]})` }
                : { backgroundColor: s.hex }
            }
            aria-pressed={value === s.id}
            aria-label={`${label}: ${s.name}`}
            title={s.name}
            disabled={disabled}
            onClick={() => onChange(s.id)}
          >
            {/* Kirpik dokusunda lacivert/bordo ayırt edilsin: köşede mürekkep rengi. */}
            {texture === "lash" && <span className={styles.ink} style={{ background: s.hex }} aria-hidden="true" />}
          </button>
        ))}
        {/* Sınırsız renk: cihazın kendi renk seçicisi; seçilince aşağıda ince ayar. */}
        <label
          className={`${styles.swatch} ${styles.customSwatch}`}
          data-on={custom ? true : undefined}
          data-disabled={disabled || undefined}
          title="Özel renk"
        >
          {custom && <span className={styles.customDot} style={{ background: custom }} aria-hidden="true" />}
          <input
            type="color"
            className={styles.colorInput}
            value={(custom ?? shades[0].hex).toLowerCase()}
            disabled={disabled}
            aria-label={`${label}: özel renk seçin`}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
          />
        </label>
      </div>
      {custom && <HslTuner label={label} hex={custom} onChange={onChange} disabled={disabled} />}
    </div>
  );
}

/**
 * Özel rengin ince ayarı (Ton / Doygunluk / Açıklık, sürekli). HSL yerelde tutulur: gri tonda ton
 * kaydırılırken değer kaybolmasın; renk dışarıdan değişirse (renk seçici) yeniden hesaplanır.
 */
function HslTuner({
  label,
  hex,
  onChange,
  disabled,
}: {
  label: string;
  hex: string;
  onChange: (hex: string) => void;
  disabled: boolean;
}) {
  const [state, setState] = useState(() => ({ hex, hsl: hexToHsl(hex) }));
  const hsl = state.hex === hex ? state.hsl : hexToHsl(hex);
  const set = (patch: Partial<Hsl>) => {
    const next = { ...hsl, ...patch };
    const out = hslToHex(next);
    setState({ hex: out, hsl: next });
    onChange(out);
  };
  const { h, s, l } = hsl;
  const rows: { key: keyof Hsl; name: string; min: number; max: number; track: string }[] = [
    {
      key: "h",
      name: "Ton",
      min: 0,
      max: 359,
      track: `linear-gradient(90deg, ${[0, 60, 120, 180, 240, 300, 359].map((x) => `hsl(${x} ${Math.max(s, 35)}% ${Math.min(Math.max(l, 35), 65)}%)`).join(", ")})`,
    },
    {
      key: "s",
      name: "Doygunluk",
      min: 0,
      max: 100,
      track: `linear-gradient(90deg, hsl(${h} 0% ${l}%), hsl(${h} 100% ${l}%))`,
    },
    {
      key: "l",
      name: "Açıklık",
      min: 5,
      max: 95,
      track: `linear-gradient(90deg, hsl(${h} ${s}% 5%), hsl(${h} ${s}% 50%), hsl(${h} ${s}% 95%))`,
    },
  ];
  return (
    <div className={styles.tuner} role="group" aria-label={`${label}: özel ton ayarı`}>
      {rows.map((r) => (
        <label key={r.key} className={styles.tunerRow}>
          <span>{r.name}</span>
          <input
            type="range"
            className={styles.tunerRange}
            min={r.min}
            max={r.max}
            value={hsl[r.key]}
            disabled={disabled}
            style={{ background: r.track }}
            onChange={(e) => set({ [r.key]: Number(e.target.value) })}
          />
        </label>
      ))}
      <span className={styles.tunerHex}>{hex}</span>
    </div>
  );
}

function Amount({
  value,
  onChange,
  disabled,
  label = "Yoğunluk",
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  label?: string;
}) {
  return (
    <label className={styles.amount}>
      <span>{label}</span>
      <input
        type="range"
        min={10}
        max={100}
        step={5}
        value={Math.round(value * 100)}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
      />
      <span className={styles.amountValue}>%{Math.round(value * 100)}</span>
    </label>
  );
}

function Toggle({
  label,
  on,
  onChange,
  disabled,
}: {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      className={styles.chip}
      aria-pressed={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
    >
      {label}
    </button>
  );
}

/** Hazır düğün makyajı görünümleri: tek dokunuşla tam görünüm. */
function BridalPresets({
  active,
  edited,
  onPick,
  disabled,
}: {
  active: string | null;
  edited: boolean;
  onPick: (p: BridalLook) => void;
  disabled: boolean;
}) {
  return (
    <div className={styles.group} role="group" aria-label="Düğün makyajı görünümleri">
      <span className={styles.groupLabel}>
        Düğün makyajı görünümleri
        {active && edited && <span className={styles.groupValue}> · düzenlendi</span>}
      </span>
      <div className={styles.presets}>
        {BRIDAL_LOOKS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={styles.preset}
            aria-pressed={active === p.id}
            disabled={disabled}
            onClick={() => onPick(p)}
          >
            <span className={styles.presetDots} aria-hidden="true">
              {presetDots(p.look).map((hex, i) => (
                <span key={i} style={{ background: hex }} />
              ))}
            </span>
            <span className={styles.presetName}>{p.name}</span>
            <span className={styles.presetNote}>{p.note}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** "Kendi fotoğrafım" öncesi ölçü rehberi: makyaj yüz noktalarına göre çizildiğinden kadraj kritik. */
function PhotoGuide({ onPick }: { onPick: () => void }) {
  return (
    <div className={styles.guide}>
      <h2 className={styles.guideTitle}>Kendi fotoğrafınızla deneyin</h2>
      <p className={styles.guideLead}>İyi bir sonuç için birkaç ipucu:</p>
      <ul className={styles.guideList}>
        <li>
          <strong>Dikey (3:4) çekin</strong>, en az {PHOTO_GUIDE.idealShort}×800 piksel.
        </li>
        <li>
          <strong>Yüzünüz kadrajın en az üçte birini</strong> kaplasın; telefonu kol mesafesinde tutun.
        </li>
        <li>
          <strong>Tam önden bakın</strong>, başınızı dik tutun; saç, gözlük ya da el yüzü kapatmasın.
        </li>
        <li>
          <strong>Gün ışığında</strong>, gölgesiz; filtre ve güzellik modu kapalı.
        </li>
      </ul>
      <Button onClick={onPick} className="justify-self-start">
        Fotoğraf seçin ya da çekin
      </Button>
      <p className={styles.guideNote}>
        Fotoğrafınız cihazınızdan çıkmaz; yalnızca bu sayfada, bir kerelik işlenir.
      </p>
    </div>
  );
}

export function BridalMakeupStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null); // geçiş katmanı
  const lineRef = useRef<HTMLSpanElement>(null); // sürme ışıltısı
  const shownRef = useRef<{ source: Source | null; hold: boolean }>({
    source: null,
    hold: false,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Her fotoğraf seçimi/kaldırma/ayrılma yeni bir dönem açar; eski dönemin analizi sonuç yazamaz.
  const epochRef = useRef(0);
  const mountedRef = useRef(true);
  const [mode, setMode] = useState<Mode>("sample");
  const [sample, setSample] = useState<Source | null>(null);
  const [modelId, setModelId] = useState(DEFAULT_MODEL);
  const modelCache = useRef(new Map<string, Source>());
  const [own, setOwn] = useState<Source | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [issues, setIssues] = useState<PhotoIssue[]>([]);
  const [look, setLook] = useState<Look>(DEFAULT_BRIDAL_LOOK.look);
  const [presetId, setPresetId] = useState<string | null>(DEFAULT_BRIDAL_LOOK.id);
  const [edited, setEdited] = useState(false);
  const [tab, setTab] = useState<Tab>("lip");
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

  // Tuş basılıyken pencere odağı kaybolursa "Önce" takılı kalmasın.
  useEffect(() => {
    if (!hold || typeof window === "undefined") return;
    const off = () => setHold(false);
    window.addEventListener("blur", off);
    return () => window.removeEventListener("blur", off);
  }, [hold]);

  useEffect(() => {
    if (modelCache.current.has(modelId)) return; // seçicide anında gösterildi
    let alive = true;
    loadSample(analyzeFace, modelId)
      .then((s) => {
        const src = { ...s, width: s.image.width, height: s.image.height };
        modelCache.current.set(modelId, src);
        if (!alive) return;
        setSample(src);
        setStatus((cur) => (cur === "loading" ? (s.face ? "ready" : "error") : cur));
      })
      .catch(() => alive && setStatus((cur) => (cur === "loading" ? "error" : cur)));
    return () => {
      alive = false;
    };
  }, [modelId]);

  function chooseModel(id: string) {
    if (id === modelId) return;
    setHold(false);
    const hit = modelCache.current.get(id);
    if (hit) {
      setSample(hit);
      setStatus(hit.face ? "ready" : "error");
    } else {
      setStatus("loading");
    }
    setModelId(id);
  }

  const current = mode === "own" ? own : sample;

  // Çizim + geçiş: yeni yüz → makyaj soldan sağa "sürülür"; renk değişimi → yumuşak geçiş;
  // "Önce" basılı tutma ve hareketi azalt → anında.
  useEffect(() => {
    const c = canvasRef.current;
    const fx = fxRef.current;
    if (!c || !current) return;
    const prev = shownRef.current;
    shownRef.current = { source: current, hold };
    const draw = (t: HTMLCanvasElement, original = hold) =>
      renderLook(t, current.image, current.face, look, original);
    if (!fx || prefersReducedMotion() || hold !== prev.hold || !current.face) {
      draw(c);
      return;
    }
    if (prev.source !== current) {
      let running = true;
      const stop = sweepReveal(
        c,
        fx,
        lineRef.current,
        (t) => draw(t, true),
        (t) => draw(t, false),
        () => (running = false),
      );
      return () => {
        stop();
        if (running) shownRef.current = prev; // yarıda kesildiyse sonraki çizim yeniden sürsün
      };
    }
    return crossfade(c, fx, () => draw(c));
  }, [current, look, hold]);

  const set = (patch: Partial<Look>) => {
    setLook((l) => ({ ...l, ...patch }));
    setEdited(true);
  };
  const applyPreset = (p: BridalLook) => {
    setLook(p.look);
    setPresetId(p.id);
    setEdited(false);
  };
  const pick = () => fileRef.current?.click();

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // aynı dosya yeniden seçilebilsin
    if (!file) return;
    const epoch = ++epochRef.current;
    const live = () => mountedRef.current && epoch === epochRef.current;
    shownRef.current = { source: null, hold: false };
    setMode("own");
    setOwn(null);
    setHold(false);
    setNotice(null);
    setIssues([]);
    setStatus("analyzing");
    try {
      const photo = await photoFromFile(file);
      if (!live()) return;
      const size = sizeIssues(photo.width, photo.height);
      if (size.some((i) => i.blocking)) {
        setIssues(size);
        setStatus("rejected");
        return;
      }
      setOwn({ ...photo, face: null }); // fotoğraf hemen görünür; tarama sürerken
      const face = await analyzeFace(photo.image);
      if (!live()) return; // kaldırıldı ya da yerine başka fotoğraf seçildi
      setOwn({ ...photo, face });
      setIssues(face ? [...size, ...faceIssues(photo.image.width, face.points)] : size);
      setStatus(face ? "ready" : "noface");
    } catch (err) {
      if (!live()) return;
      if (err instanceof Error && err.message === "file_too_large") {
        setIssues([{ code: "too_large", text: TOO_LARGE_TEXT, blocking: true }]);
        setStatus("rejected");
        return;
      }
      setStatus("error");
    }
  }

  /** Kendi fotoğrafını bırakır: süren analiz iptal, gösterim/geçiş referansları ve tamponları temizlenir. */
  function releaseOwn() {
    epochRef.current++;
    shownRef.current = { source: null, hold: false };
    const fx = fxRef.current;
    if (fx) {
      fx.getAnimations?.().forEach((a) => a.cancel());
      fx.width = 0;
      fx.height = 0;
    }
    lineRef.current?.getAnimations?.().forEach((a) => a.cancel());
    setOwn(null);
    setIssues([]);
    setHold(false);
    setNotice(null);
  }

  function showSample() {
    if (status === "analyzing") releaseOwn(); // yarım kalan yüklemeyi sürdürme
    setMode("sample");
    setHold(false);
    setNotice(null);
    setIssues([]);
    setStatus(sample ? (sample.face ? "ready" : "error") : "loading");
  }

  function showOwn() {
    setMode("own");
    setHold(false);
    setNotice(null);
    if (own) setStatus(own.face ? "ready" : "noface");
  }

  function forgetOwn() {
    releaseOwn();
    setStatus("loading"); // rehber görünür; durum metni yok
    setMode("own");
  }

  /** Sıfırla: seçili görünümün ilk hâline döner; görünüm yoksa makyajsız. */
  function reset() {
    const p = BRIDAL_LOOKS.find((b) => b.id === presetId);
    setLook(p ? p.look : BARE_LOOK);
    setEdited(false);
  }

  function clearMakeup() {
    setLook(BARE_LOOK);
    setPresetId(null);
    setEdited(false);
  }

  async function save() {
    const c = canvasRef.current;
    if (!c) return;
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.92));
    if (!blob) return;
    const file = new File([blob], "celine-dugun-makyaji.jpg", { type: "image/jpeg" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Celine Gelinlik — düğün makyajı denemem" });
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
  }

  const holdOff = () => setHold(false);

  /** Sekmeler: seçili olan tek sekme durağı; ok/Home/End ile gezinme ve seçim. */
  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = TABS.length;
    const next =
      e.key === "ArrowRight"
        ? (i + 1) % n
        : e.key === "ArrowLeft"
          ? (i - 1 + n) % n
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  }
  const holdKey = (e: KeyboardEvent, on: boolean) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setHold(on);
    }
  };

  const ready = status === "ready" && Boolean(current?.face);
  const showGuide = mode === "own" && !own && status !== "analyzing";
  const statusText = STATUS_TEXT[status];

  return (
    <div className={styles.studio}>
      <div className={styles.modes} role="group" aria-label="Fotoğraf">
        <button type="button" className={styles.mode} aria-pressed={mode === "sample"} onClick={showSample}>
          Örnek yüz
        </button>
        <button type="button" className={styles.mode} aria-pressed={mode === "own"} onClick={showOwn}>
          Kendi fotoğrafım
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={onFile}
        />
      </div>

      {mode === "sample" && (
        <div className={styles.models} role="group" aria-label="Manken seçin">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={styles.model}
              aria-pressed={modelId === m.id}
              aria-label={`Manken: ${m.label}`}
              title={m.label}
              onClick={() => chooseModel(m.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={modelImage(m.id)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.stageWrap}>
          <figure className={styles.stage}>
            {showGuide ? (
              <PhotoGuide onPick={pick} />
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  className={styles.canvas}
                  role="img"
                  aria-label={
                    mode === "own" ? "Sizin fotoğrafınız, seçili düğün makyajıyla" : "Örnek yüz, seçili düğün makyajıyla"
                  }
                />
                <canvas ref={fxRef} className={styles.fx} aria-hidden="true" />
                <span ref={lineRef} className={styles.sweep} aria-hidden="true" />
                {status === "analyzing" && own && <span className={styles.scan} aria-hidden="true" />}
                <span className={styles.badge}>{mode === "own" ? "Sizin fotoğrafınız" : "Demo"}</span>
                {statusText && status !== "ready" && (
                  <p className={styles.status} role="status">
                    {statusText}
                  </p>
                )}
                {ready && (
                  <button
                    type="button"
                    className={styles.compare}
                    onPointerDown={() => setHold(true)}
                    onPointerUp={holdOff}
                    onPointerLeave={holdOff}
                    onPointerCancel={holdOff}
                    onBlur={holdOff}
                    onKeyDown={(e) => holdKey(e, true)}
                    onKeyUp={(e) => holdKey(e, false)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {hold ? "Makyajsız" : "Öncesi — basılı tutun"}
                  </button>
                )}
              </>
            )}
          </figure>
        </div>

        <div className={styles.panel}>
          {issues.length > 0 && (
            <ul className={styles.issues} role="status">
              {issues.map((i) => (
                <li key={i.code} data-blocking={i.blocking || undefined}>
                  {i.text}
                </li>
              ))}
            </ul>
          )}

          <BridalPresets active={presetId} edited={edited} onPick={applyPreset} disabled={!ready} />

          <div className={styles.tabs} role="tablist" aria-label="İnce ayar">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`makeup-tab-${t.id}`}
                aria-controls={`makeup-panel-${t.id}`}
                aria-selected={tab === t.id}
                tabIndex={tab === t.id ? 0 : -1}
                className={styles.tab}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            key={tab}
            role="tabpanel"
            id={`makeup-panel-${tab}`}
            aria-labelledby={`makeup-tab-${tab}`}
            className={styles.tabPanel}
          >
            {tab === "lip" && (
              <>
                <Swatches
                  label="Ruj"
                  shades={LIP_SHADES}
                  texture="lip"
                  value={look.lip}
                  onChange={(lip) => set({ lip })}
                  disabled={!ready}
                />
                <Amount
                  value={look.lipAmount}
                  onChange={(lipAmount) => set({ lipAmount })}
                  disabled={!ready}
                />
              </>
            )}
            {tab === "face" && (
              <>
                <Swatches
                  label="Fondöten"
                  pan
                  shades={FOUNDATION_SHADES}
                  value={look.foundation}
                  onChange={(foundation) => set({ foundation })}
                  disabled={!ready}
                />
                <Amount
                  label="Kapatıcılık"
                  value={look.foundationAmount}
                  onChange={(foundationAmount) => set({ foundationAmount })}
                  disabled={!ready}
                />
                <div className={styles.group}>
                  <span className={styles.groupLabel}>Işık ve gölge</span>
                  <div className={styles.chips}>
                    <Toggle
                      label="Kapatıcı"
                      on={look.concealer}
                      disabled={!ready}
                      onChange={(concealer) => set({ concealer })}
                    />
                    <Toggle
                      label="Aydınlatıcı"
                      on={look.highlight}
                      disabled={!ready}
                      onChange={(highlight) => set({ highlight })}
                    />
                  </div>
                </div>
                <Swatches
                  label="Kontür / bronzer"
                  pan
                  shades={CONTOUR_SHADES}
                  value={look.contour}
                  onChange={(contour) => set({ contour })}
                  disabled={!ready}
                />
                <Swatches
                  label="Allık"
                  pan
                  shades={BLUSH_SHADES}
                  value={look.blush}
                  onChange={(blush) => set({ blush })}
                  disabled={!ready}
                />
                <Amount
                  value={look.sculptAmount}
                  onChange={(sculptAmount) => set({ sculptAmount })}
                  disabled={!ready}
                />
              </>
            )}
            {tab === "eye" && (
              <>
                <Swatches
                  label="Far"
                  shades={SHADOW_SHADES}
                  pan
                  value={look.shadow}
                  onChange={(shadow) => set({ shadow })}
                  disabled={!ready}
                />
                <div className={styles.group}>
                  <span className={styles.groupLabel}>Eyeliner</span>
                  <Toggle
                    label={look.liner ? "Açık" : "Kapalı"}
                    on={look.liner}
                    disabled={!ready}
                    onChange={(liner) => set({ liner })}
                  />
                </div>
                <Amount
                  value={look.makeupAmount}
                  onChange={(makeupAmount) => set({ makeupAmount })}
                  disabled={!ready}
                />
                <Swatches
                  label="Maskara"
                  shades={LASH_SHADES}
                  texture="lash"
                  value={look.lash}
                  onChange={(lash) => set({ lash })}
                  disabled={!ready}
                />
                <Amount
                  label="Hacim"
                  value={look.lashAmount}
                  onChange={(lashAmount) => set({ lashAmount })}
                  disabled={!ready}
                />
              </>
            )}
            {tab === "brow" && (
              <>
                <Swatches
                  label="Kaş rengi"
                  shades={BROW_SHADES}
                  texture="brow"
                  value={look.brow}
                  onChange={(brow) => set({ brow })}
                  disabled={!ready}
                />
                <Amount
                  value={look.browAmount}
                  onChange={(browAmount) => set({ browAmount })}
                  disabled={!ready}
                />
              </>
            )}
            {tab === "hair" && (
              <>
                <Swatches
                  label="Saç rengi"
                  shades={HAIR_SHADES}
                  texture="hair"
                  value={look.hair}
                  onChange={(hair) => set({ hair })}
                  disabled={!ready}
                />
                <Amount
                  value={look.hairAmount}
                  onChange={(hairAmount) => set({ hairAmount })}
                  disabled={!ready}
                />
                {ready && current?.face && !current.face.hair && (
                  <p className={styles.hint}>Bu fotoğrafta saç ayırt edilemedi.</p>
                )}
              </>
            )}
          </div>

          <div className={styles.actions}>
            <Button size="sm" onClick={save} disabled={!ready}>
              Kaydet / paylaş
            </Button>
            <Button size="sm" variant="outline" onClick={reset} disabled={!ready || !edited}>
              Sıfırla
            </Button>
            <Button size="sm" variant="outline" onClick={clearMakeup} disabled={!ready}>
              Makyajı kaldır
            </Button>
            {mode === "own" && (own || status === "rejected" || status === "noface") && (
              <>
                <Button size="sm" variant="outline" onClick={pick}>
                  Başka fotoğraf
                </Button>
                {own && (
                  <Button size="sm" variant="outline" onClick={forgetOwn}>
                    Fotoğrafımı kaldır
                  </Button>
                )}
              </>
            )}
          </div>
          {notice && (
            <p className={styles.hint} role="status">
              {notice}
            </p>
          )}

          <p className={styles.privacy}>
            Fotoğrafınız cihazınızdan çıkmaz: yüz ve saç tespiti bu sayfada, tarayıcınızda yapılır. Hiçbir
            yere yüklenmez ve kaydedilmez; sayfadan çıktığınızda silinir. Renkler fotoğraf üzerinde yaklaşık
            gösterilir; gerçek makyaj sonucu farklılık gösterebilir.
          </p>
        </div>
      </div>

      <p className={styles.credit}>
        Manken fotoğrafları: Pexels ({MODELS.map((m) => m.credit).join(", ")}). Şu an:{" "}
        {modelById(modelId).label}.
      </p>
    </div>
  );
}

export default BridalMakeupStudio;
