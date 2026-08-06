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

  // ---------- 2. Pinned hero with scroll-driven scenes ----------
  const hero = document.querySelector<HTMLElement>("section[aria-labelledby='hero-titulo']");
  const hudRoot = document.querySelector<HTMLElement>("[data-hud-3d-root]");
  if (hero && hudRoot) {
    hudRoot.setAttribute("data-scene-mode", "scroll");

    const heroST = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      // Scroll distance the hero stays pinned while the 3 HUD scenes play.
      // Tunable: higher = more scroll-through, lower = snappier. Was "+=200%"
      // (3 viewports) which felt like the page was stuck on the hero.
      end: "+=60%",
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate(self) {
        hudRoot.style.setProperty("--scene-progress", self.progress.toFixed(3));
      },
    });
    cleanups.push(() => {
      hudRoot.removeAttribute("data-scene-mode");
      hudRoot.style.removeProperty("--scene-progress");
      heroST.kill();
    });
  }

  // ---------- 3. Custom cursor ----------
  const cursorDot = document.querySelector<HTMLElement>(".cursor-dot");
  const cursorRing = document.querySelector<HTMLElement>(".cursor-ring");
  if (cursorDot && cursorRing) {
    const dotX = gsap.quickTo(cursorDot, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(cursorDot, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(cursorRing, "x", { duration: 0.32, ease: "power3" });
    const ringY = gsap.quickTo(cursorRing, "y", { duration: 0.32, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.classList.add("cursor-on");

    // Reactive states on interactive
    const interactiveSel = "a, button, [data-magnetic], summary, input, [role='button']";
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest(interactiveSel)) {
        cursorRing.classList.add("cursor-ring--active");
        cursorDot.classList.add("cursor-dot--hidden");
      }
    };
    const onOut = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest(interactiveSel)) {
        cursorRing.classList.remove("cursor-ring--active");
        cursorDot.classList.remove("cursor-dot--hidden");
      }
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    cleanups.push(() => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.documentElement.classList.remove("cursor-on");
      cursorRing.classList.remove("cursor-ring--active");
      cursorDot.classList.remove("cursor-dot--hidden");
    });
  }

  // ---------- 4. Magnetic snap ----------
  const magnets = document.querySelectorAll<HTMLElement>("[data-magnetic]");
  magnets.forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "elastic.out(1, 0.5)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "elastic.out(1, 0.5)" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      xTo(dx);
      yTo(dy);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.set(el, { clearProps: "x,y" });
    });
  });

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

  // ---------- 6. Vertical progress rail ----------
  const rail = document.querySelector<HTMLElement>(".section-rail");
  if (rail) {
    rail.classList.add("section-rail--on");
    const dots = rail.querySelectorAll<HTMLElement>("[data-rail-dot]");
    const labelEl = rail.querySelector<HTMLElement>(".section-rail-label");

    const sections = Array.from(dots)
      .map((dot) => {
        const targetSel = dot.dataset.target;
        if (!targetSel) return null;
        const section = document.querySelector<HTMLElement>(targetSel);
        return section ? { dot, section, label: dot.dataset.label || "" } : null;
      })
      .filter(Boolean) as { dot: HTMLElement; section: HTMLElement; label: string }[];

    function setActive(idx: number) {
      sections.forEach((s, i) => {
        s.dot.classList.toggle("section-rail-dot--active", i === idx);
      });
      if (labelEl && sections[idx]) {
        labelEl.textContent = sections[idx]!.label;
        gsap.fromTo(
          labelEl,
          { opacity: 0, x: 6 },
          { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", overwrite: true },
        );
      }
    }

    sections.forEach(({ section }, idx) => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onToggle(self) {
          if (self.isActive) setActive(idx);
        },
      });
      cleanups.push(() => st.kill());
    });

    // Click navigation via Lenis
    sections.forEach(({ dot, section }) => {
      const onClick = (e: Event) => {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(section, { offset: -64, duration: 1.0 });
        } else {
          section.scrollIntoView({ behavior: "smooth" });
        }
      };
      dot.addEventListener("click", onClick);
      cleanups.push(() => dot.removeEventListener("click", onClick));
    });
    cleanups.push(() => rail.classList.remove("section-rail--on"));

    // Initial active
    setActive(0);
  }

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
