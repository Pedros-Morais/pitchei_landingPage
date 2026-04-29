/*
 * Lenis smooth scroll. ~4KB. Disabled when prefers-reduced-motion is set.
 */

import Lenis from "lenis";

declare global {
  interface Window {
    __pitcheiLenis?: Lenis;
  }
}

function init() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.__pitcheiLenis) return;

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    touchMultiplier: 1.0,
  });
  window.__pitcheiLenis = lenis;

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

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
