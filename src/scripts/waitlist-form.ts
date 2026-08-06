/*
 * Waitlist form handler, wires the CTA form to Supabase.
 * Loading / success / error states com mensagens em pt-BR.
 * Re-armado após cada astro:page-load (View Transitions).
 */

import { joinWaitlist } from "~/lib/supabase";

type FormState = "idle" | "loading" | "success" | "error";

function getEls(host: HTMLElement) {
  return {
    form: host.querySelector<HTMLFormElement>("form"),
    input: host.querySelector<HTMLInputElement>("input[type='email']"),
    button: host.querySelector<HTMLButtonElement>("button[type='submit']"),
    status: host.querySelector<HTMLElement>("[data-form-status]"),
  };
}

function setState(host: HTMLElement, state: FormState, msg?: string) {
  host.setAttribute("data-state", state);
  const { button, status } = getEls(host);
  if (button) {
    button.disabled = state === "loading";
    button.textContent =
      state === "loading"
        ? "Cadastrando…"
        : state === "success"
          ? "Você está dentro"
          : "Quero entrar";
  }
  if (status) {
    status.textContent = msg ?? "";
    status.dataset.tone =
      state === "success" ? "good" : state === "error" ? "bad" : "muted";
  }
}

function reasonToMessage(
  reason: "invalid-email" | "duplicate" | "config" | "network" | "unknown",
  fallback?: string,
): string {
  switch (reason) {
    case "invalid-email":
      return "Email inválido. Confere a digitação.";
    case "duplicate":
      return "Esse email já está na lista. A gente te avisa.";
    case "config":
      return "A lista está em manutenção. Tenta de novo em alguns minutos.";
    case "network":
      return "Sem conexão. Tenta de novo.";
    default:
      return fallback ?? "Algo deu errado. Tenta de novo.";
  }
}

function attach(host: HTMLElement) {
  if (host.dataset.bound === "true") return;
  host.dataset.bound = "true";

  const { form, input } = getEls(host);
  if (!form || !input) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // honeypot anti-bot
    const honey = form.querySelector<HTMLInputElement>("input[name='_gotcha']");
    if (honey?.value) return;

    const email = input.value.trim();
    if (!email) {
      setState(host, "error", "Coloca seu email aí.");
      return;
    }

    setState(host, "loading");

    let result;
    try {
      result = await joinWaitlist({
        email,
        origem: form.querySelector<HTMLInputElement>("input[name='origem']")?.value || "landing-pt-br",
        user_agent: navigator.userAgent,
        referer: document.referrer || undefined,
      });
    } catch (err) {
      setState(host, "error", reasonToMessage("network"));
      return;
    }

    if (result.ok) {
      setState(host, "success", "Pronto. A gente te chama quando abrir vaga.");
      host.setAttribute("data-boom", "true");
      setTimeout(() => host.removeAttribute("data-boom"), 800);
      input.value = "";
    } else {
      setState(host, "error", reasonToMessage(result.reason, result.message));
    }
  });
}

function boot() {
  document
    .querySelectorAll<HTMLElement>("[data-waitlist]")
    .forEach((host) => attach(host));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
document.addEventListener("astro:page-load", boot);
