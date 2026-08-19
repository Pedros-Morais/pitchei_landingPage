#!/usr/bin/env node
// Testa a conexão com o Supabase usando as mesmas credenciais/cliente que a
// landing page usa (src/lib/supabase.ts), sem precisar subir o Astro.
//
// Uso:
//   node --env-file=.env scripts/test-supabase-connection.mjs
//
// Faz um INSERT real na tabela `waitlist` (a única operação que o anon key
// tem permissão de fazer, ver supabase/migrations/0001_create_waitlist.sql —
// não há policy de SELECT para anon). O email de teste é único e claramente
// marcado (origem: "connection-test"), pode ser apagado depois pelo
// dashboard/SQL Editor.

import { createClient } from "@supabase/supabase-js";

const url = process.env.PUBLIC_SUPABASE_URL;
const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "Faltam PUBLIC_SUPABASE_URL e/ou PUBLIC_SUPABASE_ANON_KEY.\n" +
      "Copie .env.example para .env e preencha com os valores do seu projeto\n" +
      "(Supabase Dashboard > Project Settings > API), depois rode:\n" +
      "  node --env-file=.env scripts/test-supabase-connection.mjs",
  );
  process.exit(1);
}

console.log(`URL: ${url}`);
console.log(`Anon key: ${anonKey.slice(0, 12)}...${anonKey.slice(-6)}\n`);

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const testEmail = `connection-test+${Date.now()}@pitchei.com.br`;

console.log(`Inserindo linha de teste (${testEmail})...`);
const { error } = await supabase.from("waitlist").insert({
  email: testEmail,
  origem: "connection-test",
});

if (error) {
  console.error("\n❌ Falhou:", error.message);
  console.error(`   code: ${error.code ?? "n/a"} · details: ${error.details ?? "n/a"}`);
  console.error(
    "\nCausas comuns: URL/anon key errados, tabela `waitlist` não migrada\n" +
      "(supabase db push), ou policy de INSERT alterada/removida.",
  );
  process.exit(1);
}

console.log("\n✅ Conexão OK — insert aceito pelo Supabase.");
console.log(
  `   Apague a linha de teste quando quiser (SQL Editor):\n` +
    `   delete from waitlist where email = '${testEmail}';`,
);
