# Mapa de tópicos — Guia de pitch (`/guia-de-pitch`)

Lista de tópicos para o hub programático de SEO sobre pitch. Cada linha vira uma
página (`src/content/guias/<slug>.json`). **Regra de ouro:** só publique um tópico
quando tiver conteúdo genuinamente único e útil para ele (método próprio, exemplo,
FAQ). Página fina/duplicada = política de _scaled content abuse_ do Google →
penalização. Priorize por intenção de busca real, não por volume.

Legenda de status: ✅ publicado · ✍️ escrever · ⚠️ risco de canibalização (diferenciar antes)

## Cluster 1 — Fundamentos (topo de funil, alto volume)
| Slug | Palavra-chave principal | Intenção | Status |
|---|---|---|---|
| `como-fazer-um-pitch` | como fazer um pitch | informacional (pillar) | ✅ |
| `o-que-e-pitch` | o que é pitch | definição | ✍️ |
| `tipos-de-pitch` | tipos de pitch | comparação/orientação | ✍️ (batch) |
| `estrutura-de-um-pitch` | estrutura de pitch | how-to | ⚠️ sobrepõe `como-fazer-um-pitch` — fundir ou focar só em "estrutura/slides" |
| `quanto-tempo-dura-um-pitch` | quanto tempo dura um pitch | resposta curta | ✍️ |

## Cluster 2 — Formatos (meio de funil)
| Slug | Palavra-chave principal | Intenção | Status |
|---|---|---|---|
| `elevator-pitch` | elevator pitch | how-to + modelo | ✅ |
| `pitch-deck` | pitch deck estrutura | how-to (slides) | ✍️ (batch) |
| `pitch-de-um-minuto` | pitch de 1 minuto | modelo | ✍️ |
| `one-pager-pitch` | one pager / pitch por escrito | modelo | ✍️ |
| `pitch-por-email` | pitch por email | template | ✍️ |

## Cluster 3 — Situações (fundo de funil, alta conversão)
| Slug | Palavra-chave principal | Intenção | Status |
|---|---|---|---|
| `pitch-de-vendas` | pitch de vendas | how-to | ✍️ (batch) ⚠️ diferenciar de `/casos-de-uso/vendas-e-negociacao` (ângulo produto) |
| `pitch-para-investidores` | como fazer pitch para investidores | how-to | ⚠️ já existe `/casos-de-uso/pitch-para-investidores` (produto) e blog `pitch-para-investidores-estrutura` — só criar se ângulo for claramente distinto |
| `pitch-em-entrevista-de-emprego` | pitch pessoal entrevista | how-to | ⚠️ diferenciar de `/casos-de-uso/entrevistas-de-emprego` |
| `pitch-de-projeto-interno` | vender ideia para o chefe | how-to | ✍️ |
| `pitch-para-clientes` | apresentar proposta para cliente | how-to | ⚠️ diferenciar de `/casos-de-uso/reunioes-com-clientes` |
| `pitch-para-imprensa` | pitch para jornalista | how-to | ✍️ |

## Cluster 4 — Técnicas (evergreen, ótimos para link interno)
| Slug | Palavra-chave principal | Intenção | Status |
|---|---|---|---|
| `storytelling-no-pitch` | storytelling no pitch | técnica | ✅ |
| `como-comecar-um-pitch` | como começar um pitch / gancho | técnica | ✍️ (batch) |
| `chamada-para-acao-no-pitch` | call to action pitch | técnica | ✍️ |
| `como-usar-dados-no-pitch` | dados e números no pitch | técnica | ✍️ |
| `linguagem-corporal-no-pitch` | linguagem corporal apresentação | técnica | ✍️ |
| `controlar-nervosismo-no-pitch` | como não ficar nervoso apresentação | técnica | ✍️ |
| `responder-objecoes-no-pitch` | responder objeções | técnica | ⚠️ há blog `objecao-de-preco-script` — diferenciar (geral vs. preço) |
| `perguntas-de-investidor` | perguntas que investidor faz | técnica | ✍️ |

## Cluster 5 — Exemplos & modelos (alta intenção, cuidado com thin content)
| Slug | Palavra-chave principal | Intenção | Status |
|---|---|---|---|
| `exemplos-de-pitch` | exemplos de pitch | exemplos | ✍️ (precisa de exemplos reais e variados, não lista genérica) |
| `modelos-de-pitch` | modelo/template de pitch | template | ✍️ |
| `frases-para-comecar-um-pitch` | frases de abertura de pitch | lista curada | ✍️ |

## Cluster 6 — Erros & melhoria (evergreen)
| Slug | Palavra-chave principal | Intenção | Status |
|---|---|---|---|
| `erros-comuns-em-pitch` | erros de pitch | lista | ✍️ |
| `como-melhorar-o-pitch` | como melhorar meu pitch | how-to | ✍️ |
| `checklist-de-pitch` | checklist de pitch | ferramenta/lista | ✍️ |
| `como-treinar-o-pitch` | como treinar/ensaiar pitch | how-to | ✍️ |

---

### Prioridade sugerida (próximas ondas)
1. **Situações de fundo de funil** (`pitch-de-vendas`, `pitch-deck`) — convertem melhor.
2. **Fundamentos de alto volume** (`o-que-e-pitch`, `tipos-de-pitch`) — capturam topo e distribuem link interno.
3. **Técnicas evergreen** — reforçam o cluster e o link interno para o pillar.

### Antes de publicar cada página
- Confirme que **não canibaliza** uma página existente (veja ⚠️ acima). Se o tema
  já existe em `/casos-de-uso` ou `/blog`, ou você diferencia o ângulo, ou linka
  em vez de duplicar.
- Preencha `framework` e `faq` — são o que gera rich results (HowTo/FAQPage).
- Interligue via `related[]` para formar cluster em torno de `como-fazer-um-pitch`.
