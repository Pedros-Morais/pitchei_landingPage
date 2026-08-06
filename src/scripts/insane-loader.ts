/*
 * Insane animation layer loader, gate (motion-reduce + viewport + pointer + idle)
 * + dynamic import do módulo GSAP. Roda no bundle inicial (~0.5KB gz).
 *
 * GSAP + ScrollTrigger entram num chunk separado, lazy-loaded.
 */

let cleanup: (() => void) | null = null;
let booted = false;

function shouldEnable(): boolean {
  if (typeof window === "undefined") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (matchMedia("(max-width: 768px)").matches) return false;
  if (matchMedia("(pointer: coarse)").matches) return false;
  return true;
}

async function enable() {
  if (cleanup) return;
  try {
    // Wait for fonts to settle to avoid layout shift in pinned hero
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }
    const mod = (await import("./insane")) as {
      mountInsane: () => () => void;
    };
    cleanup = mod.mountInsane();
  } catch (err) {
    console.warn("[insane] failed to mount", err);
  }
}

function disable() {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
}

function boot() {
  if (booted) return;
  booted = true;

  if (!shouldEnable()) return;

  if ("requestIdleCallback" in window) {
    (window as Window & typeof globalThis).requestIdleCallback(
      () => enable(),
      { timeout: 1500 },
    );
  } else {
    setTimeout(() => enable(), 800);
  }

  document.addEventListener(
    "astro:before-preparation",
    () => {
      disable();
      booted = false;
    },
    { once: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
document.addEventListener("astro:page-load", boot);

export {};
