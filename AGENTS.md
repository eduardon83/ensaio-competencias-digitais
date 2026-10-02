# AGENTS.md — Ensaio às Competências Digitais (ECD)

Lê este ficheiro antes de tocar no código. Mantém-no atualizado na mesma alteração que muda arquitetura, convenções ou estado.

## O que é

Jogo web gratuito (pt-PT, sem conta) para treinar e medir competências digitais práticas exigidas por provas em computador. Projeto Kendir Studios / Worlds4Education. Especificação de origem: `docs/ESPECIFICACAO.md` (resumo) e o HTML "Ensaio Digital" v0.1 (1 out 2026) que o produto owner guarda; o nome mudou para **Ensaio às Competências Digitais (ECD)**.

Pedidos adicionais do product owner, já implementados na v0.1.0:
1. **Formato de UI selecionável**: "Kendir" (próprio) ou "Mosaico" (Ágora Design System da AMA, `@ama-pt/agora-design-system`).
2. **Treino de competências** com **5 níveis por atividade**; atividade específica de **escrita matemática** (notação, anotações) com 5 níveis; segundo **contexto de aprendizagem** (aluno num laboratório de experiências) além do jornalista.

## Arquitetura

SPA estática: Vite 7 + React 19 + TypeScript + Tailwind v4 + react-router 7 (rotas declarativas em `src/App.tsx`). Sem servidor nesta fase; dados anónimos em localStorage atrás da interface `Repositorio` (`src/dados/repositorio.ts`), que a futura versão Supabase deve implementar (tabelas `sessions`, `attempts`, `test_runs` da especificação).

Comandos: `npm run dev` (porta 5180) · `npm run typecheck` · `npm test` (Vitest) · `npm run build`.

### Formatos de UI

- Tokens CSS em `src/styles/app.css`: `:root` = Kendir; `:root[data-formato="mosaico"]` redefine os mesmos tokens com a paleta Ágora. Tema escuro só no Kendir.
- Componentes em `src/ui/index.tsx` têm **duas implementações** (HTML próprio ou componente Ágora) escolhidas por `usePreferencias().prefs.formato`. **As atividades usam sempre estes componentes**, nunca `<button>` com classes Ágora à mão (exceções: controlos muito específicos como separadores, paginação e palavras clicáveis, que usam classes próprias).
- O CSS do Ágora (~1 MB, com `@layer base` global e `--color-*: initial` no `@theme`) é importado **só** quando o formato é Mosaico (`src/main.tsx` faz `import("./styles/mosaico.css")`). Por isso trocar de formato recarrega a página. **Não** uses utilitários de cor do Tailwind (`bg-white`, `text-gray-…`): usa `var(--token)`.
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

- v0.1.0: fase 1 feita e alargada (7 atividades × 5 níveis, teste por ciclo, treino, dois contextos, dois formatos, dados locais, páginas de texto).
- Por fazer: atividades `arquivo`, `cartao`, `fecho`, `simulador`; fases 3–6 (turmas, contas, observatório servidor, auditoria). Supabase ainda não ligado. Lovable não usado: o projeto foi criado localmente e ligado ao GitHub diretamente.
- Limiares e alvos de pontuação são estimativas iniciais; recalibrar com piloto.
