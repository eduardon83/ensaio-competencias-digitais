# CLAUDE.md · Ensaio às Competências Digitais (ECD)

Memória de trabalho do projeto para o Claude (chat e Claude Code). Ler no início de cada sessão.
Arquitetura, convenções e estado do código: @AGENTS.md (fonte de verdade técnica; este ficheiro não a repete).

## Regras de trabalho

- Português de Portugal em tudo (UI, identificadores, comentários, commits, documentos).
- Sem travessões. Frases curtas. Saídas concisas. Conteúdo para crianças: frases muito curtas e vocabulário simples.
- Aspas curvas “ ”. Organizações, marcas e pessoas dos exemplos sempre fictícias.
- Acessibilidade é requisito: WCAG 2.2 AA, teclado total, alvos ≥ 44 px, alternativa a arrasto e a movimento.
- Uma única confirmação antes de qualquer alteração irreversível de dados (apagar KV, Durable Objects, folhas, sessões).
- Ao mudar arquitetura ou estado: atualizar `AGENTS.md`, `README.txt` (e regenerar `README.pdf`) e este ficheiro no mesmo commit.
- Repositório público: nenhum segredo no código; a segurança depende só dos segredos do Worker.

## Fase atual (2026-10-13): Aldeia Digital implementada (v1.1.0, por publicar)

- Ordem de produção dada a 2026-10-13: fases F1 a F5 implementadas (código em `src/aldeia/`, `worker/aldeia/`; arquitetura em `AGENTS.md`). Falta F6 (carga, auditoria independente, piloto) e a configuração dos segredos e da Resend.
- Documentos (em `docs/aldeia-digital/`, públicos):
  - `ESPECIFICACAO.md`: estrutura, fluxos, dados, relatórios e alertas, fases, decisões.
  - `CURRICULO.md`: alinhamento com AE de Cidadania e Desenvolvimento (2025), DigComp 2.2 e o livro “Competências Digitais” (Pedro, Santos e Mattar, coords.).
  - `SEGURANCA.md`: ameaças e controlos do Worker.
  - `design.md`: orientações de desenho para o agente de arte/UI; secção 17 = o que a aplicação faz de facto (base para vídeos).
  - `HISTORIA.md`: bíblia da história, personagens, tom e guiões dos vídeos (promocional, "Ver em 1 minuto", tutoriais).
  - `QA.md`: relatório de testes e QA (como repetir, resultados, problemas corrigidos, revisão de segurança própria).

## Aldeia Digital em resumo

- Segundo modo do ECD. Na página Professor há **duas opções lado a lado**: Teste de Competências e Aldeia Digital. Escolher uma muda os blocos abaixo (não é menu).
- Prova completa contada como história, em 4 a 6 aulas. Para crianças e jovens, ligada à vida de aluno e à escola.
- Professor define tamanho da turma (lugares), nível, extensão, dimensões de Cidadania, identificação, ritmo, data de fim, email e alertas. Recebe código da turma e código do professor.
- Aluno entra com o código da turma e um nome (número, primeiro nome ou nome anónimo como “Dinossauro Charmoso”). O avatar **nasce de um ovo**, segue-se um tutorial curto (inclui como se guardam os dados).
- Sessão local (chave no navegador) e, noutro computador, código + nome. Conteúdo só do aluno: progresso, casa por dentro, guarda-roupa, Jornal da Aldeia, treino.
- Aldeia isométrica: Escola, Casas, Jornal, Laboratório (núcleo) e edifícios de expansão; missões usam as atividades existentes e novas missões de cidadania ilustradas.
- Professor: painel, relatórios de progresso e de conclusão, alertas e resumos por email (semanal por omissão).

## Ligações ao código existente (para a produção)

- Motor: `src/motor/tipos.ts`, `src/motor/Atividade.tsx`. Registo: `src/registo.ts`. Cenários e personagens: `src/contextos/index.ts`.
- Códigos de prova: `src/codigo/codigo.ts` (10 a 12 símbolos). Aldeia: 7 símbolos, sem colisão.
- Professor: `src/paginas/Professor.tsx` (passa a ter a escolha de modo). Aluno: `src/paginas/Codigo.tsx`.
- Escolhas em situações: `src/seguranca/Situacoes.tsx` (base das missões de cidadania).
- Persistência local: `src/dados/repositorio.ts`. Telemetria: `src/dados/telemetria.ts`, `telemetria/apps-script.gs` (origem "aldeia").
- Worker: `worker/index.ts`, `wrangler.jsonc` (KV `TEXTOS`, `ratelimits`). Padrões a reutilizar: `iguais()` e bloqueio por falhas.
- Carregamento à parte de cenas pesadas: padrão da Maqueta (`React.lazy`).
- CSP: `public/_headers` e `docker/nginx.conf` (`connect-src 'self'` já cobre a API na mesma origem).

## Registo de decisões

| Data | Decisão | Estado |
|---|---|---|
| 2026-10-02 | Sem servidor, sem contas, sem base de dados | Em vigor no ECD base |
| 2026-10-13 | Novo modo para professores: prova completa com narrativa, aldeia isométrica, avatares | Aprovado |
| 2026-10-13 | Nome: **Aldeia Digital**; página Professor com dois modos (Teste de Competências / Aldeia Digital) | Aprovado |
| 2026-10-13 | Sem contas nem emails de alunos: código da turma + nome; sessão local; código próprio do professor | Aprovado |
| 2026-10-13 | Progresso no **Cloudflare Worker** (exceção à decisão de 2026-10-02), mantido pela Kendir Studios | Aprovado |
| 2026-10-13 | Validação a pedir a EduQA e IAVE (e sugerido DGE) | Em curso |
| 2026-10-13 | Documentos no repositório público | Aprovado |
| 2026-10-13 | Foco em crianças e vida escolar; não competir com diagnósticos para adultos (Academia Portugal Digital) | Aprovado |
| 2026-10-13 | Segurança do servidor como requisito de primeira ordem (`SEGURANCA.md`) | Aprovado |
| 2026-10-13 | Todos os textos da Aldeia (história, diálogos, tutorial, missões, emails, documentos) editáveis no backoffice, com chaves por id | Aprovado |
| 2026-10-13 | Envio de email da Aldeia pela **Resend** (conta e domínio a configurar pelo product owner) | Aprovado |
| 2026-10-13 | Papéis RGPD: escola responsável, Kendir subcontratante; termos para professores + termos de tratamento + carta aos EE + AIPD | Proposta, a validar |

| 2026-10-13 | Implementação: Durable Objects; um código de turma; máximo 32; desbloqueios só por marcos; pixel art (pacote de arte); Canvas 2D; primeiro nome permitido como opção; retenção 30 dias; objetivo coletivo = 3 em cada 4 alunos acabam o capítulo do meio | Implementado, a confirmar |
| 2026-10-13 | Turnstile na criação de turmas | Não implementado (decisão 12 aberta; precisa de mudar a CSP) |

Decisões abertas: `ESPECIFICACAO.md` secção 14.

## Observações do repositório (2026-10-13)

- Versão pública: 1.0.1, em https://ecd-ensaio.edmnns.workers.dev.
