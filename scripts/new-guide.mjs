#!/usr/bin/env node
// Scaffold a new pitch guide as a schema-valid JSON file.
//
//   yarn new-guide <slug> ["Título do guia"] ["Categoria"]
//
// Example:
//   yarn new-guide pitch-de-vendas "Pitch de vendas: como conduzir à decisão" "Situações"
//
// It writes src/content/guias/<slug>.json pre-filled with every field the
// `guias` collection expects and TODO placeholders. Fill the placeholders with
// REAL, distinct content before shipping — thin/duplicate pages get penalized
// by Google's scaled-content-abuse policy. The page goes live automatically
// (route, sitemap, JSON-LD, hub listing) once the file exists and content is real.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const [, , rawSlug, title, category] = process.argv;

if (!rawSlug) {
  console.error(
    'Uso: yarn new-guide <slug> ["Título"] ["Categoria"]\n' +
      'Ex.:  yarn new-guide pitch-de-vendas "Pitch de vendas: como conduzir à decisão" "Situações"',
  );
  process.exit(1);
}

const slug = rawSlug
  .toLowerCase()
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "") // strip accents
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

if (slug !== rawSlug) {
  console.log(`Slug normalizado: "${rawSlug}" -> "${slug}"`);
}

const guiasDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "content",
  "guias",
);
const outPath = join(guiasDir, `${slug}.json`);

if (existsSync(outPath)) {
  console.error(`Já existe: ${outPath} — escolha outro slug ou edite o arquivo.`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const template = {
  title: title || "TODO: título com a palavra-chave principal",
  description:
    "TODO: descrição de 140-160 caracteres, única, com a palavra-chave e uma promessa clara.",
  publishedAt: today,
  category: category || "TODO: Fundamentos | Formatos | Situações | Técnicas",
  order: 100,
  keywords: ["TODO: palavra-chave principal", "TODO: variação", "TODO: variação"],
  hero: {
    eyebrow: "Guia de pitch",
    heading: "TODO: H1 curto e claro",
    subheading: "TODO: 1-2 frases que enquadram o problema e a promessa do guia.",
  },
  tldr: ["TODO: ponto 1", "TODO: ponto 2", "TODO: ponto 3"],
  sections: [
    {
      heading: "TODO: subtítulo (H2)",
      paragraphs: ["TODO: parágrafo com conteúdo real e específico."],
      bullets: ["TODO: item opcional"],
    },
  ],
  framework: {
    name: "TODO: nome do método/estrutura (vira rich result HowTo)",
    description: "TODO: uma frase explicando o método.",
    totalTime: "PT2M",
    steps: [
      { name: "TODO: passo 1", text: "TODO: o que fazer neste passo." },
      { name: "TODO: passo 2", text: "TODO: o que fazer neste passo." },
    ],
  },
  story: {
    title: "TODO: título do exemplo",
    context: "TODO: quem é o personagem e a situação.",
    quote: "TODO: a fala/exemplo em si.",
    lesson: "TODO: a lição que conecta ao ponto do guia.",
  },
  mistakes: [{ title: "TODO: erro comum", detail: "TODO: por que é um erro." }],
  faq: [
    {
      question: "TODO: pergunta real que as pessoas buscam?",
      answer: "TODO: resposta direta e útil (vira rich result FAQPage).",
    },
  ],
  related: ["como-fazer-um-pitch"],
};

if (!existsSync(guiasDir)) mkdirSync(guiasDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(template, null, 2) + "\n", "utf8");

console.log(`✓ Criado: src/content/guias/${slug}.json`);
console.log(`  URL: https://pitchei.com.br/guia-de-pitch/${slug}`);
console.log("  Preencha os TODO com conteúdo real, depois rode: yarn build");
