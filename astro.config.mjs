import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// Last time the evergreen/marketing pages (home, casos-de-uso, comparativo,
// sobre, privacidade, termos) changed materially. Bump this when you ship a
// real copy/content update so <lastmod> stays honest for crawlers.
const SITE_UPDATED = "2026-08-04";

// Read blog post dates from frontmatter at build time so each post gets a real
// <lastmod> (updatedAt if present, otherwise publishedAt). No extra deps: a
// tiny frontmatter parse is enough for these two fields.
const BLOG_DIR = new URL("./src/content/blog/", import.meta.url);

function readBlogLastmod() {
  const map = {};
  for (const file of readdirSync(fileURLToPath(BLOG_DIR))) {
    if (!file.endsWith(".md")) continue;
    const slug = file.replace(/\.md$/, "");
    const raw = readFileSync(new URL(file, BLOG_DIR), "utf8");
    const fm = raw.split(/^---\s*$/m)[1] ?? "";
    const updated = /^updatedAt:\s*(.+)$/m.exec(fm)?.[1];
    const published = /^publishedAt:\s*(.+)$/m.exec(fm)?.[1];
    const iso = (updated || published || "").trim().replace(/["']/g, "");
    if (iso) map[slug] = iso;
  }
  return map;
}

const BLOG_LASTMOD = readBlogLastmod();
const BLOG_INDEX_LASTMOD = Object.values(BLOG_LASTMOD)
  .sort()
  .at(-1);

function lastmodFor(path) {
  const post = /^\/blog\/(.+)$/.exec(path);
  if (post && BLOG_LASTMOD[post[1]]) return BLOG_LASTMOD[post[1]];
  if (path === "/blog" && BLOG_INDEX_LASTMOD) return BLOG_INDEX_LASTMOD;
  return SITE_UPDATED;
}

export default defineConfig({
  site: "https://pitchei.com.br",
  trailingSlash: "never",
  build: {
    format: "file",
    inlineStylesheets: "auto",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [
    tailwind(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      i18n: { defaultLocale: "pt-BR", locales: { "pt-BR": "pt-BR" } },
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, "");
        if (path === "") {
          item.priority = 1.0;
          item.changefreq = "daily";
        } else if (/^\/(casos-de-uso|comparativo)/.test(path)) {
          item.priority = 0.8;
        } else if (path === "/sobre") {
          item.priority = 0.7;
        } else if (/^\/blog/.test(path)) {
          item.priority = 0.6;
        } else if (/^\/(privacidade|termos)/.test(path)) {
          item.priority = 0.3;
          item.changefreq = "yearly";
        }
        item.lastmod = new Date(lastmodFor(path)).toISOString();
        return item;
      },
    }),
  ],
  compressHTML: true,
});
