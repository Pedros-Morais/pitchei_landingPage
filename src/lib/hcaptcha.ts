const SITE_KEY = import.meta.env.PUBLIC_HCAPTCHA_SITE_KEY as
  | string
  | undefined;

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement,
        opts: { sitekey: string; size?: "invisible" | "compact" | "normal" },
      ) => string;
      execute: (widgetId: string, opts?: { async?: boolean }) => Promise<{
        response: string;
      }>;
      reset: (widgetId?: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;
let widgetId: string | null = null;

// The rendered widget is tied to a #hcaptcha-host div injected at runtime,
// which does not reliably survive an Astro client-side page transition.
// Drop the cached widget and its container so the next call re-renders
// against a fresh one instead of executing against a detached iframe.
if (typeof document !== "undefined") {
  document.addEventListener("astro:before-preparation", () => {
    widgetId = null;
    document.getElementById("hcaptcha-host")?.remove();
  });
}

export function isCaptchaConfigured(): boolean {
  return Boolean(SITE_KEY);
}

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.hcaptcha) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("hcaptcha-load-failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

async function ensureWidget(): Promise<string | null> {
  if (!SITE_KEY) return null;
  await loadScript();
  if (!window.hcaptcha) return null;
  if (widgetId) return widgetId;

  // Hidden container, invisible captcha doesn't render UI unless challenged.
  let container = document.getElementById("hcaptcha-host");
  if (!container) {
    container = document.createElement("div");
    container.id = "hcaptcha-host";
    container.style.position = "fixed";
    container.style.bottom = "0";
    container.style.right = "0";
    container.style.zIndex = "9998";
    document.body.appendChild(container);
  }

  widgetId = window.hcaptcha.render(container, {
    sitekey: SITE_KEY,
    size: "invisible",
  });
  return widgetId;
}

export async function getCaptchaToken(): Promise<string | null> {
  if (!SITE_KEY) return null;
  try {
    const id = await ensureWidget();
    if (!id || !window.hcaptcha) return null;
    const { response } = await window.hcaptcha.execute(id, { async: true });
    // Reset so the next execute() produces a fresh token
    try {
      window.hcaptcha.reset(id);
    } catch {}
    return response || null;
  } catch {
    return null;
  }
}
