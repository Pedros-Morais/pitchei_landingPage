import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "~/lib/site";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );

  const items = posts
    .map((p) => {
      const url = `${SITE.url}/blog/${p.id}`;
      return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${p.data.publishedAt.toUTCString()}</pubDate>
      <description>${esc(p.data.description)}</description>
      ${p.data.author ? `<author>${esc(p.data.author)}</author>` : ""}
      ${p.data.tags.map((t) => `<category>${esc(t)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} · Blog</title>
    <link>${SITE.url}/blog</link>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(SITE.shortDescription)}</description>
    <language>${SITE.locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
