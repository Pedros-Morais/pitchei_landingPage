import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default("Equipe Pitchei"),
    section: z.string().optional(),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    tldr: z.array(z.string()).optional(),
  }),
});

// Pitch guides — a JSON-driven, structured content hub ("a arte do pitch").
// Each JSON file becomes a fully-optimized page at /guia-de-pitch/<id>. The
// content is structured (not free prose) so every entry stays unique and
// substantive AND maps directly to rich results (HowTo from `framework`,
// FAQPage from `faq`, Article for the page). Add a guide by adding a JSON file.
const guias = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/guias" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default("Equipe Pitchei"),
    category: z.string(),
    order: z.number().default(100),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    hero: z.object({
      eyebrow: z.string(),
      heading: z.string(),
      subheading: z.string(),
    }),
    // Answer-first block ("Resposta rápida"): a direct 40-60 word answer to the
    // page's core question. This is the primary GEO lever — LLMs lift the concise
    // answer and it's the target of the Speakable markup.
    answer: z.string().optional(),
    tldr: z.array(z.string()).default([]),
    sections: z
      .array(
        z.object({
          heading: z.string(),
          paragraphs: z.array(z.string()).default([]),
          bullets: z.array(z.string()).optional(),
        }),
      )
      .default([]),
    framework: z
      .object({
        name: z.string(),
        description: z.string(),
        totalTime: z.string().optional(),
        steps: z.array(z.object({ name: z.string(), text: z.string() })),
      })
      .optional(),
    story: z
      .object({
        title: z.string(),
        context: z.string(),
        quote: z.string(),
        lesson: z.string(),
      })
      .optional(),
    mistakes: z
      .array(z.object({ title: z.string(), detail: z.string() }))
      .optional(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, guias };
