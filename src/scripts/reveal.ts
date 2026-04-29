/*
 * Reveal-on-scroll + cursor magnetic glow + scroll progress.
 * Pure DOM. Astro client:load via <script>. ~1KB gzipped.
 */

const reduced = matchMedia("(prefers-reduced-motion: reduce)");

function initReveal() {
  if (reduced.matches) {
    document
      .querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-stagger]")
      .forEach((el) => el.setAttribute("data-revealed", "true"));
    return;
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
}

function initScrollProgress() {
  if (reduced.matches) return;
  const bar = document.querySelector<HTMLElement>(".scroll-progress");
  if (!bar) return;
  let raf = 0;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const ratio = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
    bar.style.setProperty("--scroll", String(ratio));
    raf = 0;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!raf) raf = requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

function initMagneticGlow() {
  if (reduced.matches) return;
  document.querySelectorAll<HTMLElement>(".magnetic-glow").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mouse-x", `${x}%`);
      el.style.setProperty("--mouse-y", `${y}%`);
    });
  });
}

function initBoomOnSubmit() {
  document.querySelectorAll<HTMLElement>("[data-boom-host]").forEach((host) => {
    const form = host.querySelector("form");
    if (!form) return;
    form.addEventListener("submit", () => {
      host.setAttribute("data-boom", "true");
      setTimeout(() => host.removeAttribute("data-boom"), 800);
    });
  });
}

function boot() {
  initReveal();
  initScrollProgress();
  initMagneticGlow();
  initBoomOnSubmit();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

// re-run after Astro page transitions
document.addEventListener("astro:page-load", boot);
