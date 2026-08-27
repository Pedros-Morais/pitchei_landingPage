/*
 * Insane animation layer loader, gate (motion-reduce + viewport + pointer + idle)
 * + dynamic import do módulo GSAP. Roda no bundle inicial (~0.5KB gz).
 *
 * GSAP + ScrollTrigger entram num chunk separado, lazy-loaded.
 */
import { lazyMount } from "./lazy-mount";

function shouldEnable(): boolean {
  if (typeof window === "undefined") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (matchMedia("(max-width: 768px)").matches) return false;
  if (matchMedia("(pointer: coarse)").matches) return false;
  return true;
}

lazyMount({
  shouldEnable,
  idleFallbackMs: 800,
  async mount() {
    // Wait for fonts to settle to avoid layout shift in pinned hero
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }
    const mod = (await import("./insane")) as { mountInsane: () => () => void };
    return mod.mountInsane();
  },
});

export {};
