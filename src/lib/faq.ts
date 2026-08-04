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
    question: "O Pitchei consegue ler a minha tela?",
    answer:
      "Sim. Além de ouvir a conversa, o Pitchei lê a sua tela quando você aciona o atalho: uma pergunta compartilhada, um trecho de código, uma planilha ou um contrato. Ele entende o contexto e sugere a resposta na hora. A captura acontece só quando você pede, a imagem é processada na hora e descartada em seguida, e nunca vira histórico.",
  },
  {
    question: "Funciona em português?",
    answer:
      "Sim. O Pitchei foi feito para o profissional brasileiro. A transcrição entende sotaque e expressões em pt-BR, e as sugestões saem em português natural, sem tradução literal de inglês.",
  },
  {
    question: "O Pitchei funciona no Mac e no Windows?",
    answer:
      "Sim. O Pitchei é um aplicativo de mesa para Mac e Windows. Você não precisa de plugin de navegador nem entra na call: basta ter o app aberto durante a reunião. Entre na lista de espera e escolha a sua plataforma quando o convite do beta chegar.",
  },
  {
    question: "Quanto custa?",
    answer:
      "Grátis durante o beta fechado. A primeira coorte de design partners usa o Pitchei sem custo, em troca de feedback. O preço da versão final ainda está sendo definido. Entre na lista de espera para ser um dos primeiros convidados.",
  },
  {
    question: "Que modelo de IA o Pitchei usa?",
    answer:
      "A gente escolhe por você. Neuralake é o nosso fornecedor principal de IA, com latência baixa, qualidade em português e infraestrutura independente. OpenAI e Google Gemini ficam como redundância automática. Você não configura API key, não escolhe provider, só conversa. Nenhum modelo treina com a sua reunião.",
  },
  {
    question: "O Pitchei substitui um Otter ou um Granola?",
    answer:
      "Não. Otter, Fathom e Granola são transcritores: gravam e entregam o resumo depois. O Pitchei é um copiloto: entrega valor durante a reunião, com sugestões em tempo real. Os dois podem rodar juntos sem conflito.",
  },
];
