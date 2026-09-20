// Default byline for blog posts / guides that don't credit a named human
// author. Shared with content.config.ts (the default value) and schema.ts
// (to know when the JSON-LD author is the team, not a person), so the two
// never drift apart.
export const TEAM_AUTHOR_NAME = "Equipe Pitchei";

export const SITE = {
  name: "Pitchei",
  // The apex domain redirects to www in production. Keep every canonical URL,
  // schema entity, and sitemap on the final destination instead of asking
  // crawlers to reconcile two hostnames.
  domain: "www.pitchei.com.br",
  url: "https://www.pitchei.com.br",
  locale: "pt-BR",
  tagline: "Copiloto de reunião com IA, em português",
  shortDescription:
    "O Pitchei é o copiloto de reunião com IA para macOS: acompanha a conversa e lê a sua tela em tempo real para sugerir o que dizer em português.",
  longDescription:
    "O Pitchei é um aplicativo de mesa para macOS que fica do seu lado nas reuniões que importam. Ele acompanha a conversa e lê a sua tela em tempo real para sugerir o que dizer, em português. Diferente de transcritores que entregam o resumo depois da reunião, o Pitchei ajuda no exato momento em que você trava ou precisa de uma resposta sob pressão.",
  downloads: {
    macOS: {
      url: "https://github.com/Pedros-Morais/pitchei/releases/download/v0.1.0/Pitchei-0.1.0-macOS-universal-notarized.dmg",
      landingPath: "/baixar",
      version: "0.1.0",
      details: "Apple Silicon e Intel · 11,9 MB",
      sha256: "727be76b4a6ecfcb1c2e5052392fc695747f2cc6701f5d005f4d3300e98f25ca",
    },
  },
  ogImage: "/og-default.png",
  twitter: "@pitchei",
  email: "contato@pitchei.com.br",
  // Official profiles for entity SEO, these flow into schema.org `sameAs`
  // (organizationSchema), which is how Google builds the Knowledge Panel and how
  // AI engines disambiguate "Pitchei" as an entity. Add a URL here ONLY when the
  // profile actually exists, `sameAs` pointing at 404s hurts trust.
  // Recommended to create/claim, then paste below: LinkedIn company page,
  // Crunchbase, Product Hunt, G2/Capterra, YouTube, Instagram, Wikidata.
  profiles: [
    "https://twitter.com/pitchei",
    "https://x.com/pitchei",
  ],
} as const;

export type Site = typeof SITE;
