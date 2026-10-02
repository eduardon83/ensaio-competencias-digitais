# AGENTS.md — Ensaio às Competências Digitais (ECD)

Lê este ficheiro antes de tocar no código. Mantém-no atualizado na mesma alteração que muda arquitetura, convenções ou estado.

## O que é

Jogo web gratuito (pt-PT, sem conta) para treinar e medir competências digitais práticas exigidas por provas em computador. Projeto Kendir Studios / Worlds4Education. Especificação de origem: `docs/ESPECIFICACAO.md` (resumo) e o HTML "Ensaio Digital" v0.1 (1 out 2026) que o produto owner guarda; o nome mudou para **Ensaio às Competências Digitais (ECD)**.

Pedidos adicionais do product owner, já implementados na v0.1.0:
1. **Formato de UI selecionável**: "Kendir" (próprio) ou "Mosaico" (Ágora Design System da AMA, `@ama-pt/agora-design-system`).
2. **Treino de competências** com **5 níveis por atividade**; atividade específica de **escrita matemática** (notação, anotações) com 5 níveis; segundo **contexto de aprendizagem** (aluno num laboratório de experiências) além do jornalista.

## Arquitetura

SPA estática: Vite 7 + React 19 + TypeScript + Tailwind v4 + react-router 7 (rotas declarativas em `src/App.tsx`). **Sem servidor, sem contas, sem base de dados** (decisão do product owner, 2026-10-02: entrega simples a ARTE/EduQA). Resultados pessoais em localStorage atrás da interface `Repositorio` (`src/dados/repositorio.ts`). Estatísticas de uso por **telemetria anónima** (`src/dados/telemetria.ts`): POST de cada tentativa/teste para `VITE_TELEMETRIA_URL` e GET de agregados; implementação de referência do ponto de recolha em `telemetria/apps-script.gs` (Google Apps Script → folha de cálculo; chave `ADMIN_CHAVE` nas propriedades do script protege os agregados completos do ecrã `/admin`). Sem URL configurado, nada é enviado.

Comandos: `npm run dev` (porta 5180) · `npm run typecheck` · `npm test` (Vitest) · `npm run build`.

Documentação para o público geral: `README.txt` (fonte) e `README.pdf` (gerado com `python scripts/gerar-readme-pdf.py`). Escritos para escolas, ARTE e EduQA, não só para quem programa: quando mudares funcionalidades, atualiza o `.txt` e regenera o `.pdf` no mesmo commit. Não voltes a criar `README.md`.

### Navegação e fluxos

- Cabeçalho só com Início, Sobre, Definições. Início tem quatro blocos: Treinar (`/treinar` → Teste `/teste`, Atividade `/treino`, Código `/codigo`), Professor (`/professor`), Tutorial (`/tutorial`, saltável, aviso na primeira visita) e Observatório.
- O cenário (redação/laboratório) escolhe-se no briefing de cada atividade e no ecrã de início de cada teste ou prova (`src/componentes/SeletorContexto.tsx`), não no cabeçalho.
- Sessões de professor sem servidor próprio: `src/codigo/codigo.ts` codifica nível, atividades, tempo alargado e identificação no código `XXXX·YYYYYY` (alfabeto sem 0/O/1/I/L, carácter de verificação). `src/paginas/Professor.tsx` cria o código e regista a sessão no ponto de recolha (hash do token privado + email opcional, confirmado por ligação); a ligação privada `/professor/resultados#s=…&t=…` lê os resultados. `src/paginas/Codigo.tsx` é o lado do aluno (identificação, cenário, sequência). As tentativas levam `codigo` e `aluno` na telemetria; o Apps Script envia emails (MailApp) por tentativa ou em resumo diário.
- `Sequencia` e `PrimeiraPagina` (`src/paginas/Teste.tsx`) servem o teste por ciclo e a prova do professor.
- Vídeo da página Sobre: `VITE_VIDEO_SOBRE` (embed YouTube/Vimeo ou .mp4); vazio mostra um espaço reservado.

### Formatos de UI

- Tokens CSS em `src/styles/app.css`: `:root` = Kendir; `:root[data-formato="mosaico"]` redefine os mesmos tokens com a paleta Ágora. Tema escuro só no Kendir.
- Componentes em `src/ui/index.tsx` têm **duas implementações** (HTML próprio ou componente Ágora) escolhidas por `usePreferencias().prefs.formato`. **As atividades usam sempre estes componentes**, nunca `<button>` com classes Ágora à mão (exceções: controlos muito específicos como separadores, paginação e palavras clicáveis, que usam classes próprias).
- O módulo Ágora (`src/ui/agora.tsx`, ~540 kB JS) e o seu CSS (~1 MB, com `@layer base` global e `--color-*: initial` no `@theme`) são carregados **só** quando o formato é Mosaico (`carregarAgora()` em `src/ui/registo-agora.ts`, chamado em `src/main.tsx`); `src/ui/index.tsx` obtém os componentes por `agora()`. Por isso trocar de formato recarrega a página. **Não** uses utilitários de cor do Tailwind (`bg-white`, `text-gray-…`): usa `var(--token)`.
- Tema escuro nos dois formatos: tokens em `app.css` (`[data-tema]`, incluindo `[data-formato="mosaico"]`) e, no Mosaico, a prop `darkMode` passada a cada componente Ágora a partir de `usePreferencias().escuro`.
- `InputSelect` do Ágora tem API própria (dropdown não nativo); `Seletor` usa `<select>` nativo nos dois formatos.

### Motor de atividades

- Contratos em `src/motor/tipos.ts`: `Nivel` 1–5, `Ciclo` (c1, c2, c3, es → nível 1–4), `Dominio`, `DefinicaoAtividade<C>` (`niveis: Record<Nivel, C>`, `pratica(c)`, `Componente`, `dica(metricas)`), faixas e estrelas.
- `src/motor/Atividade.tsx` corre as etapas intro → prática → avaliação → resultado e grava a tentativa. O percurso do teste (`src/paginas/Teste.tsx`) reutiliza-o com `aoConcluir`.
- Cada atividade é uma pasta em `src/atividades/<slug>/` com configuração dos 5 níveis, componente e pontuação pura testável. Registo em `src/atividades/index.ts`. Atividades por fazer ficam em `embreve.tsx` com `disponivel: false`.
- Contextos narrativos em `src/contextos/index.ts` (títulos por contexto, briefings, personagens). Conteúdos que dependem do contexto são `Record<Contexto, …>` dentro da configuração do nível.
- Regras: pontuação inteira 0–100 via `limitar()`; temporizadores multiplicados por `extensaoTempo`; toda a interação por arrasto tem alternativa por teclado e toque; nunca pedir atalhos reservados pelo navegador.

## Convenções

- Identificadores, comentários, UI e commits em **português de Portugal**. Frases curtas na UI, sem travessões.
- Acessibilidade é requisito: foco visível, alvos ≥ 44 px, `aria-live` para feedback, nunca só cor.
- Conteúdo marcado `[conteúdo Kendir]` é provisório (textos de autor com direitos a tratar).
- Testes: funções de pontuação e conteúdo com invariantes (ex.: número de diferenças na Revisão) em `*.test.ts`.

## Estado (2026-10-02)

- v0.1.0: fase 1 feita e alargada (7 atividades × 5 níveis, teste por ciclo, treino, dois contextos, dois formatos com tema claro/escuro, resultados locais, telemetria anónima + Observatório + `/admin`, páginas de texto). Ágora carregado dinamicamente.
- Por fazer: atividades `arquivo`, `cartao`, `fecho`, `simulador`; códigos de turma sem servidor (configuração codificada no código; agregados por código); auditoria WCAG e piloto. Contas, certificados e Supabase **removidos do plano**. Lovable não usado: o projeto foi criado localmente e ligado ao GitHub diretamente.
- Para publicar: configurar o Apps Script (telemetria/README.md), pôr o URL em `.env`, `npm run build`, copiar `dist/` para o alojamento com fallback SPA para `index.html`.
- Limiares e alvos de pontuação são estimativas iniciais; recalibrar com piloto.
