import { SITE } from "./site";

export type FooterLink = {
  label: string;
  href: string;
  rel?: string;
};

export type FooterGroup = {
  heading: string;
  links: FooterLink[];
};

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    heading: "Produto",
    links: [
      { label: "Como funciona", href: "/#durante-a-reuniao" },
      { label: "Para quem é", href: "/#para-quem" },
      { label: "Perguntas frequentes", href: "/#faq" },
      { label: "Lista de espera", href: "/#cadastro" },
    ],
  },
  {
    heading: "Casos de uso",
    links: [
      { label: "Pitch para investidores", href: "/casos-de-uso/pitch-para-investidores" },
      { label: "Entrevistas de emprego", href: "/casos-de-uso/entrevistas-de-emprego" },
      { label: "Vendas e negociação", href: "/casos-de-uso/vendas-e-negociacao" },
      { label: "Reuniões com clientes", href: "/casos-de-uso/reunioes-com-clientes" },
    ],
  },
  {
    heading: "Compare",
    links: [
      { label: "Pitchei vs Otter", href: "/comparativo/pitchei-vs-otter" },
      { label: "Pitchei vs Fathom", href: "/comparativo/pitchei-vs-fathom" },
      { label: "Blog", href: "/blog" },
      { label: "Sobre", href: "/sobre" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacidade", href: "/privacidade" },
      { label: "Termos de uso", href: "/termos" },
      { label: "Preferências de cookies", href: "#cookie-preferences" },
      { label: SITE.email, href: `mailto:${SITE.email}` },
    ],
  },
];
