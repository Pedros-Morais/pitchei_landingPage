/*
 * Three.js scene — 3 HUD cards stacked in real 3D depth.
 * Lazy-loaded by hero-3d-loader.ts. ~50-60KB gz tree-shaken.
 *
 * Architecture:
 *   root (data-hud-3d-root)
 *     ├── front DOM (the HudMockup CSS card) — animado, z=0
 *     ├── ghost mid (data-hud-ghost="mid") — blur 4px, opacity 0.35
 *     └── ghost back (data-hud-ghost="back") — blur 8px, opacity 0.18
 *
 * CSS3DRenderer monta wrappers absolute sobre o root, aplicando matrix3d
 * em cada CSS3DObject. As animações CSS dentro do front card seguem rodando.
 */

import { Scene, PerspectiveCamera, Object3D, MathUtils } from "three";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

const SCENE_DURATION_MS = 24_000; // 3 cenas × 8s — sincronizado com hud-card

export function mount3DStack(root: HTMLElement): () => void {
  const frontEl = root.querySelector<HTMLElement>("[data-hud-front]");
  const midEl = root.querySelector<HTMLElement>("[data-hud-ghost='mid']");
  const backEl = root.querySelector<HTMLElement>("[data-hud-ghost='back']");
  if (!frontEl || !midEl || !backEl) return () => {};

  // Locked-non-null aliases for closures below
  const front: HTMLElement = frontEl;
  const mid: HTMLElement = midEl;
  const back: HTMLElement = backEl;

  // Reveal ghosts (they start display:none in the DOM until 3D mounts)
  mid.style.display = "block";
  back.style.display = "block";

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 1, 2000);
  camera.position.set(0, 0, 600);

  const renderer = new CSS3DRenderer();
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.pointerEvents = "none"; // events passam pro DOM real
  root.appendChild(renderer.domElement);

  // ----- create CSS3DObjects, swap DOM into the renderer
  const frontObj = new CSS3DObject(front);
  const midObj = new CSS3DObject(mid);
  const backObj = new CSS3DObject(back);

  frontObj.position.set(0, 0, 0);
  midObj.position.set(0, -16, -110);
  backObj.position.set(0, -28, -220);

  // Slight initial tilt so the depth reads
  midObj.rotation.set(0.04, 0.06, 0);
  backObj.rotation.set(0.06, 0.10, 0);

  const group = new Object3D();
  group.add(backObj, midObj, frontObj);
  scene.add(group);

  // ----- size handling
  function resize() {
    const r = root.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    renderer.setSize(r.width, r.height);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(root);

  // ----- mouse parallax (eased)
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

  // ----- scroll progress (0 when hero in view at top, 1 when bottom of hero hits top of viewport)
  const scrollState = { progress: 0 };
  let scrollRaf = 0;
  function updateScroll() {
    const r = root.getBoundingClientRect();
    const total = r.height + window.innerHeight;
    const traveled = window.innerHeight - r.top;
    scrollState.progress = MathUtils.clamp(traveled / total, 0, 1);
    scrollRaf = 0;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScroll);
    },
    { passive: true },
  );
  updateScroll();

  // ----- visibility (pause rAF when offscreen / tab hidden)
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

  // ----- ghost transcript cycler — synced with scene loop
  const ghostTranscripts = [
    { mid: "qual o seu TAM no mercado brasileiro?", back: "tô achando o preço meio salgado…" },
    { mid: "tô achando o preço meio salgado…", back: "o ROI do projeto fechou em quanto?" },
    { mid: "o ROI do projeto fechou em quanto?", back: "qual o seu TAM no mercado brasileiro?" },
  ];
  const ghostMidLine = mid.querySelector<HTMLElement>("[data-ghost-line]");
  const ghostBackLine = back.querySelector<HTMLElement>("[data-ghost-line]");
  function applyGhostTranscripts(idx: number) {
    if (!ghostMidLine || !ghostBackLine) return;
    const pair = ghostTranscripts[idx]!;
    ghostMidLine.textContent = `"${pair.mid}"`;
    ghostBackLine.textContent = `"${pair.back}"`;
  }
  applyGhostTranscripts(0);
  const startedAt = performance.now();

  // ----- main loop
  let rafId = 0;
  let lastSceneIdx = -1;

  function tick(now: number) {
    rafId = requestAnimationFrame(tick);
    if (!visible || !tabActive) return;

    // ease mouse
    mouse.x += (mouse.tx - mouse.x) * 0.07;
    mouse.y += (mouse.ty - mouse.y) * 0.07;

    // ambient breath on group rotation
    const t = (now - startedAt) / 1000;
    const breathY = Math.sin(t * 0.35) * 0.018;
    const breathX = Math.cos(t * 0.28) * 0.012;

    // camera follows mouse softly + breathes
    group.rotation.y = mouse.x * 0.18 + breathY;
    group.rotation.x = -mouse.y * 0.12 + breathX;

    // scroll progress: cards open in Z as user scrolls down hero
    const p = scrollState.progress;
    frontObj.position.z = MathUtils.lerp(0, 60, p);
    midObj.position.z = MathUtils.lerp(-110, -160, p);
    backObj.position.z = MathUtils.lerp(-220, -300, p);

    // back card fades out as scroll progresses
    back.style.opacity = String(MathUtils.lerp(0.18, 0.0, p));
    mid.style.opacity = String(MathUtils.lerp(0.35, 0.12, p));

    // ghost transcript cycle (synced with 3-scene loop)
    const elapsedMs = now - startedAt;
    const idx = Math.floor((elapsedMs % SCENE_DURATION_MS) / (SCENE_DURATION_MS / 3));
    if (idx !== lastSceneIdx) {
      applyGhostTranscripts(idx);
      lastSceneIdx = idx;
    }

    renderer.render(scene, camera);
  }

  // initial ghost fade-in
  requestAnimationFrame(() => {
    mid.style.transition = "opacity 800ms ease-out";
    back.style.transition = "opacity 800ms ease-out";
    mid.style.opacity = "0.35";
    back.style.opacity = "0.18";
  });

  // start the rAF
  rafId = requestAnimationFrame(tick);

  // cleanup
  return () => {
    cancelAnimationFrame(rafId);
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisChange);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerleave", onPointerLeave);
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    // Three.js renderer doesn't expose dispose for CSS3DRenderer — DOM removal is enough
    mid.style.display = "none";
    back.style.display = "none";
  };
}
