# Aldeia Digital · Relatório de testes e QA (v1.1.0)

Data: 2026-10-14. Âmbito: a Aldeia Digital e as alterações às atividades do ECD da v1.1.0. Fora do âmbito, por decisão do product owner: piloto com turmas e validação jurídica (RGPD).

## 1. Como repetir

```
npm run build
npx wrangler dev --port 8787 --local          # com .dev.vars (PIMENTA_PROFESSOR, CHAVE_TOKENS)
node scripts/aldeia/testar-api.mjs http://127.0.0.1:8787     # 32 verificações da API
node scripts/aldeia/qa.mjs http://127.0.0.1:8787 capturas-qa # 24 verificações no Chrome
node scripts/aldeia/carga.mjs http://127.0.0.1:8787 1 32 6   # carga: turmas, alunos, rondas
node scripts/auditoria-a11y.mjs http://127.0.0.1:8787        # axe no sítio inteiro
npm run typecheck && npm test
```

Os scripts criam as turmas pela API com IPs simulados (`cf-connecting-ip`). Só funcionam no Worker local. Não correr contra o sítio publicado.

## 2. Resultados

| Verificação | Resultado |
|---|---|
| `npm run typecheck` (aplicação e Worker) | sem erros |
| `npm test` (Vitest) | 145 testes certos |
| `testar-api.mjs` (rotas, esquemas, chaves, tokens, bloqueios, quotas, prémios, só leitura) | 32 de 32 |
| `qa.mjs` no Chrome (ver 2.1) | 24 de 24 |
| `auditoria-a11y.mjs` (axe, sítio inteiro) | 0 ocorrências |
| Carga: 1 turma × 32 alunos × 6 rondas | 257 pedidos, 0 erros, p50 18 ms, p95 45 ms, máx 113 ms |
| Carga: 6 turmas × 32 alunos (uma escola, um só IP) | 1542 pedidos, 0 erros do código da Aldeia (ver 2.2) |
| Registos em simultâneo (20 com o mesmo animal, 20 com o mesmo nome, 20 lugares) | 1 aceite, 1 aceite, 20 lugares distintos |

### 2.1 Cenários no navegador (`qa.mjs`)

- Teclado no mapa: Tab chega aos edifícios; Enter anda até à porta e abre o cartão; Escape fecha.
- "Sair deste computador": mensagem, regresso à entrada, chave apagada no navegador e recusada pelo servidor.
- Outro computador: entra com o código e o nome, sem novo nascimento.
- Sem rede: o HUD mostra "Por guardar: sem rede"; a alteração chega ao servidor quando a rede volta e o aviso desaparece.
- Ritmo guiado: o capítulo fica fechado até o professor o abrir.
- Ações do professor: mudar o nome chega ao aluno; renovar o acesso obriga a entrar outra vez; fechar a turma impede entradas.
- Turma cheia: o aviso aparece antes de escolher o nome.
- Modo calmo: "Abrir o ovo" em vez da animação, 3 passos.
- axe sem ocorrências em 7 páginas da aldeia, com Original claro, Original escuro e Mosaico com todas as ajudas (texto grande, alvos grandes, leitura facilitada, contraste reforçado).
- Reflow a 320 px sem deslocamento horizontal.
- Mapa com a CPU 4× mais lenta: 48 fps (alvo 30), 2 quadros acima de 100 ms.
- Arte carregada pelo mapa: 50 kB (orçamento 1,5 MB).

### 2.2 Carga

Por turma (um Durable Object), 32 alunos a escrever de 2 em 2 a 4 s dão cerca de 11 pedidos/s com p95 de 45 ms. Com 6 turmas no mesmo processo local, o proxy do `wrangler dev` sobe o p95 para 4,6 s e perde 24 ligações ("Network connection lost", erros do ProxyWorker e não do código). Com 50 turmas (1600 alunos), o processo local cai. Isto é um limite do ambiente de desenvolvimento, que corre todos os objetos num só processo. Na Cloudflare, cada turma é um objeto separado.

Recomendação antes do piloto: repetir `carga.mjs` contra o ambiente de testes (`npx wrangler deploy --env testes`, com segredos próprios) para medir latências reais. O script precisa de uma alteração para isso: os IPs simulados não valem fora do local, por isso as quotas de criação por IP aplicam-se.

## 3. Problemas encontrados e corrigidos

| # | Problema | Correção |
|---|---|---|
| 1 | Os limites por IP (60 pedidos/min, 20 códigos de turma errados, 10 nomes errados, 5 turmas por hora) bloqueavam uma escola inteira atrás do mesmo IP (NAT): uma turma de 32 a entrar ao mesmo tempo passava os 60 pedidos/min. | `LIMITE_ALDEIA` passa a 900/min. Códigos de turma errados: 40 em 10 min. Nomes errados: 30 em 10 min, por IP e turma. Criação de turmas: 10 por hora e 40 por dia por IP. Os limites por turma (300 escritas/min) e por aluno (5 em 10 s) continuam a travar o abuso. Ver SEGURANCA.md. |
| 2 | Com o servidor indisponível, a página do professor deixava criar uma turma que só existia naquele navegador. | O botão "Criar a aldeia" fica desativado e a página explica porquê. |
| 3 | Em "só leitura", o professor não conseguia entrar no painel. | `/api/aldeia/professor/entrar` passa a ser permitido nesse estado. |
| 4 | A cena do nascimento saía do ecrã no telemóvel. | Moldura fluida (largura 100 %, máximo pela escala, proporção fixa); a etiqueta é posicionada em percentagens. |
| 5 | Um código de turma com `%` malformado (`/t/%E0%A4%A`) dava erro 500. | Tratado como código inválido (404, conta como falha). Verificação nova em `testar-api.mjs`. |
| 6 | Robustez: o registo e a entrada calculavam o resumo da chave entre ler os alunos e gravar. No Worker isto não abre a porta a outros pedidos, porque `crypto.subtle` não faz I/O, mas a garantia era frágil. | A chave e o resumo calculam-se antes de ler. "Sair deste computador" volta a ler o aluno antes de gravar. |

## 4. Revisão de segurança (própria, do código novo)

Verificado:
- Corpos só JSON, até 16 kB, com esquemas fechados (campos a mais são recusados).
- Erros curtos, sem detalhes internos.
- Cabeçalhos `no-store`, `nosniff`, CSP `default-src 'none'` e `no-referrer`.
- Códigos de turma inexistentes e inválidos respondem da mesma forma, com o mesmo atraso, e contam como falha.
- Código do professor guardado só como HMAC com pimenta secreta.
- Tokens assinados com prazo e propósito (painel, confirmar, sair).
- Chaves de dispositivo aleatórias, guardadas como SHA-256 e comparadas em tempo constante.
- O servidor recalcula todos os desbloqueios: as operações não ganhas, fora do capítulo ou repetidas são ignoradas.
- O IP nunca é guardado em claro (só um resumo, nas guardas).
- Os registos de erro só têm a rota.

Notas que ficam em aberto:
- Quem tem o código da turma pode ocupar lugares. Isto é intencional: o código é partilhado na aula. O professor pode apagar alunos e renovar o acesso. O Turnstile continua por decidir (ESPECIFICACAO.md).
- Se um limitador da Cloudflare falhar, o pedido falha (500). Não abre por omissão.
- Falta uma revisão de segurança independente antes do piloto.

## 5. Ambiente local: avaria conhecida

Com o Miniflare 5.20261006.2-beta (wrangler 4.150.0) no Windows, o limitador de pedidos local (`ratelimits`) passou a responder "internal error" em qualquer projeto, mesmo com o estado limpo. Os Durable Objects continuam a funcionar. Isto não afeta a Cloudflare. Os testes de carga e a repetição do QA depois desta avaria correram com uma configuração temporária sem `ratelimits` (o código salta os limitadores quando a ligação não existe). As verificações de limites por IP, nome e criação usam a Guarda e não o limitador, por isso continuam cobertas. Se a avaria persistir, atualizar o wrangler (4.151.0 disponível).
