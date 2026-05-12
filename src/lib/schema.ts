import { SITE } from "./site";

export type FAQItem = { question: string; answer: string };
export type Crumb = { name: string; url: string };

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/logo.svg`,
      width: 300,
      height: 80,
    },
    description: SITE.shortDescription,
    inLanguage: SITE.locale,
    foundingDate: "2026",
    knowsAbout: [
      "Real-time meeting assistant",
      "AI meeting copilot",
      "Pitch coaching",
      "Sales enablement",
      "Interview preparation",
    ],
    sameAs: ["https://twitter.com/pitchei", "https://x.com/pitchei"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: SITE.email,
        contactType: "customer support",
        availableLanguage: ["Portuguese"],
      },
    ],
  } as const;
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: SITE.locale,
    publisher: { "@id": `${SITE.url}/#organization` },
    description: SITE.shortDescription,
  } as const;
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE.url}/#app`,
    name: SITE.name,
    operatingSystem: "macOS 13+",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "MeetingAssistant",
    description: SITE.longDescription,
    url: SITE.url,
    inLanguage: SITE.locale,
    softwareVersion: "beta",
    image: `${SITE.url}${SITE.ogImage}`,
    featureList: [
      "Transcrição em tempo real em português",
      "Sugestões contextuais durante a reunião",
      "Captura local via ScreenCaptureKit (macOS)",
      "Latência menor que 1 segundo",
      "Sem gravação de áudio",
      "Texto descartado depois da sessão",
      "Funciona em Google Meet, Zoom, Teams, Slack Huddles, FaceTime",
    ],
    publisher: { "@id": `${SITE.url}/#organization` },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      availability: "https://schema.org/PreOrder",
      url: `${SITE.url}/#cadastro`,
    },
  } as const;
}

export function faqSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  } as const;
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url.startsWith("http") ? c.url : `${SITE.url}${c.url}`,
    })),
  } as const;
}

export type HowToStep = { name: string; text: string };

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    inLanguage: SITE.locale,
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  } as const;
}

export function videoObjectSchema(opts: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: opts.name,
    description: opts.description,
    thumbnailUrl: opts.thumbnailUrl.startsWith("http")
      ? opts.thumbnailUrl
      : `${SITE.url}${opts.thumbnailUrl}`,
    uploadDate: opts.uploadDate,
    inLanguage: SITE.locale,
    ...(opts.duration ? { duration: opts.duration } : {}),
    ...(opts.contentUrl ? { contentUrl: opts.contentUrl } : {}),
    ...(opts.embedUrl ? { embedUrl: opts.embedUrl } : {}),
    publisher: { "@id": `${SITE.url}/#organization` },
  } as const;
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  image?: string;
  keywords?: string[];
}) {
  const url = opts.path.startsWith("http") ? opts.path : `${SITE.url}${opts.path}`;
  const image = opts.image
    ? opts.image.startsWith("http")
      ? opts.image
      : `${SITE.url}${opts.image}`
    : `${SITE.url}${SITE.ogImage}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    inLanguage: SITE.locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    image,
    author: {
      "@type": opts.authorName ? "Person" : "Organization",
      name: opts.authorName ?? SITE.name,
      ...(opts.authorName ? {} : { url: SITE.url }),
    },
    publisher: { "@id": `${SITE.url}/#organization` },
    ...(opts.keywords && opts.keywords.length
      ? { keywords: opts.keywords.join(", ") }
      : {}),
  } as const;
}

export function aboutPageSchema(opts: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: opts.name,
    description: opts.description,
    url: `${SITE.url}${opts.path}`,
    inLanguage: SITE.locale,
    mainEntity: { "@id": `${SITE.url}/#organization` },
  } as const;
}

export function collectionPageSchema(opts: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: `${SITE.url}${opts.path}`,
    inLanguage: SITE.locale,
    isPartOf: { "@id": `${SITE.url}/#website` },
  } as const;
}
