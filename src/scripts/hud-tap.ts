/*
 * HUD tap-to-cycle, chip-based scene navigation for mobile / reduced-motion.
 *
 * Default mode is "loop" (CSS-driven timer). On screens < lg (1024px) or when
 * prefers-reduced-motion is set, we switch the root to data-hud-mode="tap" so
 * chips become visible and control the active scene via [data-active-scene].
 *
 * If GSAP later sets [data-scene-mode="scroll"], we step aside (chips hide
 * via CSS, GSAP drives scenes by --scene-progress).
 */

const CYCLE_MS = 7000;
const TOTAL_SCENES = 3;

let booted = false;
let cycleTimer: number | null = null;

function setActive(root: HTMLElement, index: number) {
  const i = ((index % TOTAL_SCENES) + TOTAL_SCENES) % TOTAL_SCENES;
  root.setAttribute("data-active-scene", String(i));
  root
    .querySelectorAll<HTMLButtonElement>("[data-hud-chip]")
    .forEach((btn) => {
      const idx = Number(btn.dataset.sceneIndex ?? "0");
      btn.setAttribute("aria-pressed", idx === i ? "true" : "false");
    });
}

function startAutoCycle(root: HTMLElement) {
  stopAutoCycle();
  cycleTimer = window.setInterval(() => {
    const current = Number(root.getAttribute("data-active-scene") ?? "0");
    setActive(root, current + 1);
  }, CYCLE_MS);
}

function stopAutoCycle() {
  if (cycleTimer !== null) {
    clearInterval(cycleTimer);
    cycleTimer = null;
  }
}

function shouldUseTap(): boolean {
  if (typeof window === "undefined") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (!matchMedia("(min-width: 1024px)").matches) return true;
  return false;
}

function boot() {
  if (booted) return;
  const root = document.querySelector<HTMLElement>("[data-hud-3d-root]");
  if (!root) return;
  booted = true;

  // Wire chip listeners regardless of mode, they're a no-op until tap mode is active.
  root.querySelectorAll<HTMLButtonElement>("[data-hud-chip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.sceneIndex ?? "0");
      setActive(root, idx);
      stopAutoCycle();
      // Defer restart so user feels in control briefly
      window.setTimeout(() => {
        if (root.getAttribute("data-hud-mode") === "tap") startAutoCycle(root);
      }, 10_000);
    });
  });

  if (shouldUseTap() && root.getAttribute("data-scene-mode") !== "scroll") {
    root.setAttribute("data-hud-mode", "tap");
    setActive(root, 0);
    startAutoCycle(root);
  }

  // If GSAP later takes over (scroll mode), pause our timer.
  const obs = new MutationObserver(() => {
    if (root.getAttribute("data-scene-mode") === "scroll") {
      stopAutoCycle();
    }
  });
  obs.observe(root, { attributes: true, attributeFilter: ["data-scene-mode"] });

  // Re-evaluate on resize across the lg breakpoint
  const mql = matchMedia("(min-width: 1024px)");
  const onChange = () => {
    if (root.getAttribute("data-scene-mode") === "scroll") return;
    if (shouldUseTap()) {
      if (root.getAttribute("data-hud-mode") !== "tap") {
        root.setAttribute("data-hud-mode", "tap");
        setActive(root, Number(root.getAttribute("data-active-scene") ?? "0"));
        startAutoCycle(root);
      }
    } else {
      if (root.getAttribute("data-hud-mode") === "tap") {
        root.setAttribute("data-hud-mode", "loop");
        stopAutoCycle();
      }
    }
  };
  if (mql.addEventListener) mql.addEventListener("change", onChange);

  document.addEventListener(
    "astro:before-preparation",
    () => {
      stopAutoCycle();
      obs.disconnect();
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
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
