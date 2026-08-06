/*
 * Voice demo, Web Speech API, PT-BR.
 *
 * Tap the mic CTA → recognition.start() (browser prompts mic permission once)
 * → live transcript renders in the HUD → keyword match → suggestion fades in.
 *
 * Feature-detected. Hidden on Firefox / older Safari. Falls back to tap-mode
 * if permission is denied or no match is found.
 *
 * Nothing leaves the device, everything is local browser recognition.
 */

import { shouldRequireCaptcha, suggestFromAI } from "../lib/voice-client";
import { getCaptchaToken, isCaptchaConfigured } from "../lib/hcaptcha";

const MAX_LISTEN_MS = 6000;
const AUTO_RESET_MS = 12000;

type AnyRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  onresult: ((ev: any) => void) | null;
  onerror: ((ev: any) => void) | null;
  onend: ((ev: any) => void) | null;
  onstart: ((ev: any) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => AnyRecognition;
    webkitSpeechRecognition?: new () => AnyRecognition;
  }
}

let booted = false;
let recognition: AnyRecognition | null = null;
let listenTimeout: number | null = null;
let resetTimeout: number | null = null;

function getRecognitionCtor(): (new () => AnyRecognition) | null {
  const w = window as Window;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) ?? null;
}

function isSupported(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari < 14.5 lacks reliable support; iPad/iPhone before that returns
  // the API but without functional results. We trust feature detect here and
  // let users on broken builds get a clean "no result" fallback.
  return getRecognitionCtor() !== null;
}

function setListening(triggerBtn: HTMLButtonElement, on: boolean) {
  if (on) {
    triggerBtn.setAttribute("data-listening", "true");
    const label = triggerBtn.querySelector<HTMLElement>("[data-voice-trigger-label]");
    if (label) label.textContent = "Ouvindo…";
  } else {
    triggerBtn.removeAttribute("data-listening");
    const label = triggerBtn.querySelector<HTMLElement>("[data-voice-trigger-label]");
    if (label) label.textContent = "Diga uma frase";
  }
}

function setStatus(root: HTMLElement, text: string, showWaveform: boolean) {
  const status = root.querySelector<HTMLElement>("[data-hud-voice-status-text]");
  const wave = root.querySelector<HTMLElement>(".hud-voice-waveform");
  if (status) status.textContent = text;
  if (wave) wave.style.display = showWaveform ? "" : "none";
}

function setTranscript(root: HTMLElement, text: string) {
  const el = root.querySelector<HTMLElement>("[data-hud-voice-transcript]");
  if (el) el.textContent = text ? `“${text}”` : "";
}

function showSuggestion(
  root: HTMLElement,
  speaker: string,
  suggestion: string,
) {
  const box = root.querySelector<HTMLElement>("[data-hud-voice-suggestion]");
  const sp = root.querySelector<HTMLElement>("[data-hud-voice-suggestion-speaker]");
  const tx = root.querySelector<HTMLElement>("[data-hud-voice-suggestion-text]");
  if (sp) sp.textContent = speaker;
  if (tx) tx.textContent = suggestion;
  if (box) box.setAttribute("data-shown", "true");
}

function hideSuggestion(root: HTMLElement) {
  const box = root.querySelector<HTMLElement>("[data-hud-voice-suggestion]");
  if (box) box.removeAttribute("data-shown");
}

function exitVoiceMode(root: HTMLElement, triggerBtn: HTMLButtonElement) {
  if (listenTimeout) {
    clearTimeout(listenTimeout);
    listenTimeout = null;
  }
  if (resetTimeout) {
    clearTimeout(resetTimeout);
    resetTimeout = null;
  }
  try {
    recognition?.abort();
  } catch {}
  recognition = null;
  setListening(triggerBtn, false);
  hideSuggestion(root);
  // Go back to the prior interactive mode if available, else loop.
  const prior = root.getAttribute("data-hud-mode-prior") ?? "tap";
  root.setAttribute("data-hud-mode", prior);
}

function enterVoiceMode(root: HTMLElement) {
  const prior = root.getAttribute("data-hud-mode") ?? "loop";
  if (prior !== "voice") root.setAttribute("data-hud-mode-prior", prior);
  root.setAttribute("data-hud-mode", "voice");
}

function startListening(root: HTMLElement, triggerBtn: HTMLButtonElement) {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return;

  enterVoiceMode(root);
  setStatus(root, "Ouvindo…", true);
  setTranscript(root, "");
  hideSuggestion(root);
  setListening(triggerBtn, true);

  recognition = new Ctor();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let finalTranscript = "";

  recognition.onresult = (ev: any) => {
    let interim = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const result = ev.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interim += result[0].transcript;
      }
    }
    setTranscript(root, (finalTranscript + " " + interim).trim());
  };

  recognition.onerror = (ev: any) => {
    const err = ev?.error ?? "unknown";
    if (err === "not-allowed" || err === "service-not-allowed") {
      setStatus(root, "Sem permissão de mic", false);
      setTranscript(root, "");
      showSuggestion(
        root,
        "Pitchei",
        "Sem problema, toque nos chips acima pra explorar cenários ou entre na lista de espera.",
      );
    } else if (err === "no-speech") {
      setStatus(root, "Não ouvi nada", false);
      showSuggestion(
        root,
        "Pitchei",
        "Tente de novo, pode falar baixinho, eu pego.",
      );
    } else {
      setStatus(root, "Algo deu errado", false);
      showSuggestion(
        root,
        "Pitchei",
        "Tenta outra vez? Funciona melhor em Chrome ou Safari recente.",
      );
    }
    setListening(triggerBtn, false);
    scheduleReset(root, triggerBtn);
  };

  recognition.onend = async () => {
    setListening(triggerBtn, false);
    if (!finalTranscript.trim()) {
      return; // onerror handled it, or user just got nothing
    }
    setStatus(root, "Pitchei pensando", false);
    setTranscript(root, finalTranscript.trim());

    let captchaToken: string | undefined;
    if (shouldRequireCaptcha() && isCaptchaConfigured()) {
      const token = await getCaptchaToken();
      captchaToken = token ?? undefined;
    }

    let result = await suggestFromAI(finalTranscript.trim(), captchaToken);
    if (!result.ok && result.reason === "captcha-required" && isCaptchaConfigured()) {
      const token = await getCaptchaToken();
      if (token) {
        result = await suggestFromAI(finalTranscript.trim(), token);
      }
    }
    if (result.ok) {
      setStatus(
        root,
        result.source === "ai" ? "Resposta sugerida" : "Resposta sugerida (offline)",
        false,
      );
      showSuggestion(root, result.speaker, result.suggestion);
    } else if (result.reason === "rate-limit") {
      setStatus(root, "Limite atingido", false);
      showSuggestion(
        root,
        "Pitchei",
        "Você passou de 5 demos na última hora, entre na lista de espera pra usar de verdade durante reuniões.",
      );
    } else if (result.reason === "captcha-required") {
      setStatus(root, "Confirma que é humano?", false);
      showSuggestion(
        root,
        "Pitchei",
        "Detectamos muitas demos rápidas. Tente de novo em alguns minutos, ou entre na lista de espera.",
      );
    } else {
      // network / config / ai-error → local fallback
      setStatus(root, "Resposta sugerida (offline)", false);
      showSuggestion(root, result.fallback.speaker, result.fallback.suggestion);
    }
    scheduleReset(root, triggerBtn);
  };

  try {
    recognition.start();
  } catch (e) {
    setStatus(root, "Não consegui iniciar", false);
    setListening(triggerBtn, false);
    scheduleReset(root, triggerBtn);
    return;
  }

  // Hard cap listening duration
  listenTimeout = window.setTimeout(() => {
    try {
      recognition?.stop();
    } catch {}
  }, MAX_LISTEN_MS);
}

function scheduleReset(root: HTMLElement, triggerBtn: HTMLButtonElement) {
  if (resetTimeout) clearTimeout(resetTimeout);
  resetTimeout = window.setTimeout(() => {
    exitVoiceMode(root, triggerBtn);
  }, AUTO_RESET_MS);
}

function boot() {
  if (booted) return;
  const root = document.querySelector<HTMLElement>("[data-hud-3d-root]");
  const triggerBtn = document.querySelector<HTMLButtonElement>(
    "[data-voice-trigger]",
  );
  if (!root || !triggerBtn) return;
  booted = true;

  if (!isSupported()) {
    triggerBtn.hidden = true;
    return;
  }

  triggerBtn.hidden = false;

  triggerBtn.addEventListener("click", () => {
    if (triggerBtn.getAttribute("data-listening") === "true") {
      try {
        recognition?.stop();
      } catch {}
      return;
    }
    startListening(root, triggerBtn);
  });

  const retryBtn = root.querySelector<HTMLButtonElement>("[data-hud-voice-retry]");
  retryBtn?.addEventListener("click", () => {
    startListening(root, triggerBtn);
  });

  const dismissBtn = root.querySelector<HTMLButtonElement>(
    "[data-hud-voice-dismiss]",
  );
  dismissBtn?.addEventListener("click", () => {
    exitVoiceMode(root, triggerBtn);
  });

  document.addEventListener(
    "astro:before-preparation",
    () => {
      exitVoiceMode(root, triggerBtn);
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
