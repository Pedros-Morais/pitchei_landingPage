# voice-suggest

Edge function que alimenta o demo de microfone da landing.

Recebe a frase capturada pelo navegador via Web Speech API, chama Neuralake
(mesmo provedor do app macOS) e devolve uma sugestão pronta-pra-falar em JSON.

## Endpoint

```
POST  {SUPABASE_URL}/functions/v1/voice-suggest

Headers:
  Content-Type: application/json
  Authorization: Bearer {PUBLIC_SUPABASE_ANON_KEY}
  apikey: {PUBLIC_SUPABASE_ANON_KEY}

Body:
  { "transcript": "tô achando o preço meio salgado", "captchaToken": "..." }

Resp 200:
  { "speaker": "Cliente", "suggestion": "...", "source": "ai" }

Resp 4xx/5xx:
  { "error": "rate-limit" | "captcha-required" | "invalid-transcript" |
             "ai-error" | "server-misconfig" }
```

## Variáveis (secrets)

```sh
supabase secrets set NEURALAKE_API_KEY=ns-live-...
supabase secrets set HCAPTCHA_SECRET=...        # opcional
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetados automaticamente
pelo Supabase no runtime — não precisa setar.

## Deploy

```sh
# Migração da tabela de rate-limit (uma vez)
supabase db push

# Deploy da função (re-rodar a cada mudança no index.ts)
supabase functions deploy voice-suggest --no-verify-jwt
```

`--no-verify-jwt` desliga o check de JWT do Supabase para POSTs do site
público. A função usa o anon key apenas como invocation gate; a autorização
real é IP rate-limit + hCaptcha (opcional).

## Teste local

```sh
# .env.local na raiz do projeto principal (NÃO da landing):
NEURALAKE_API_KEY=ns-live-...
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=...

supabase functions serve voice-suggest --no-verify-jwt --env-file .env.local
```

Testa com curl:

```sh
curl -X POST http://127.0.0.1:54321/functions/v1/voice-suggest \
  -H "Content-Type: application/json" \
  -d '{"transcript":"qual o seu TAM no mercado brasileiro?"}'
```

## Rate-limit

- **Hard**: 5 chamadas / IP / hora → 429.
- **Soft**: 3 chamadas / IP / 5 min → exige `captchaToken` válido (apenas se
  `HCAPTCHA_SECRET` estiver configurada; caso contrário, libera).
- Ledger em `public.voice_calls` (RLS ativa, service_role only).

## Prompt

Adaptado do prompt do app principal (`AGENTS/05-llm-and-prompts.md`) para o
caso de uso de demo: uma frase isolada, sem briefing, sem transcrição
histórica. Saída em JSON estrito `{speaker, suggestion}` — o front-end espera
esse shape.

Se a saída não parsear, há um fallback no front-end (`src/lib/voice-suggestions.ts`)
que faz keyword-match local — assim a demo nunca quebra.
