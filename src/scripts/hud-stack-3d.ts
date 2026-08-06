/*
 * HUD 3D stack, pure CSS 3D + tiny JS controller (~1KB).
 *
 * No Three.js needed. We layer 3 cards with translateZ(), and a small
 * controller updates 4 CSS custom props on the root from mouse + scroll:
 *   --rx, --ry  (rotation in deg, ±)
 *   --depth     (scroll progress 0..1)
 *   --idle-t    (continuous time for ambient breath)
 *
 * The CSS in animations.css consumes these and choreographs the cards.
 *
 * Loaded by hero-3d-loader.ts only on desktop without prefers-reduced-motion.
 */

export function mount3DStack(root: HTMLElement): () => void {
  // Mark the root so animations.css can target it
  root.setAttribute("data-hud-3d-active", "true");

  // Reveal ghost cards (start hidden in markup, fade in on mount)
  root
    .querySelectorAll<HTMLElement>("[data-hud-ghost]")
    .forEach((el) => {
      el.style.display = "block";
      el.classList.add("hud-ghost-fade-in");
    });

  // ---------- mouse parallax (eased) ----------
  const mouse = { tx: 0, ty: 0, x: 0, y: 0 };
  function onPointerMove(e: PointerEvent) {
    const r = root.getBoundingClientRect();
    mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1; // -1..1
    mouse.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  }
  function onPointerLeave() {
    mouse.tx = 0;
    mouse.ty = 0;
  }
  root.addEventListener("pointermove", onPointerMove, { passive: true });
  root.addEventListener("pointerleave", onPointerLeave, { passive: true });

  // ---------- scroll progress ----------
  const scrollState = { progress: 0 };
  let scrollRaf = 0;
  function updateScroll() {
    const r = root.getBoundingClientRect();
    const total = r.height + window.innerHeight;
    const traveled = window.innerHeight - r.top;
    scrollState.progress = Math.max(0, Math.min(1, traveled / total));
    scrollRaf = 0;
  }
  function onScroll() {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScroll);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  updateScroll();

  // ---------- visibility (pause rAF) ----------
  let visible = true;
  let tabActive = !document.hidden;
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]!.isIntersecting;
    },
    { threshold: 0.01 },
  );
  io.observe(root);
  function onVisChange() {
    tabActive = !document.hidden;
  }
  document.addEventListener("visibilitychange", onVisChange);

  // ---------- ghost transcript cycler ----------
  const SCENE_DURATION_MS = 24_000;
  const ghostTranscripts = [
    { mid: "qual o seu TAM no mercado brasileiro?", back: "tô achando o preço meio salgado…" },
    { mid: "tô achando o preço meio salgado…", back: "o ROI do projeto fechou em quanto?" },
    { mid: "o ROI do projeto fechou em quanto?", back: "qual o seu TAM no mercado brasileiro?" },
  ];
  const ghostMidLine = root.querySelector<HTMLElement>("[data-hud-ghost='mid'] [data-ghost-line]");
  const ghostBackLine = root.querySelector<HTMLElement>("[data-hud-ghost='back'] [data-ghost-line]");
  function applyGhostTranscripts(idx: number) {
    if (!ghostMidLine || !ghostBackLine) return;
    const pair = ghostTranscripts[idx]!;
    ghostMidLine.textContent = `"${pair.mid}"`;
    ghostBackLine.textContent = `"${pair.back}"`;
  }
  applyGhostTranscripts(0);

  // ---------- main loop ----------
  const startedAt = performance.now();
  let rafId = 0;
  let lastSceneIdx = -1;

  function tick(now: number) {
    rafId = requestAnimationFrame(tick);
    if (!visible || !tabActive) return;

    // Ease mouse
    mouse.x += (mouse.tx - mouse.x) * 0.07;
    mouse.y += (mouse.ty - mouse.y) * 0.07;

    // Compute rotations: cap at ±10°
    const rx = -mouse.y * 9;
    const ry = mouse.x * 12;

    // Ambient breath adds tiny drift even without cursor
    const t = (now - startedAt) / 1000;
    const breathRy = Math.sin(t * 0.35) * 1.2;
    const breathRx = Math.cos(t * 0.28) * 0.8;

    root.style.setProperty("--rx", `${(rx + breathRx).toFixed(2)}deg`);
    root.style.setProperty("--ry", `${(ry + breathRy).toFixed(2)}deg`);
    root.style.setProperty("--depth", scrollState.progress.toFixed(3));

    // Ghost transcript cycle
    const elapsedMs = now - startedAt;
    const idx = Math.floor((elapsedMs % SCENE_DURATION_MS) / (SCENE_DURATION_MS / 3));
    if (idx !== lastSceneIdx) {
      applyGhostTranscripts(idx);
      lastSceneIdx = idx;
    }
  }
  rafId = requestAnimationFrame(tick);

  // ---------- cleanup ----------
  return () => {
    cancelAnimationFrame(rafId);
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisChange);
    window.removeEventListener("scroll", onScroll);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerleave", onPointerLeave);
    root.removeAttribute("data-hud-3d-active");
    root.style.removeProperty("--rx");
    root.style.removeProperty("--ry");
    root.style.removeProperty("--depth");
    root.querySelectorAll<HTMLElement>("[data-hud-ghost]").forEach((el) => {
      el.style.display = "none";
      el.classList.remove("hud-ghost-fade-in");
    });
  };
}
