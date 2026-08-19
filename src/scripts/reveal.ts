/*
 * Reveal-on-scroll + cursor magnetic glow + scroll progress.
 * Pure DOM. Astro client:load via <script>. ~1KB gzipped.
 */

const reduced = matchMedia("(prefers-reduced-motion: reduce)");

// Cleanup for whatever the previous boot() wired up, run before the next one.
let teardown: (() => void) | null = null;

function initReveal(): () => void {
  if (reduced.matches) {
    document
      .querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-stagger]")
      .forEach((el) => el.setAttribute("data-revealed", "true"));
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).setAttribute("data-revealed", "true");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  document
    .querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-stagger]")
    .forEach((el) => io.observe(el));

  return () => io.disconnect();
}

function initScrollProgress(): () => void {
  if (reduced.matches) return () => {};
  const bar = document.querySelector<HTMLElement>(".scroll-progress");
  if (!bar) return () => {};
  let raf = 0;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const ratio = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
    bar.style.setProperty("--scroll", String(ratio));
    raf = 0;
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  update();

  return () => {
    window.removeEventListener("scroll", onScroll);
    if (raf) cancelAnimationFrame(raf);
  };
}

function initMagneticGlow(): () => void {
  if (reduced.matches) return () => {};
  const els = Array.from(document.querySelectorAll<HTMLElement>(".magnetic-glow"));
  const onMove = (e: PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mouse-x", `${x}%`);
    el.style.setProperty("--mouse-y", `${y}%`);
  };
  els.forEach((el) => el.addEventListener("pointermove", onMove));

  return () => els.forEach((el) => el.removeEventListener("pointermove", onMove));
}

function boot() {
  teardown?.();
  const disposers = [initReveal(), initScrollProgress(), initMagneticGlow()];
  teardown = () => disposers.forEach((dispose) => dispose());
  // boom is fired by waitlist-form on success only
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

// re-run after Astro page transitions, tearing down the previous wiring first
document.addEventListener("astro:page-load", boot);

export {};
