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

## Propostas

### 1. A Sala Trancada (escape room)
**Competências:** navegação, atenção ao detalhe, segurança digital, leitura em ecrã.
O jogador está fechado na redação (ou no laboratório). Para abrir a porta precisa de um código de 4 a 6 caracteres,
obtido em 4 a 6 enigmas encadeados numa secretária digital simulada:
- a data de criação de um ficheiro dá o primeiro algarismo (propriedades do ficheiro);
- um email com um anexo mal nomeado esconde a segunda pista (ler cabeçalhos, extensões);
- um documento longo tem uma palavra a negrito no meio (Ctrl+F);
- uma folha de cálculo tem uma soma que dá o terceiro algarismo;
- a pista final está num separador que só abre com a palavra-passe certa (escolher a mais segura de três).
Níveis: mais enigmas, menos pistas, relógio. Variabilidade: enigmas e valores gerados em cada tentativa.
Relatório: tempo por enigma, pistas pedidas, competência de cada enigma.

### 2. Quem Apagou o Ficheiro? (mistério)
**Competências:** literacia da informação, pensamento crítico, leitura em ecrã, verificação.
A reportagem principal desapareceu do servidor. Há 4 suspeitos. O jogador investiga emails, mensagens de chat,
registos de acesso (com horas), histórico de versões e fotografias com metadados. Cada pista confirma ou elimina um
suspeito; no fim, acusa alguém e escolhe as três provas que o sustentam. A pontuação valoriza a justificação
(provas certas) e não só o culpado. Variabilidade: culpado, álibis e horas sorteados; as pistas são geradas para
serem coerentes.

### 3. Verdade ou Boato? (verificação de factos)
Classificar publicações como verdadeiras, falsas ou enganadoras, depois de verificar endereço, data, fonte,
imagem original (pesquisa inversa simulada) e outras fontes. Relatório com a pista decisiva de cada caso.

### 4. O Email Desconfiado (segurança)
Caixa de correio com mensagens legítimas e tentativas de phishing: remetentes parecidos, ligações cujo destino
real difere do texto, pedidos urgentes de dados. Segunda parte: criar uma palavra-passe forte e ativar a
autenticação em dois passos num ecrã simulado.

### 5. Orçamento da Visita de Estudo (folhas de cálculo)
Folha simulada: somas, médias, percentagens, ordenar e filtrar, gráfico de barras. Ligação à atividade de
escrita matemática.

### 6. O Robô da Bancada (pensamento computacional)
Programar por blocos um robô numa grelha (sequência, repetição, condição) com o menor número de instruções.

### 7. Correio da Redação (comunicação digital)
Escrever e responder a emails formais: assunto, saudação, anexos, CC e CCO, tom e revisão.

**Ordem sugerida de desenvolvimento:** A Sala Trancada e Quem Apagou o Ficheiro? reutilizam componentes que já
existem (explorador de ficheiros do Arquivo, formulários do Cartão, separadores e histórico); Verdade ou Boato? e
O Email Desconfiado cobrem a área de segurança e informação do DigComp, hoje menos treinada no ECD.
