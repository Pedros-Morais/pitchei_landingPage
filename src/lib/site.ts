export const SITE = {
  name: "Pitchei",
  domain: "pitchei.com.br",
  url: "https://pitchei.com.br",
  locale: "pt-BR",
  tagline: "Copiloto de reunião com IA, em português",
  shortDescription:
    "O Pitchei é o copiloto de reunião com IA para Mac e Windows: ouve a conversa e lê a sua tela em tempo real e sugere o que dizer em português, ao vivo e sem ninguém saber.",
  longDescription:
    "O Pitchei é um aplicativo de mesa para Mac e Windows que fica do seu lado nas reuniões que importam. Ele ouve a conversa e lê a sua tela em tempo real e sugere o que dizer, em português, sem ninguém saber. Diferente de transcritores como Otter e Fathom, que só entregam o resumo depois da reunião, o Pitchei ajuda no exato momento em que você trava ou precisa de uma resposta sob pressão.",
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
