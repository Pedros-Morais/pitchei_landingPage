import type { APIRoute } from "astro";
import { SITE } from "~/lib/site";

// @astrojs/sitemap emits `sitemap-index.xml` + `sitemap-0.xml`, never a file
// named `sitemap.xml`. Crawlers (and Google Search Console) probe the
// well-known `/sitemap.xml` path by convention, which would 404. This endpoint
// serves that path as a sitemap index delegating to the auto-generated
// `sitemap-0.xml`, so we don't duplicate the URL/lastmod/priority logic, it
// stays in sync with the integration on every build.
export const GET: APIRoute = () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE.url}/sitemap-0.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
