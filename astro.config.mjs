import { readdirSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// Fallback <lastmod> for any page whose date we can't derive from git history
// (e.g. shallow-clone CI or a non-git deploy). Bump when you ship a real copy
// update so it stays honest for crawlers.
const SITE_UPDATED = "2026-08-04";

const PAGES_DIR = fileURLToPath(new URL("./src/pages/", import.meta.url));

// Resolve a sitemap URL path back to the .astro source file that renders it.
function pageFileFor(path) {
  const rel = path === "" ? "index" : path.slice(1);
  for (const candidate of [`${rel}.astro`, `${rel}/index.astro`]) {
    const abs = PAGES_DIR + candidate;
    if (existsSync(abs)) return abs;
  }
  return null;
}

// Date of the last commit that touched a file (strict ISO 8601), or null if
// git isn't available. Gives marketing pages a real, self-maintaining lastmod.
function gitLastmod(absFile) {
  try {
    return (
      execFileSync("git", ["log", "-1", "--format=%cI", "--", absFile], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() || null
    );
  } catch {
    return null;
  }
}

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

// Pitch guides are JSON-driven and rendered by a dynamic route, so pageFileFor
// can't map each slug to a source file. Read their editorial dates straight
// from the JSON (updatedAt ?? publishedAt) to keep <lastmod> honest per guide.
const GUIA_DIR = new URL("./src/content/guias/", import.meta.url);

function readGuiaLastmod() {
  const dir = fileURLToPath(GUIA_DIR);
  if (!existsSync(dir)) return {};
  const map = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const slug = file.replace(/\.json$/, "");
    try {
      const data = JSON.parse(readFileSync(new URL(file, GUIA_DIR), "utf8"));
      const iso = String(data.updatedAt || data.publishedAt || "").trim();
      if (iso) map[slug] = iso;
    } catch {
      // Malformed JSON: skip; the page falls back to SITE_UPDATED.
    }
  }
  return map;
}

const GUIA_LASTMOD = readGuiaLastmod();
const GUIA_INDEX_LASTMOD = Object.values(GUIA_LASTMOD).sort().at(-1);

function lastmodFor(path) {
  // Blog: editorial dates from frontmatter (updatedAt ?? publishedAt).
  const post = /^\/blog\/(.+)$/.exec(path);
  if (post && BLOG_LASTMOD[post[1]]) return BLOG_LASTMOD[post[1]];
  if (path === "/blog" && BLOG_INDEX_LASTMOD) return BLOG_INDEX_LASTMOD;
  // Pitch guides: editorial dates from the JSON (updatedAt ?? publishedAt).
  const guia = /^\/guia-de-pitch\/(.+)$/.exec(path);
  if (guia && GUIA_LASTMOD[guia[1]]) return GUIA_LASTMOD[guia[1]];
  if (path === "/guia-de-pitch" && GUIA_INDEX_LASTMOD) return GUIA_INDEX_LASTMOD;
  // Everything else: last git commit that touched the page source.
  const file = pageFileFor(path);
  return (file && gitLastmod(file)) || SITE_UPDATED;
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
        } else if (/^\/guia-de-pitch/.test(path)) {
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
