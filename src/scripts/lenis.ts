/*
 * Lenis smooth scroll. ~4KB. Disabled when prefers-reduced-motion is set.
 *
 * Drives its own rAF by default. When insane.ts mounts (GSAP), it calls
 * pauseRaf() and takes over via gsap.ticker (single driver). Cleanup
 * calls resumeRaf().
 */

import Lenis from "lenis";

type LenisRafControl = {
  pauseRaf: () => void;
  resumeRaf: () => void;
};

declare global {
  interface Window {
    __pitcheiLenis?: Lenis;
    __pitcheiLenisCtrl?: LenisRafControl;
  }
}

function init() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.__pitcheiLenis) return;

  const lenis = new Lenis({
    duration: 0.5,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    touchMultiplier: 1.0,
  });
  window.__pitcheiLenis = lenis;

  let rafId = 0;
  let paused = false;
  function raf(time: number) {
    if (paused) return;
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  window.__pitcheiLenisCtrl = {
    pauseRaf() {
      if (paused) return;
      paused = true;
      cancelAnimationFrame(rafId);
    },
    resumeRaf() {
      if (!paused) return;
      paused = false;
      rafId = requestAnimationFrame(raf);
    },
  };

  // Keep anchor scrolls smooth via Lenis
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as
      | HTMLAnchorElement
      | null;
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target as HTMLElement, { offset: -64, duration: 1.0 });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

document.addEventListener("astro:page-load", () => {
  if (window.__pitcheiLenis) window.__pitcheiLenis.scrollTo(0, { immediate: true });
});
