// Minimal analytics consent state, persisted so the banner only asks once.
const KEY = "pitchei-consent";

export type ConsentValue = "granted" | "denied";

export function getConsent(): ConsentValue | null {
  if (typeof localStorage === "undefined") return null;
  const value = localStorage.getItem(KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function setConsent(value: ConsentValue) {
  localStorage.setItem(KEY, value);
  document.dispatchEvent(new CustomEvent<ConsentValue>("pitchei:consent-change", { detail: value }));
}
