import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

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
        return item;
      },
    }),
  ],
  compressHTML: true,
});
