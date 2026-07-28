export type Suggestion = {
  speaker: string;
  suggestion: string;
};

type Entry = Suggestion & {
  keywords: string[];
};

const BANK: Entry[] = [
  {
    keywords: ["preço", "preco", "caro", "salgado", "valor", "investimento", "custa", "custo"],
    speaker: "Cliente",
    suggestion:
      "Se eu te mostrasse que o ROI cobre o custo no segundo mês, faria sentido seguirmos com a proposta?",
  },
  {
    keywords: ["roi", "retorno", "payback", "recupera"],
    speaker: "Cliente",
    suggestion:
      "Posso revisar com você os números do payback antes de fecharmos — quer ver de hoje pra trás 6 meses?",
  },
  {
    keywords: ["tam", "mercado", "tamanho", "endereçavel", "endereçável", "addressable"],
    speaker: "Investidor",
    suggestion:
      "R$ 12B em SaaS B2B no Brasil — atacamos primeiro a densidade de founders em São Paulo e expandimos por cidade.",
  },
  {
    keywords: ["concorrente", "concorrência", "competidor", "competição", "rival", "comparado"],
    speaker: "Investidor",
    suggestion:
      "Os concorrentes resolvem o ‘depois da reunião’. A gente resolve o ‘durante’ — é onde o valor está.",
  },
  {
    keywords: ["prazo", "quando", "data", "deadline", "entrega", "lançamento", "lancamento"],
    speaker: "Cliente",
    suggestion:
      "Beta fechado em agosto, abertura geral no quarto trimestre. Posso te garantir um slot da onda de beta?",
  },
  {
    keywords: ["time", "equipe", "fundadores", "founder", "cofundador", "cofundadores", "head"],
    speaker: "Investidor",
    suggestion:
      "Time de 4: dois eng (ex-empresas-âncoras), um produto, um GTM com rede em founders. Disposto a apresentar 1:1.",
  },
  {
    keywords: ["diferencial", "diferente", "porque vocês", "por que vocês", "único", "unico", "vantagem"],
    speaker: "Cliente",
    suggestion:
      "A diferença é a latência: a IA fala em até 700ms, em português, e só você ouve. Quer ver ao vivo?",
  },
  {
    keywords: ["case", "exemplo", "cliente", "usando", "usou", "depoimento"],
    speaker: "Cliente",
    suggestion:
      "Posso te conectar com um founder que usou no fechamento do Series A — ele topa um papo de 15 min.",
  },
  {
    keywords: ["risco", "preocupado", "preocupação", "preocupacao", "medo", "receio", "inseguro"],
    speaker: "Cliente",
    suggestion:
      "Faz sentido. Se eu cobrir esse risco no contrato com cancelamento sem multa nos primeiros 60 dias, fica confortável?",
  },
  {
    keywords: ["privacidade", "segurança", "seguranca", "lgpd", "dados", "vazamento", "audio", "áudio"],
    speaker: "Cliente",
    suggestion:
      "Áudio é processado localmente quando possível, nada é gravado por padrão. Posso te mostrar o whitepaper de segurança?",
  },
  {
    keywords: ["fraqueza", "ponto fraco", "defeito", "fragilidade"],
    speaker: "Recrutador",
    suggestion:
      "Tenho dificuldade em delegar sem antes alinhar o critério — uso 1:1s curtos com checkpoints pra resolver.",
  },
  {
    keywords: ["força", "forca", "ponto forte", "qualidade", "destaque"],
    speaker: "Recrutador",
    suggestion:
      "Levar problemas vagos a uma decisão executável em até 48h — exemplo concreto que posso te dar agora?",
  },
  {
    keywords: ["objetivo", "objetivos", "meta", "metas", "expectativa", "espera"],
    speaker: "Cliente",
    suggestion:
      "Posso confirmar com você qual é o resultado que você precisa enxergar pra essa decisão ser fácil?",
  },
  {
    keywords: ["pensar", "pensando", "depois", "te retorno", "te respondo", "talvez"],
    speaker: "Cliente",
    suggestion:
      "Sem problema. O que falta pra você decidir — é número, é gente envolvida, ou é prioridade?",
  },
];

const FALLBACK: Suggestion = {
  speaker: "Pitchei",
  suggestion:
    "Posso confirmar com você qual é a sua principal preocupação aqui antes de seguirmos?",
};

const DIACRITICS = /[̀-ͯ]/g;

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(DIACRITICS, "");
}

export function matchSuggestion(transcript: string): Suggestion {
  const text = " " + normalize(transcript) + " ";
  let best: Entry | null = null;
  let bestScore = 0;
  for (const entry of BANK) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (text.includes(" " + normalize(kw)) || text.includes(normalize(kw) + " ")) {
        score += 2;
      } else if (text.includes(normalize(kw))) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  if (best && bestScore > 0) {
    return { speaker: best.speaker, suggestion: best.suggestion };
  }
  return FALLBACK;
}
