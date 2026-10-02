# Ensaio às Competências Digitais (ECD)

Jogo web gratuito, em português de Portugal, onde alunos treinam e medem as competências digitais práticas que as provas em computador pressupõem: escrever no teclado, ler ecrãs, preencher formulários, navegar, arrastar, gerir o tempo, usar atalhos, ler em ecrã e escrever matemática. Sem conta. Um projeto Kendir Studios / Worlds4Education.

Especificação de origem: `docs/especificacao-v0.1.html` (projeto "Ensaio Digital", v0.1, 1 out 2026). Instruções para agentes: [AGENTS.md](AGENTS.md).

## Arrancar

```sh
npm install
npm run dev        # http://localhost:5180/
npm run typecheck  # tsc --noEmit
npm test           # vitest (pontuações, conteúdo, normalização matemática)
npm run build      # dist/
```

## O que existe (v0.1.0)

- **Motor de atividades** em quatro etapas: briefing → prática (não conta) → avaliação → resultado (0–100, estrelas, dica).
- **Sete atividades jogáveis, cada uma com 5 níveis** (1 Iniciação … 5 Perito): A Notícia (dactilografia, com ronda de teclado numérico), O Painel (literacia de interfaces num sítio simulado), Revisão (atenção ao detalhe), Paginação (arrastar e largar com alternativas por teclado e toque), Teclas Mágicas (atalhos), Encontra no Texto (leitura em ecrã, com Ctrl+F intercetado) e **Escrita Matemática** (notação linear + paleta de símbolos + reconhecimento de notações). Quatro ficam "Em breve": O Arquivo, Cartão de Imprensa, Fecho de Edição, Simulador de Prova.
- **Teste de competências** por ciclo (1.º, 2.º, 3.º ciclo, Ensino Superior) com pausa/retoma e "primeira página" final; **Treino** livre por nível, com melhor pessoal por nível.
- **Dois contextos de aprendizagem**: redação do jornal da escola (Diretora Graça, Tomé, Lia, Sr. Prazo) e laboratório de experiências (Doutora Inês, Rui, Marta, O Cronómetro). Mudam títulos, briefings e conteúdos.
- **Dois formatos de UI** selecionáveis: **Kendir** (editorial) e **Mosaico** (Ágora Design System da AMA, `@ama-pt/agora-design-system` v4). O módulo e o CSS do Ágora são carregados **só** quando o Mosaico está ativo (chunk separado). Ambos os formatos têm **tema claro e escuro** (no Mosaico, pela prop `darkMode` dos componentes Ágora + tokens próprios).
- Preferências: tema, texto grande, tempo alargado (×1,25 / ×1,5 / ×2) registado como acomodação, envio de estatísticas (ligado por omissão, desligável).
- **Sem contas, sem registos de pessoas, sem base de dados.** Os resultados pessoais ficam só no navegador (localStorage), com CSV e apagar.
- **Telemetria anónima** opcional para um ponto de recolha configurável (`VITE_TELEMETRIA_URL`): por omissão um **Google Apps Script** que escreve numa folha de cálculo (`telemetria/apps-script.gs`, instalação em `telemetria/README.md`). O mesmo script devolve agregados: **Observatório** público (grupos < 20 ocultos) e ecrã **/admin** com a chave de administração verificada no script.
- Páginas: guia de acessibilidade, sobre (fontes), privacidade, código de turma e professor (desenho sem servidor, por fazer).

## Stack

Vite 7 · React 19 · TypeScript · Tailwind v4 · react-router 7 · @dnd-kit · @ama-pt/agora-design-system · Vitest. Sem servidor: SPA estática.

## Estrutura

```
src/main.tsx               arranque (carrega o CSS do Ágora se o formato for Mosaico)
src/App.tsx                rotas
src/styles/app.css         tokens dos dois formatos + componentes do formato Kendir
src/styles/mosaico.css     imports do Ágora (theme + componentes)
src/preferencias/          formato, contexto, tema, tamanho, tempo alargado, nome
src/ui/                    Botao, CampoTexto, CaixaVerificacao, BotaoRadio, Interruptor, Seletor, Barra… (Kendir ou Ágora)
src/contextos/             narrativas: jornal e laboratório (personagens, briefings, nomes)
src/motor/                 tipos (níveis, ciclos, domínios, faixas), Atividade.tsx (etapas), util (temporizador, barra de tempo)
src/atividades/<slug>/     uma pasta por atividade: componente, 5 níveis de configuração, pontuação pura, testes
src/dados/repositorio.ts   sessão anónima, tentativas, testes, percurso (localStorage); chama a telemetria ao guardar
src/dados/telemetria.ts    envio anónimo (sendBeacon/fetch) e leitura de agregados do ponto de recolha
src/ui/agora.tsx + registo-agora.ts   módulo Ágora carregado dinamicamente só no formato Mosaico
telemetria/                apps-script.gs (ponto de recolha) + README de instalação
src/paginas/               Início, Teste/Percurso, Catálogo/Treino, Atividade, Conta/Observatório, textos, Definições
```

## Próximos passos (fases da especificação)

2. Atividades 4, 5, 7 e 10; carimbos e cartão de imprensa; ecrã "primeira página" exportável como imagem.
3. Códigos de turma **sem servidor**: configuração codificada no código/ligação, tentativas marcadas com o código na telemetria, agregados por código no Observatório.
4. Auditoria WCAG 2.2 AA, passagem com leitor de ecrã, piloto em escolas e recalibração dos limiares.

Decisão do product owner (2026-10-02): **não há logins nem registos** de pessoas; a entrega a ARTE/EduQA é um sítio estático + uma folha de cálculo para as estatísticas.
