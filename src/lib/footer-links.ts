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
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Para quem é", href: "#para-quem" },
      { label: "Perguntas frequentes", href: "#faq" },
      { label: "Lista de espera", href: "#cadastro" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacidade", href: "/privacidade" },
      { label: "Termos de uso", href: "/termos" },
      { label: SITE.email, href: `mailto:${SITE.email}` },
    ],
  },
];
