# SEO + AI-Engine (GEO/AEO) strategy, Pitchei

Where you already stand (don't redo): JSON-LD via `src/lib/schema.ts`, AI-crawler
allowlist in `public/robots.txt`, bilingual `public/llms.txt` with a "Fatos
canônicos para citação por LLMs" block, sitemap + RSS, hreflang + canonical in
`src/components/SEO.astro`, and a structured programmatic hub (`/guia-de-pitch`).
That's ahead of most sites. This doc is the **next layer**.

Legend: ✅ done · ⚠️ gap · 🔧 action

---

## The core idea
There are now three search surfaces, and they increasingly reward the *same*
things, clear, structured, factual, entity-rich, citable content:
1. **Classic organic** (Google/Bing blue links).
2. **AI Overviews / SGE** (answer boxes in Google/Bing that *cite* sources).
3. **Answer engines** (ChatGPT-search, Perplexity, Claude, Gemini), GEO/AEO.

The winning move for all three is the same: become the most comprehensive,
best-structured, most-corroborated pt-BR source on your topics. Below, the
specific levers.

---

## Part 1, Topical authority (biggest lever)
Google and LLMs both reward depth on a topic, not one-off pages.
- 🔧 **Hub-and-spoke clusters.** You started with `/guia-de-pitch`. Give each core
  theme its own hub + tightly interlinked spokes: `pitch`, `reunião com IA`,
  `vendas consultiva`, `entrevista`. Dense internal linking (via `related[]`)
  tells both Google and LLMs "this site is *the* authority on pitch em português."
- 🔧 **Comparison / "alternativa a" pages.** You have vs-Otter, vs-Fathom. These
  are disproportionately cited by AI for "melhor X" / "alternativa a Y" queries.
  Expand: `melhores assistentes de reunião com IA`, `alternativa ao [concorrente]
  em português`, more `pitchei-vs-*`. High intent + high AI-citation rate.
- 🔧 **Glossary / "o que é" pages.** LLMs pull definitions verbatim. A
  `/glossario` of pt-BR terms (pitch, elevator pitch, discovery, TAM, follow-up…)
  with `DefinedTerm` schema (see Part 4) is cheap and highly citable.

## Part 2, Answer Engine Optimization (GEO/AEO)
How to get *cited inside AI answers*, not just ranked.
- 🔧 **Answer-first blocks.** Open every page/section with a direct, quotable
  40-60-word answer to the question in the heading, then elaborate. LLMs lift the
  concise answer. Your TL;DR + FAQ already do this, extend a "Resposta rápida"
  block to the top of every guide and key page.
- 🔧 **Question-shaped headings.** Phrase H2/H3 as the questions people ask AI
  ("Como fazer um pitch de vendas?"), not label-style ("Estrutura"). Your FAQ
  entries are perfect seeds, promote them to headings.
- 🔧 **Original data = the single highest-leverage GEO asset.** LLMs
  preferentially cite primary sources with concrete numbers. Run one small survey
  ("Estado do pitch no Brasil 2026: X% trava ao falar de preço") → one
  `/relatorio` page. This *also* earns backlinks (see `backlink-plan.md`). Do this
  before almost anything else.
- ✅ **`llms.txt` with canonical facts**, keep it curated; point it at your most
  citable pages (guias, comparativos, glossário, relatório).
- 🔧 **`llms-full.txt`**, emerging convention: a full-text expansion for models
  that fetch it. Generate at build from your content.
- 🔧 **Corroboration across sources.** LLMs trust claims echoed on third-party
  sites (Reddit, YouTube, Wikipedia/Wikidata, review sites). This overlaps with
  Entity SEO (Part 3) and the backlink plan, it's the same work paying triple.

## Part 3, Entity SEO & E-E-A-T
Make "Pitchei" a recognized *entity*, not just a domain. This is what AI engines
trust.
- ⚠️ **`sameAs` is thin.** `schema.ts` lists only twitter/x.
  🔧 Add every official profile and cross-link them all back to the site:
  LinkedIn company page, Crunchbase, Product Hunt, G2/Capterra, GitHub, Instagram,
  YouTube, and pursue a **Wikidata** item. `sameAs` is how Google builds the
  Knowledge Panel and how LLMs disambiguate the entity.
- 🔧 **Author entities (E-E-A-T).** `author` is "Equipe Pitchei" everywhere.
  Named authors with real bios + `Person` schema + LinkedIn raise trust for advice
  content. Add an `author` object to the guide/blog schema and an `/autores` page.
- 🔧 **Genuine reviews.** When you have real ratings (G2/Capterra/PH), add
  `AggregateRating` + `Review` to `SoftwareApplication`. Never fabricate, Google
  penalizes fake review markup.

## Part 4, Structured-data expansion (concrete `schema.ts` additions)
You have Organization, WebSite, SoftwareApplication, FAQ, HowTo, VideoObject,
Article, AboutPage, CollectionPage, Breadcrumb. Add:
- 🔧 `definedTermSchema()` / `DefinedTermSet`, for the glossary (Part 1). Strong
  AI-definition signal.
- 🔧 `SearchAction` (sitelinks searchbox) on `webSiteSchema()`, potential search
  box in Google + tells engines you have on-site search.
- 🔧 `Speakable` on FAQ/answer blocks, voice-assistant eligibility.
- 🔧 `ItemList` on hub pages (`/guia-de-pitch`, `/blog`, `/casos-de-uso`), helps
  AI enumerate your content.
- 🔧 `QAPage` where appropriate (distinct from `FAQPage`).
- 🔧 Enrich `SoftwareApplication`: real `AggregateRating`, `Review`, screenshots,
  `featureList` (already good), `datePublished`.

## Part 5, Technical
- ✅ **Hero value prop is server-rendered text** (`Hero.astro`), particle canvas is
  `aria-hidden`. Keep this discipline: never let GSAP/particles be the *only*
  carrier of important copy, most AI crawlers don't run JS.
- ⚠️ **Raw `<img>`, no `astro:assets`.** 🔧 Use `<Image>` for responsive,
  optimized images + descriptive alt text; add an image sitemap. Alt text is read
  by AI for image context; LCP/CWV benefit too.
- 🔧 **Core Web Vitals audit.** The 3D hero (`hud-stack-3d`, `hero-3d-loader`),
  GSAP, Lenis and particle scripts are LCP/INP risk. Measure with PageSpeed;
  lazy-load/defer below-the-fold; ship the smallest hero critical path. Page
  experience is a ranking + AI-Overview factor.
- 🔧 **Verify rendered-HTML completeness** for every new template, `curl`-equiv
  (server HTML) must contain the H1, answer blocks, and body, not JS-injected.

## Part 6, Off-page (see also `backlink-plan.md`)
- Digital PR around the original-research asset (Part 2) → authoritative citations
  that feed both rankings and LLM corroboration.
- YouTube: demo/how-to videos with `VideoObject` (helper already exists!). YouTube
  is the #2 search engine and surfaces in Google + AI Overviews.
- Reddit/community presence (LLMs heavily cite Reddit now), value-first, no spam.

## Part 7, Measurement
- 🔧 **GA4 AI-referral segment**: track referrals from `chatgpt.com`,
  `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`.
- 🔧 **GSC**: monitor AI-Overview impressions + question-query performance.
- 🔧 **Citation checks**: monthly, ask ChatGPT/Perplexity your core questions
  ("melhor copiloto de reunião em português", "como fazer um pitch de vendas") and
  log whether Pitchei is cited.

---

## Prioritized roadmap (impact × effort)
**Do first (high impact, low/med effort):**
1. Expand `sameAs` + claim/create third-party profiles (Wikidata, LinkedIn,
   Crunchbase, G2, Product Hunt). Foundational for AI trust. 🔧 code + ops
2. Answer-first "Resposta rápida" blocks + question-shaped headings across guides.
3. One original-research/`/relatorio` page. Highest single GEO + backlink lever.
4. Glossary (`/glossario`) + `DefinedTerm` schema.
5. Expand comparison / "alternativa a" pages.

**Next (med effort):**
6. Author E-E-A-T (`Person` schema + `/autores`), genuine `AggregateRating`.
7. `SearchAction`, `Speakable`, `ItemList` schema additions.
8. `astro:assets` image optimization + image sitemap.
9. YouTube demos + `VideoObject` on-page.
10. `llms-full.txt`; keep `llms.txt` curated.

**Ongoing:**
11. CWV audit of 3D/GSAP; GA4 AI-referral tracking; monthly citation checks.
