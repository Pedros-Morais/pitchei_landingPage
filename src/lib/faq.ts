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
      "Não. Pitchei roda local no seu Mac, não entra na reunião como participante e não envia link nenhum para os outros. O overlay com as sugestões aparece apenas na sua tela.",
  },
  {
    question: "Em que reuniões o Pitchei funciona?",
    answer:
      "Em qualquer reunião que toque áudio no seu Mac: Google Meet, Zoom, Microsoft Teams, Slack Huddles, FaceTime, ligações por celular pareado. Pitchei captura o áudio do sistema, então não depende de integração com plataformas específicas.",
  },
  {
    question: "Funciona em português?",
    answer:
      "Sim. Pitchei foi feito para o profissional brasileiro. A transcrição entende sotaque e expressões em pt-BR, e as sugestões saem em português natural — não tradução literal de inglês.",
  },
  {
    question: "Preciso de Mac? E Windows?",
    answer:
      "Hoje o Pitchei roda em macOS 13 ou superior. Versão Windows está no roadmap, mas ainda sem data confirmada. Se você é Windows, entre na lista de espera para ser avisado.",
  },
  {
    question: "Quanto custa?",
    answer:
      "O modelo de preço final ainda está sendo definido. A primeira coorte de design partners terá acesso gratuito ao beta em troca de feedback. Quem entrar na lista de espera fica entre os primeiros a ser convidado.",
  },
  {
    question: "Que modelo de IA o Pitchei usa?",
    answer:
      "Você escolhe. Pitchei conecta com sua chave do Neuralake, OpenAI ou Gemini. Não passamos seus dados por um servidor proprietário — você controla qual modelo gera as sugestões.",
  },
  {
    question: "Pitchei substitui um Otter ou um Granola?",
    answer:
      "Não. Otter, Fathom e Granola são transcritores: gravam e entregam o resumo depois. Pitchei é um parceiro: entrega valor durante a reunião, com sugestões em tempo real. Os dois podem rodar juntos sem conflito.",
  },
];
