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

export const collections = { blog };
