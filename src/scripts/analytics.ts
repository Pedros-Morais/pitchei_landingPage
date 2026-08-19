// Loads Google Analytics only after the visitor has granted consent
// (src/lib/consent.ts). Never runs on its own from Base.astro.
const GA_ID = "G-PFZS1F8F9R";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let loaded = false;

export function loadAnalytics() {
  if (loaded || typeof document === "undefined") return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => window.dataLayer!.push(args);
  gtag("js", new Date());
  gtag("config", GA_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}
