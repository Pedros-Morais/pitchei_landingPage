import type { FAQItem } from "./schema";

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "O Pitchei grava minha reunião?",
    answer:
      "Não. O áudio é processado em tempo real e nunca é salvo. A transcrição em texto fica apenas na memória do aplicativo durante a sessão e é descartada quando você encerra a reunião.",
  },
  {
    question: "O outro lado da call sabe que estou usando o Pitchei?",
    answer:
      "Não. O Pitchei roda local no seu computador, não entra na reunião como participante e não envia link nenhum para os outros. O overlay com as sugestões aparece apenas na sua tela.",
  },
  {
    question: "Em que reuniões o Pitchei funciona?",
    answer:
      "Em qualquer reunião que toque áudio no seu computador: Google Meet, Zoom, Microsoft Teams, Slack Huddles, FaceTime ou ligações por celular pareado. O Pitchei captura o áudio do sistema, então não depende de integração com plataformas específicas.",
  },
  {
    question: "Funciona em português?",
    answer:
      "Sim. O Pitchei foi feito para o profissional brasileiro. A transcrição entende sotaque e expressões em pt-BR, e as sugestões saem em português natural, sem tradução literal de inglês.",
  },
  {
    question: "O Pitchei funciona no Mac e no Windows?",
    answer:
      "A beta atual está disponível para macOS, em Apple Silicon e Intel. Você não precisa de plugin de navegador nem entra na call: basta ter o app aberto durante a reunião. A versão para Windows está em desenvolvimento; cadastre seu email para receber as novidades.",
  },
  {
    question: "Quanto custa?",
    answer:
      "A beta para macOS está disponível para download. O preço da versão final ainda está sendo definido. Cadastre seu email para receber novidades do produto e da versão para Windows.",
  },
];
