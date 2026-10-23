/**
 * Demo geçişleri (Web Animations API; CSP'de satır içi stil gerektirmez). Üst katman tuvali (fx)
 * ana tuvalin üstünde durur: sürme efektinde makyajlı kare soldan sağa açılır, renk değişiminde eski
 * kare yumuşakça söner. "Hareketi azalt" açıksa geçiş yok, kare doğrudan çizilir.
 */

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function stopAll(el: Element | null | undefined) {
  el?.getAnimations?.().forEach((a) => a.cancel());
}

function sizeLike(fx: HTMLCanvasElement, main: HTMLCanvasElement) {
  if (fx.width !== main.width) fx.width = main.width;
  if (fx.height !== main.height) fx.height = main.height;
}

/** Renk değişimi: eski kare üst katmanda söner, yeni kare altta hazır. */
export function crossfade(
  main: HTMLCanvasElement,
  fx: HTMLCanvasElement,
  draw: () => void,
  ms = 320,
): () => void {
  stopAll(fx);
  sizeLike(fx, main);
  const ctx = fx.getContext("2d")!;
  ctx.clearRect(0, 0, fx.width, fx.height);
  ctx.drawImage(main, 0, 0);
  draw();
  const anim = fx.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: ms,
    easing: "ease-out",
    fill: "forwards",
  });
  return () => anim.cancel();
}

/**
 * Makyajı "sürme": altta makyajsız kare, üstte makyajlı kare soldan sağa açılır; ışıltılı çizgi
 * açılan kenarı izler. Bitince makyajlı kare ana tuvale geçer. onDone yalnız tamamlanınca çağrılır.
 */
export function sweepReveal(
  main: HTMLCanvasElement,
  fx: HTMLCanvasElement,
  line: HTMLElement | null,
  drawBefore: (c: HTMLCanvasElement) => void,
  drawAfter: (c: HTMLCanvasElement) => void,
  onDone: () => void,
  ms = 1200,
): () => void {
  stopAll(fx);
  stopAll(line);
  drawBefore(main);
  sizeLike(fx, main);
  fx.getContext("2d")!.clearRect(0, 0, fx.width, fx.height);
  drawAfter(fx);
  const easing = "cubic-bezier(0.65, 0, 0.35, 1)";
  const wipe = fx.animate(
    [
      { clipPath: "inset(0 100% 0 0)", opacity: 1 },
      { clipPath: "inset(0 0% 0 0)", opacity: 1 },
    ],
    { duration: ms, easing, fill: "forwards", delay: 250 },
  );
  const glow = line?.animate(
    [
      { left: "0%", opacity: 0 },
      { left: "8%", opacity: 1, offset: 0.08 },
      { left: "92%", opacity: 1, offset: 0.92 },
      { left: "100%", opacity: 0 },
    ],
    { duration: ms, easing, fill: "forwards", delay: 250 },
  );
  wipe.onfinish = () => {
    drawAfter(main);
    stopAll(fx);
    stopAll(line);
    onDone();
  };
  return () => {
    wipe.onfinish = null;
    wipe.cancel();
    glow?.cancel();
  };
}
