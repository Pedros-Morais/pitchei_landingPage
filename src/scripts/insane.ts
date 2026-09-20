/*
 * GSAP + ScrollTrigger animation layer.
 * Lazy-loaded by insane-loader.ts only on desktop, fine pointer, motion-OK.
 *
 * Features:
 *  1. Lenis ↔ ScrollTrigger bridge
 *  2. Pinned hero with scroll-driven HUD scenes (--scene-progress 0..1)
 *  3. Custom orange cursor + ring on interactive
 *  4. Magnetic snap on [data-magnetic] CTAs
 *  5. Word-stagger reveal on h2 [data-h2-split]
 *  6. Vertical section progress rail
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Cleanup = () => void;

export function mountInsane(): Cleanup {
  const cleanups: Cleanup[] = [];

  // ---------- 1. Lenis ↔ ScrollTrigger bridge ----------
  // CRITICAL: pause Lenis's own rAF first. Otherwise lenis.raf is called
  // by both lenis.ts's loop AND gsap.ticker, causing scroll jitter and
  // doubled scroll deltas.
  const lenis = window.__pitcheiLenis;
  const lenisCtrl = window.__pitcheiLenisCtrl;
  if (lenis && lenisCtrl) {
    lenisCtrl.pauseRaf();

    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    cleanups.push(() => {
      lenis.off("scroll", onLenisScroll);
      gsap.ticker.remove(tickerFn);
      lenisCtrl.resumeRaf();
    });
  }

  document.documentElement.classList.add("insane-on");
  cleanups.push(() => document.documentElement.classList.remove("insane-on"));

  // ---------- 2. HUD scene mode: time-driven loop (no scroll pin) ----------
  // Hero is no longer pinned. HUD scenes loop in CSS time (24s) by default.
  // GSAP no longer drives the HUD; the existing CSS @keyframes handle it.

  // ---------- 3. Custom cursor (disabled on homepage) ----------
  // Custom cursor removed from homepage per redesign.
  // Code preserved for other pages if needed.

  // ---------- 4. Magnetic snap (disabled on homepage) ----------
  // Magnetic snap removed from homepage per redesign.

  // ---------- 5. h2 SplitText word stagger ----------
  const h2s = document.querySelectorAll<HTMLElement>("[data-h2-split]");
  h2s.forEach((h2) => {
    if (h2.dataset.split === "done") return;
    const original = h2.textContent || "";
    h2.dataset.split = "done";
    h2.dataset.original = original;
    h2.innerHTML = original
      .split(/(\s+)/)
      .map((token) =>
        /\s/.test(token)
          ? token
          : `<span class="h2-word"><span class="h2-word-inner">${token}</span></span>`,
      )
      .join("");

    const inners = h2.querySelectorAll(".h2-word-inner");
    const tween = gsap.fromTo(
      inners,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: h2,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
    );
    cleanups.push(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
      h2.innerHTML = h2.dataset.original ?? original;
      delete h2.dataset.split;
      delete h2.dataset.original;
    });
  });

  // ---------- 6. Vertical progress rail (disabled on homepage) ----------
  // Section rail removed from homepage per redesign.

  // ---------- refresh ScrollTrigger now that everything is set up ----------
  // Forces re-measurement with current layout (after font load, mounted DOM).
  // Without this, pin start/end can be stale when mountInsane runs late.
  ScrollTrigger.refresh();

  // ---------- master cleanup ----------
  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    cleanups.length = 0;
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
}
