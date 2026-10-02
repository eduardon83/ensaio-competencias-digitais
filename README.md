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
- **Dois formatos de UI** selecionáveis: **Kendir** (editorial) e **Mosaico** (Ágora Design System da AMA, `@ama-pt/agora-design-system` v4, carregado só quando ativo).
- Preferências: tema claro/escuro, texto grande, tempo alargado (×1,25 / ×1,5 / ×2) registado como acomodação.
- Dados anónimos **só no navegador** (localStorage) através de uma interface `Repositorio` pronta para a versão Supabase; histórico com CSV e apagar; Observatório local.
- Páginas: guia de acessibilidade, sobre (fontes), privacidade, código de turma e professor (placeholders da fase 3).

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
src/dados/repositorio.ts   sessão anónima, tentativas, testes, percurso (localStorage)
src/paginas/               Início, Teste/Percurso, Catálogo/Treino, Atividade, Conta/Observatório, textos, Definições
```

## Próximos passos (fases da especificação)

2. Atividades 4, 5, 7 e 10; carimbos e cartão de imprensa; ecrã "primeira página" exportável como imagem.
3. Códigos de turma, verificação de email, relatórios ao professor (Resend), ligação de gestão, CSV.
4. Contas por ligação mágica (Supabase Auth), histórico sincronizado, certificados com verificação pública.
5. Observatório com agregação no servidor (vista materializada, limiar de 20 tentativas).
6. Auditoria WCAG 2.2 AA, passagem com leitor de ecrã, piloto em escolas e recalibração dos limiares.
