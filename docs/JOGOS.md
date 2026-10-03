# Jogos de desenvolvimento de competências

Modo **Jogos** (Treinar → Jogos, rota `/jogos`). Os jogos usam o motor das atividades (briefing, prática, 5 níveis,
resultado com relatório), mas ficam fora do teste por ciclo, dos códigos de professor e dos carimbos.

## Feito: Biblioteca Viva (leitura e escrita com literatura portuguesa)

Código: `src/jogos/leitura/` (textos em `textos.ts`, geração em `gerar.ts`, testes em `leitura.test.ts`).

| Nível | Texto (média de palavras) | Palavras em falta | Ajuda | Ordenar | Ditado |
|---|---|---|---|---|---|
| 1 | Caeiro, Pessoa (≈ 40) | 3 | banco de palavras, acentos não contam | 3 | não |
| 2 | Pessoa, Caeiro (≈ 78) | 4 | banco de palavras, acentos não contam | 4 | 1 frase |
| 3 | Pessoa, Caeiro, Garrett (≈ 100) | 5 | primeira letra; acentos contam | 5 | 1 frase |
| 4 | Camões, Florbela Espanca (≈ 100) | 6 | primeira letra | 6 | 1 frase |
| 5 | Camões (Os Lusíadas), Eça (Os Maias), Pessoa (O Mostrengo) (≈ 150) | 8 | primeira letra | 6 | 2 frases |

Rondas: ler (com glossário clicável) → compreender (perguntas e opções baralhadas) → palavras em falta (geradas,
espalhadas pelo texto, sem palavras gramaticais) → pôr versos ou partes por ordem (bloco contínuo sorteado) →
ditado (síntese de voz do navegador em pt-PT; sem voz, a frase aparece 4 segundos). Pontuação: 40 % compreensão,
30 % palavras, 15 % ordem, 15 % ditado.

**Antes de usar em escolas:** validar cada excerto contra uma edição de referência (Biblioteca Nacional Digital,
Arquivo Pessoa, edições críticas), preencher `fonte` e, se possível, juntar textos mais longos nos níveis 4 e 5 para
chegar à "folha" completa (≈ 300 palavras). O teste garante que a média de palavras cresce com o nível. Todos os
autores têm de ter morrido há mais de 70 anos (o teste também o verifica).

Possíveis acrescentos: Júlio Dinis, Camilo Castelo Branco, Antero de Quental, Cesário Verde, António Nobre,
Gil Vicente, contos tradicionais recolhidos por Adolfo Coelho e Teófilo Braga (para o 1.º ciclo).

## Feito: A Sala Trancada (escape room)

Código: `src/jogos/sala/` (enigmas em `gerar.ts`). Uma secretária digital com separadores Notas, Ficheiros, Email,
Documento, Folha, Nota bloqueada e Cofre. Cada enigma dá um algarismo (1 a 9):

- Ficheiros: quantos PDF há na pasta Trabalhos, ou o dia de criação de `chave.txt`.
- Email: quantos anexos tem o email da Direção, ou o algarismo no email com a etiqueta Importante (há spam parecido).
- Documento: procurar uma palavra (caixa de procura ou Ctrl+F); o algarismo está escrito por extenso.
- Folha: soma de uma coluna ou contagem de "Sim".
- Nota bloqueada: escolher a palavra-passe mais forte.

| Nível | Enigmas | Nota | Armadilhas (extensões duplas, palavra repetida) | O cofre diz quantos estão certos |
|---|---|---|---|---|
| 1 | 3 | não | não | sim |
| 2 | 3 | sim | não | sim |
| 3 | 4 | sim | não | sim |
| 4 | 4 | sim | sim | não |
| 5 | 5 | sim | sim | não |

Pontuação: cofre aberto = 100 − 10 por ajuda − 10 por tentativa falhada − 5 por erro na nota (mínimo 50); fechado
(3 tentativas ou desistir) = até 45, proporcional aos algarismos certos, menos 5 por ajuda.

## Feito: Quem Apagou o Ficheiro? (mistério)

Código: `src/jogos/misterio/` (`gerar.ts`). O culpado é quem estava no computador de onde o ficheiro foi apagado, à
hora do registo. Fontes: registo do servidor, reservas, mensagens e fotografias (metadados). Cada pista é essencial,
de apoio ou irrelevante. Pontuação: 60 % culpado + 40 % × (essenciais marcadas − irrelevantes marcadas) / essenciais.

| Nível | Suspeitos | Motivo falso | Troca de computador | Reservas de 2 horas | Fotografias | Ficheiro com nome parecido |
|---|---|---|---|---|---|---|
| 1 | 3 | não | nunca | não | não | não |
| 2 | 4 | sim | nunca | não | não | não |
| 3 | 4 | sim | sempre | não | não | não |
| 4 | 4 | sim | às vezes | sim | sim | não |
| 5 | 5 | sim | sempre | sim | sim | sim |

## Feito: Orçamento da Visita de Estudo (folhas de cálculo)

Código: `src/jogos/orcamento/` (avaliador em `formula.ts`, folha e correção em `gerar.ts`). Referências, intervalos,
`+ - * /`, parênteses, `%`, `SOMA/SUM`, `MÉDIA/AVERAGE`, `MÁXIMO/MAX`, `MÍNIMO/MIN`; argumentos com `;` ou `,`; erros
`#VALOR!`, `#DIV/0!`, `#NOME?`, `#CIRC!` com explicação. A correção avalia a fórmula numa folha com as soluções nas
outras células (um erro não arrasta os seguintes). Valor certo escrito à mão conta metade.

| Nível | Despesas | Tarefas |
|---|---|---|
| 1 | 3 (D2 já feita) | totais, soma (com ajudas) |
| 2 | 3 (D2 já feita) | + custo por aluno |
| 3 | 3 (D2 já feita) | + total com desconto (sem ajudas) |
| 4 | 4 | todos os totais + o que sobra do orçamento |
| 5 | 4 | + despesa mais cara (MÁXIMO) e média (MÉDIA) |

## Feito: Correio da Redação (comunicação digital)

Código: `src/jogos/correio/` (missões e grelha em `avaliar.ts`). Cinco missões (entrevista, reserva de material,
entrega de relatório, justificação de falta, convite), com endereços fictícios e contactos parecidos (nome, domínio).
Critérios: Para, CC, CCO, assunto (palavras-chave, até 80 caracteres), saudação formal, conteúdo pedido, despedida,
assinatura, anexo certo (há rascunhos, versões antigas e `.exe`) e linguagem adequada (sem abreviaturas, calão,
emojis, `!!`). Os critérios crescem com o nível (nível 1: Para, assunto, saudação, 2 pontos de conteúdo, despedida,
assinatura; nível 5: todos, com 4 pontos de conteúdo e 5 contactos parecidos).

## Passaram para Segurança digital

O Email Desconfiado e Verdade ou Boato? são os testes dos temas "Exemplos de fraude" e "Redes sociais" em
`/seguranca` (código em `src/seguranca/`).

## Feito: O Robô da Bancada (pensamento computacional)

Código: `src/jogos/robo/` (`gerar.ts`, testes em `robo.test.ts`). O mapa nasce de um caminho aleatório sem
cruzamentos (tem sempre solução); os itens ficam nos cantos do caminho e o destino no fim. A solução de referência
comprime o caminho com repetições (corridas de "avançar" e o melhor bloco que se repete) e, no nível 5, com
"avançar até bloquear" (há caixas logo a seguir ao fim dos troços). Essa solução é a meta de instruções.
Programa como lista plana com "Repetir N vezes" … "Fim da repetição" (acessível por teclado, com subir/descer/apagar).

| Nível | Bancada | Troços | Itens | Instruções |
|---|---|---|---|---|
| 1 | 5×5 | 2 | 0 | avançar, virar |
| 2 | 6×6 | 3 | 1 | + apanhar |
| 3 | 6×6 | 2–3 longos | 1 | + repetir |
| 4 | 7×7 | escada (padrão) | 0 | repetir com bloco de 4 instruções |
| 5 | 7×7 | 3–4 | 2 | + avançar até bloquear |

Pontuação por desafio (2 por tentativa): resolvido = 70 + 30 × (meta ÷ instruções, até 1) − 5 por execução falhada
(máx. −20); não resolvido = até 30 pelos itens apanhados.

## Nas provas do professor

Desde a v1.3.0, o professor pode juntar testes de segurança e jogos às atividades de uma prova.
