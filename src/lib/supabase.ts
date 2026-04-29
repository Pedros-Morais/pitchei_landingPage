import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (cached) return cached;
  cached = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export type WaitlistEntry = {
  email: string;
  origem?: string;
  user_agent?: string;
  referer?: string;
};

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: "invalid-email" | "duplicate" | "config" | "network" | "unknown"; message?: string };

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function joinWaitlist(entry: WaitlistEntry): Promise<WaitlistResult> {
  const email = entry.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, reason: "invalid-email" };

  const sb = getSupabase();
  if (!sb) return { ok: false, reason: "config", message: "Supabase não configurado." };

  const { error } = await sb.from("waitlist").insert({
    email,
    origem: entry.origem ?? "landing-pt-br",
    user_agent: entry.user_agent,
    referer: entry.referer,
  });

  if (!error) return { ok: true };
  // Postgres unique violation
  if (error.code === "23505") return { ok: false, reason: "duplicate" };
  if (error.code === "23514") return { ok: false, reason: "invalid-email" };
  return { ok: false, reason: "unknown", message: error.message };
}
