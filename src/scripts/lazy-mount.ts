/*
 * Shared lazy-mount wiring for scripts that dynamic-import a heavy module
 * (Three.js, GSAP) once the device looks capable and the browser is idle,
 * and tear it down on Astro client-side page transitions so the gate is
 * re-evaluated fresh on the next page.
 */
export function lazyMount(opts: {
  shouldEnable: () => boolean;
  mount: () => Promise<(() => void) | void>;
  idleTimeoutMs?: number;
  idleFallbackMs?: number;
}) {
  let cleanup: (() => void) | null = null;
  let booted = false;

  async function enable() {
    if (cleanup) return;
    try {
      const result = await opts.mount();
      cleanup = typeof result === "function" ? result : null;
    } catch (err) {
      console.warn("[lazy-mount] failed to mount", err);
    }
  }

  function disable() {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  }

  function boot() {
    // Re-check shouldEnable() on every boot instead of latching it once,
    // so a page without the target element/gate doesn't permanently block
    // mounting on a later page that has it.
    if (booted || !opts.shouldEnable()) return;
    booted = true;

    if ("requestIdleCallback" in window) {
      (window as Window & typeof globalThis).requestIdleCallback(enable, {
        timeout: opts.idleTimeoutMs ?? 1500,
      });
    } else {
      setTimeout(enable, opts.idleFallbackMs ?? 600);
    }

    // Pause when navigating away via View Transitions
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
}
