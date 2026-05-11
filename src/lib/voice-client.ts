import { matchSuggestion, type Suggestion } from "./voice-suggestions";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as
  | string
  | undefined;

export type FetchResult =
  | { ok: true; speaker: string; suggestion: string; source: "ai" | "fallback" }
  | { ok: false; reason: "rate-limit" | "captcha-required" | "config" | "network" | "ai-error"; fallback: Suggestion };

const RECENT_CALLS_KEY = "pitchei:voice-recent-calls";
const SOFT_WINDOW_MS = 5 * 60 * 1000;
const SOFT_THRESHOLD = 3;

function getRecentCalls(): number[] {
  try {
    const raw = localStorage.getItem(RECENT_CALLS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as number[];
    const cutoff = Date.now() - SOFT_WINDOW_MS;
    return Array.isArray(arr) ? arr.filter((t) => t > cutoff) : [];
  } catch {
    return [];
  }
}

function pushCall(ts: number) {
  const arr = getRecentCalls();
  arr.push(ts);
  try {
    localStorage.setItem(RECENT_CALLS_KEY, JSON.stringify(arr));
  } catch {}
}

export function shouldRequireCaptcha(): boolean {
  return getRecentCalls().length >= SOFT_THRESHOLD;
}

export async function suggestFromAI(
  transcript: string,
  captchaToken?: string,
): Promise<FetchResult> {
  const fallback = matchSuggestion(transcript);
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, reason: "config", fallback };
  }

  const url = `${SUPABASE_URL.replace(/\/+$/, "")}/functions/v1/voice-suggest`;
  try {
    pushCall(Date.now());
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ transcript, captchaToken }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        speaker: string;
        suggestion: string;
        source?: "ai" | "fallback";
      };
      return {
        ok: true,
        speaker: data.speaker,
        suggestion: data.suggestion,
        source: data.source ?? "ai",
      };
    }
    if (res.status === 429) {
      return { ok: false, reason: "rate-limit", fallback };
    }
    if (res.status === 403) {
      return { ok: false, reason: "captcha-required", fallback };
    }
    return { ok: false, reason: "ai-error", fallback };
  } catch {
    return { ok: false, reason: "network", fallback };
  }
}
