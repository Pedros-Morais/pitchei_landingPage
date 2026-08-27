/*
 * Hero 3D loader, gate de motion-reduce + viewport + idle, depois dynamic import
 * do módulo Three.js. Roda no bundle inicial (~0.5KB gz). Three.js entra
 * num chunk separado, lazy-loaded.
 */
import { lazyMount } from "./lazy-mount";

type Mount3DStack = (root: HTMLElement) => () => void;

function shouldEnable(): boolean {
  if (typeof window === "undefined") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (matchMedia("(max-width: 768px)").matches) return false;
  return document.querySelector("[data-hud-3d-root]") !== null;
}

lazyMount({
  shouldEnable,
  idleFallbackMs: 600,
  async mount() {
    const root = document.querySelector<HTMLElement>("[data-hud-3d-root]");
    if (!root) return;
    const mod = (await import("./hud-stack-3d")) as { mount3DStack: Mount3DStack };
    return mod.mount3DStack(root);
  },
});

export {};
