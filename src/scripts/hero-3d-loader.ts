/*
 * Hero 3D loader — gate de motion-reduce + viewport + idle, depois dynamic import
 * do módulo Three.js. Roda no bundle inicial (~0.5KB gz). Three.js entra
 * num chunk separado, lazy-loaded.
 */

type Mount3DStack = (root: HTMLElement) => () => void;

let cleanup: (() => void) | null = null;
let booted = false;

function shouldEnable(): boolean {
  if (typeof window === "undefined") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (matchMedia("(max-width: 768px)").matches) return false;
  return true;
}

async function enable(root: HTMLElement) {
  if (cleanup) return;
  try {
    const mod = (await import("./hud-stack-3d")) as { mount3DStack: Mount3DStack };
    cleanup = mod.mount3DStack(root);
  } catch (err) {
    console.warn("[hero-3d] failed to mount", err);
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

  const root = document.querySelector<HTMLElement>("[data-hud-3d-root]");
  if (!root) return;
  if (!shouldEnable()) return;

  if ("requestIdleCallback" in window) {
    (window as Window & typeof globalThis).requestIdleCallback(() => enable(root), {
      timeout: 1500,
    });
  } else {
    setTimeout(() => enable(root), 600);
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

export {};
