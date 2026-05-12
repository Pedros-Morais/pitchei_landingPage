/*
 * Particle text effect — vanilla TS port (no React, no shadcn).
 *
 * Renders text via offscreen canvas, samples its pixels, and animates a
 * particle for each sampled point toward its target. Words cycle on a
 * timer. Each new word picks a fresh color from the brand palette.
 *
 * Gates:
 * - prefers-reduced-motion → renders a static text fallback (no animation).
 * - canvas not in viewport → animation paused via IntersectionObserver.
 *
 * Responsive:
 * - ResizeObserver re-sizes the canvas + recomputes text layout.
 * - DPR-aware (crisp on retina, downsampled on low-DPI mobile).
 *
 * Brand:
 * - Fraunces (already loaded by Base.astro), serif, black weight.
 * - Color cycle: orange / flame / amber / paper (no random RGB).
 */

const PIXEL_STEP = 6;
const DRAW_AS_POINTS = true;
const WORD_DURATION_MS = 4000;
const PARTICLE_SIZE_MIN = 6;
const PARTICLE_SIZE_MAX = 12;

const PALETTE: Array<{ r: number; g: number; b: number }> = [
  { r: 232, g: 93, b: 38 },   // orange #E85D26
  { r: 255, g: 122, b: 69 },  // flame #FF7A45
  { r: 255, g: 179, b: 71 },  // amber #FFB347
  { r: 247, g: 243, b: 238 }, // paper #F7F3EE
];

type Vec = { x: number; y: number };
type RGB = { r: number; g: number; b: number };

class Particle {
  pos: Vec = { x: 0, y: 0 };
  vel: Vec = { x: 0, y: 0 };
  acc: Vec = { x: 0, y: 0 };
  target: Vec = { x: 0, y: 0 };

  closeEnoughTarget = 100;
  maxSpeed = 1.0;
  maxForce = 0.1;
  particleSize = 10;
  isKilled = false;

  startColor: RGB = { r: 0, g: 0, b: 0 };
  targetColor: RGB = { r: 0, g: 0, b: 0 };
  colorWeight = 0;
  colorBlendRate = 0.01;

  move(): void {
    const dx = this.pos.x - this.target.x;
    const dy = this.pos.y - this.target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let proximityMult = 1;
    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget;
    }

    const tx = this.target.x - this.pos.x;
    const ty = this.target.y - this.pos.y;
    const mag = Math.sqrt(tx * tx + ty * ty);
    let desiredX = 0;
    let desiredY = 0;
    if (mag > 0) {
      desiredX = (tx / mag) * this.maxSpeed * proximityMult;
      desiredY = (ty / mag) * this.maxSpeed * proximityMult;
    }

    let steerX = desiredX - this.vel.x;
    let steerY = desiredY - this.vel.y;
    const steerMag = Math.sqrt(steerX * steerX + steerY * steerY);
    if (steerMag > 0) {
      steerX = (steerX / steerMag) * this.maxForce;
      steerY = (steerY / steerMag) * this.maxForce;
    }

    this.acc.x += steerX;
    this.acc.y += steerY;

    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, asPoints: boolean): void {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
    }
    const r = Math.round(
      this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
    );
    const g = Math.round(
      this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
    );
    const b = Math.round(
      this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
    );

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    if (asPoints) {
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
    } else {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  kill(width: number, height: number): void {
    if (this.isKilled) return;
    const randomPos = scatterFromCenter(
      width / 2,
      height / 2,
      (width + height) / 2,
    );
    this.target.x = randomPos.x;
    this.target.y = randomPos.y;

    this.startColor = {
      r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
      g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
      b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
    };
    this.targetColor = { r: 28, g: 15, b: 9 }; // ink, not pure black
    this.colorWeight = 0;
    this.isKilled = true;
  }
}

function scatterFromCenter(cx: number, cy: number, mag: number): Vec {
  // Random direction × magnitude — drives killed particles outward.
  const angle = Math.random() * Math.PI * 2;
  return { x: cx + Math.cos(angle) * mag, y: cy + Math.sin(angle) * mag };
}

type CanvasController = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Particle[];
  words: string[];
  wordIndex: number;
  frameCount: number;
  rafId: number | null;
  isVisible: boolean;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
  wordTimerId: number | null;
};

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  word: string,
  maxWidth: number,
  maxHeight: number,
): number {
  // Start from a tall size and shrink until the rasterized text fits the box.
  // measureText is cheap; cap iterations for safety.
  const widthBudget = maxWidth * 0.86;
  const heightBudget = maxHeight * 0.78;
  let size = Math.round(Math.min(maxWidth * 0.4, heightBudget));
  for (let i = 0; i < 24; i++) {
    ctx.font = `900 ${size}px Fraunces, ui-serif, Georgia, serif`;
    const m = ctx.measureText(word);
    const w = m.width;
    // ascent + descent gives a real glyph height (descender-aware)
    const h =
      (m.actualBoundingBoxAscent ?? size * 0.8) +
      (m.actualBoundingBoxDescent ?? size * 0.2);
    if (w <= widthBudget && h <= heightBudget) break;
    const scale = Math.min(widthBudget / w, heightBudget / h);
    size = Math.max(12, Math.floor(size * scale * 0.96));
  }
  return size;
}

function nextWord(c: CanvasController, word: string): void {
  const off = document.createElement("canvas");
  off.width = c.cssWidth;
  off.height = c.cssHeight;
  const offCtx = off.getContext("2d");
  if (!offCtx) return;

  const fontSize = fitFontSize(offCtx, word, c.cssWidth, c.cssHeight);
  offCtx.fillStyle = "white";
  offCtx.font = `900 ${fontSize}px Fraunces, ui-serif, Georgia, serif`;
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText(word, c.cssWidth / 2, c.cssHeight / 2);

  const img = offCtx.getImageData(0, 0, c.cssWidth, c.cssHeight);
  const pixels = img.data;

  const newColor = PALETTE[c.wordIndex % PALETTE.length]!;

  let particleIndex = 0;
  const coords: number[] = [];
  const step = PIXEL_STEP * 4;
  for (let i = 0; i < pixels.length; i += step) coords.push(i);

  // Fisher–Yates to scramble the assignment so particles move in fluidly
  for (let i = coords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [coords[i], coords[j]] = [coords[j]!, coords[i]!];
  }

  for (const coordIndex of coords) {
    const alpha = pixels[coordIndex + 3];
    if (!alpha) continue;
    const x = (coordIndex / 4) % c.cssWidth;
    const y = Math.floor(coordIndex / 4 / c.cssWidth);

    let particle: Particle;
    if (particleIndex < c.particles.length) {
      particle = c.particles[particleIndex]!;
      particle.isKilled = false;
      particleIndex++;
    } else {
      particle = new Particle();
      const startPos = scatterFromCenter(
        c.cssWidth / 2,
        c.cssHeight / 2,
        (c.cssWidth + c.cssHeight) / 2,
      );
      particle.pos.x = startPos.x;
      particle.pos.y = startPos.y;
      particle.maxSpeed = Math.random() * 6 + 4;
      particle.maxForce = particle.maxSpeed * 0.05;
      particle.particleSize =
        Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN;
      particle.colorBlendRate = Math.random() * 0.0275 + 0.0025;
      c.particles.push(particle);
    }

    particle.startColor = {
      r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
      g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
      b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
    };
    particle.targetColor = { ...newColor };
    particle.colorWeight = 0;
    particle.target.x = x;
    particle.target.y = y;
  }

  // Kill any leftover particles (longer word → shorter word transition)
  for (let i = particleIndex; i < c.particles.length; i++) {
    c.particles[i]!.kill(c.cssWidth, c.cssHeight);
  }
}

function frame(c: CanvasController): void {
  // Motion-blur backdrop (matches the section's bg-ink-gradient tone)
  c.ctx.fillStyle = "rgba(28, 15, 9, 0.18)";
  c.ctx.fillRect(0, 0, c.cssWidth, c.cssHeight);

  for (let i = c.particles.length - 1; i >= 0; i--) {
    const p = c.particles[i]!;
    p.move();
    p.draw(c.ctx, DRAW_AS_POINTS);
    if (p.isKilled) {
      if (
        p.pos.x < 0 ||
        p.pos.x > c.cssWidth ||
        p.pos.y < 0 ||
        p.pos.y > c.cssHeight
      ) {
        c.particles.splice(i, 1);
      }
    }
  }

  c.frameCount++;
  if (c.isVisible) {
    c.rafId = requestAnimationFrame(() => frame(c));
  } else {
    c.rafId = null;
  }
}

function setupCanvas(canvas: HTMLCanvasElement): {
  ctx: CanvasRenderingContext2D;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
} | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(1, Math.round(rect.width));
  const cssHeight = Math.max(1, Math.round(rect.height));
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, cssWidth, cssHeight, dpr };
}

function renderStaticFallback(canvas: HTMLCanvasElement, words: string[]): void {
  // prefers-reduced-motion path: just paint the words in soft amber.
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, cssWidth, cssHeight } = setup;
  ctx.fillStyle = "#1C0F09";
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = "#FFB347";
  const word = words[0] ?? "";
  const fontSize = fitFontSize(ctx, word, cssWidth, cssHeight);
  ctx.font = `900 ${fontSize}px Fraunces, ui-serif, Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(word, cssWidth / 2, cssHeight / 2);
}

async function mount(canvas: HTMLCanvasElement): Promise<() => void> {
  const wordsRaw = canvas.getAttribute("data-words");
  let words: string[] = [];
  try {
    words = wordsRaw ? (JSON.parse(wordsRaw) as string[]) : [];
  } catch {
    words = [];
  }
  if (words.length === 0) return () => {};

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    renderStaticFallback(canvas, words);
    return () => {};
  }

  // Wait for the brand font so the rasterized text uses Fraunces, not a
  // fallback (which produces a glyph-mass swap when the font lands).
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const setup = setupCanvas(canvas);
  if (!setup) return () => {};

  const controller: CanvasController = {
    canvas,
    ctx: setup.ctx,
    particles: [],
    words,
    wordIndex: 0,
    frameCount: 0,
    rafId: null,
    isVisible: false,
    cssWidth: setup.cssWidth,
    cssHeight: setup.cssHeight,
    dpr: setup.dpr,
    wordTimerId: null,
  };

  nextWord(controller, words[0]!);

  const advance = () => {
    controller.wordIndex = (controller.wordIndex + 1) % controller.words.length;
    nextWord(controller, controller.words[controller.wordIndex]!);
  };

  const startLoop = () => {
    if (controller.rafId !== null) return;
    controller.isVisible = true;
    controller.rafId = requestAnimationFrame(() => frame(controller));
    if (controller.wordTimerId === null) {
      controller.wordTimerId = window.setInterval(advance, WORD_DURATION_MS);
    }
  };

  const stopLoop = () => {
    controller.isVisible = false;
    if (controller.rafId !== null) {
      cancelAnimationFrame(controller.rafId);
      controller.rafId = null;
    }
    if (controller.wordTimerId !== null) {
      clearInterval(controller.wordTimerId);
      controller.wordTimerId = null;
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) startLoop();
        else stopLoop();
      }
    },
    { threshold: 0.01 },
  );
  io.observe(canvas);

  const ro = new ResizeObserver(() => {
    const fresh = setupCanvas(canvas);
    if (!fresh) return;
    controller.ctx = fresh.ctx;
    controller.cssWidth = fresh.cssWidth;
    controller.cssHeight = fresh.cssHeight;
    controller.dpr = fresh.dpr;
    // Re-rasterize current word against the new dimensions
    nextWord(controller, controller.words[controller.wordIndex]!);
  });
  ro.observe(canvas);

  return () => {
    stopLoop();
    io.disconnect();
    ro.disconnect();
    controller.particles.length = 0;
  };
}

let cleanups: Array<() => void> = [];
let booted = false;

async function boot() {
  if (booted) return;
  const targets = document.querySelectorAll<HTMLCanvasElement>(
    "[data-particle-text]",
  );
  if (targets.length === 0) return;
  booted = true;

  const tasks = Array.from(targets).map((c) => mount(c));
  cleanups = await Promise.all(tasks);
}

function teardown() {
  for (const c of cleanups) {
    try {
      c();
    } catch {}
  }
  cleanups = [];
  booted = false;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
document.addEventListener("astro:page-load", boot);
document.addEventListener("astro:before-preparation", teardown, { once: false });

export {};
