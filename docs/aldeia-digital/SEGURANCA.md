# Aldeia Digital · Segurança do servidor (v0.1, 2026-10-13)

Objetivo: o Worker da Aldeia aguenta abuso e ataques sem cair, sem gastos descontrolados e sem expor dados de crianças.
Princípio: o repositório é público. A segurança não pode depender de segredo do código, só dos segredos do Worker.

## 1. Superfície

| Rota | Quem | Risco principal |
|---|---|---|
| `POST /api/aldeia/turmas` | professor | criação em massa (custos, lixo) |
| `GET /api/aldeia/:turma` | aluno | adivinhar códigos de turma |
| `POST /api/aldeia/:turma/alunos` | aluno | encher lugares, nomes impróprios |
| `POST /api/aldeia/:turma/entrar` | aluno noutro computador | adivinhar nomes |
| `PUT /api/aldeia/:turma/alunos/:id` | aluno | escrever no progresso de outro, inflacionar prémios, pedidos grandes |
| `POST /api/aldeia/:turma/professor` | professor | força bruta ao código do professor |
| `POST /api/aldeia/:turma/email` | professor | usar o servidor para enviar spam |
| rotas atuais `/api/textos` | backoffice | já protegidas (chaves, limite 30/min) |

Os ficheiros estáticos não mudam (cabeçalhos de `public/_headers`).

## 2. Ameaças e controlos

### 2.1 Volume e negação de serviço
- Proteção DDoS da Cloudflare na rede (automática).
- Regras de **limite de pedidos na borda** (WAF) para `/api/aldeia/*`, antes de o Worker correr.
- No Worker, bindings de limite (`ratelimits`, como `LIMITE_CHAVES`):
  - por IP: 900 pedidos por minuto em `/api/aldeia/*` (revisto no QA: uma escola inteira sai pelo mesmo IP; 60 bloqueavam uma turma de 32);
  - por turma: 300 escritas por minuto (uma turma de 32 a jogar não chega lá);
  - por aluno: 1 escrita a cada 2 segundos (o cliente agrupa as alterações).
- Corpo máximo: 16 kB. Só `application/json`. Métodos fora da lista: 405.
- Respostas de erro curtas e iguais (sem pormenores internos).

### 2.2 Criação de turmas em massa
- **Turnstile** (desafio invisível da Cloudflare) só no ecrã de criação de turma e de configuração do email. Nunca nos alunos. A confirmar na política de privacidade.
- Por IP: 10 turmas por hora e 40 por dia (revisto no QA: vários professores da mesma escola partilham o IP).
- Teto global de turmas ativas (ex.: 5 000), configurável. Ao chegar a 80 %: alerta à Kendir. Ao chegar ao teto: novas criações recusadas com mensagem simpática.
- Turma sem nenhum aluno em 14 dias: apagada automaticamente (alarme do Durable Object).

### 2.3 Adivinhar códigos de turma
- 6 símbolos em 31 = cerca de 887 milhões de códigos; com 5 000 turmas ativas, 1 acerto em cerca de 177 000 tentativas.
- Falhas por IP: 40 códigos errados em 10 minutos dá bloqueio de 15 minutos (o carácter de verificação apanha antes os erros de escrita).
- O carácter de verificação recusa erros de escrita sem consultar o armazenamento.
- A resposta a um código inválido e a uma turma fechada tem o mesmo tempo e forma.

### 2.4 Adivinhar nomes (entrar no progresso de outro)
- Fraqueza aceite pelo product owner: código + nome dá acesso. Mitigações:
  - por IP e turma: 30 nomes errados em 10 minutos dá bloqueio de 15 minutos (revisto no QA: 10 bloqueavam a turma inteira por engano);
  - a entrada noutro computador fica registada no aluno (data, sem IP) e aparece ao professor;
  - o aluno não pode apagar nada de forma irreversível sem o professor;
  - o professor pode “renovar” um aluno (invalida as chaves de dispositivo).
- Sem lista pública de nomes da turma na entrada.

### 2.5 Escrever no progresso de outro aluno
- Ao criar o aluno, o servidor devolve uma **chave de dispositivo** aleatória (128 bits). O navegador guarda-a; o servidor guarda só o seu hash.
- Todas as escritas levam essa chave. Sem chave válida: 401.
- Entrar noutro computador (código + nome) gera uma chave nova para esse navegador. Máximo 5 chaves por aluno (a mais antiga cai).

### 2.6 Batota e dados inválidos
- Risco baixo (sem prémios reais), mas o servidor:
  - valida cada campo contra um esquema fechado (campos desconhecidos recusados);
  - aceita só ids de missões, itens e fatos que existem no catálogo;
  - limita pontuações a 0–100 e durações a valores plausíveis;
  - funde progresso de forma monótona (máximo das pontuações, primeira tentativa nunca muda);
  - **calcula os desbloqueios no servidor** a partir do progresso. O cliente não pode dar itens a si próprio.

### 2.7 Código do professor
- 12 símbolos + verificação (cerca de 7,9 × 10^17 combinações).
- Guardado como **HMAC-SHA256** com um segredo do Worker (`PIMENTA_PROFESSOR`), nunca em claro.
- Comparação em tempo constante (como `iguais()` em `worker/index.ts`).
- 10 falhas por IP em 15 minutos dá bloqueio de 15 minutos (como o `/admin`).
- Depois de entrar, o painel recebe um **token assinado de curta duração** (2 horas) guardado em `sessionStorage`. Sem cookies, logo sem CSRF.
- O código nunca vai em endereços nem em emails.

### 2.8 Nomes e conteúdo
- Normalizar (Unicode NFC), aceitar só letras, números, espaço e hífen; tirar caracteres invisíveis e de controlo; máximo 20.
- Filtro de palavras impróprias (lista em pt-PT, no servidor e no cliente).
- Tudo é mostrado como texto (o React escapa). Nunca `innerHTML` com dados de alunos.

### 2.9 Email (não ser usado para spam)
- Só para endereços confirmados por ligação. Máximo 3 pedidos de confirmação por endereço por dia.
- Modelos fixos; o único conteúdo variável são números e identificadores validados.
- Máximo 1 email por turma por dia, mais um teto global diário.
- Ligação para deixar de receber em todos os emails; endereço apagado quando a turma fecha.
- Fornecedor: Resend, com SPF, DKIM e DMARC no domínio de envio (ver 7).
- Textos dos modelos vêm do backoffice; o Worker escapa tudo e só aceita a marcação simples do ECD.

### 2.10 Navegador
- API na mesma origem: sem cabeçalhos CORS (outros sítios não conseguem ler as respostas).
- CSP atual mantém `connect-src 'self'`. Respostas da API com `no-store`, `nosniff` e `frame-ancestors 'none'` (como as de `/api/textos`).

## 3. Dados e registos
- Um **Durable Object por turma**: os dados de uma turma não se misturam com outras e apagam-se juntos.
- Apagamento automático por alarme: 30 dias depois da data de fim; 14 dias sem alunos.
- Registos do Worker (`observability`): nunca registar corpos de pedidos, nomes nem chaves. Só rota, código de estado e duração.
- Sem cópias de segurança dos dados dos alunos (são temporários por natureza).

## 4. Custos e interruptores
- Alertas de faturação e de utilização na conta Cloudflare.
- Variável `ALDEIA_ESTADO`: `aberta`, `so-leitura` (ninguém escreve, todos veem), `fechada` (só aviso). Muda-se sem novo deploy.
- Teto de armazenamento por turma (32 alunos × 64 kB) e por aluno (64 kB).

## 5. Segredos
- Novos segredos do Worker: `PIMENTA_PROFESSOR`, `CHAVE_TOKENS` (assinar tokens do painel), chave secreta do Turnstile, `RESEND_CHAVE`.
- Nunca no repositório. Rotação documentada no `README.txt` (secção de publicação).

## 6. Desenvolvimento seguro
- Ambiente de testes separado (`wrangler` com `env.testes`) para ensaiar antes de publicar.
- Testes automáticos: validação de esquemas, fusão de progresso, cálculo de desbloqueios, limites e bloqueios.
- Teste de carga e abuso antes da F6: 32 alunos a jogar em simultâneo em 50 turmas; força bruta simulada a códigos e nomes.
- `npm audit` e atualizações automáticas de dependências no CI; poucas dependências no Worker.
- Revisão de segurança independente antes do piloto (pode ser outro agente, sem ver o desenvolvimento).

## 7. Envio de email: Resend (decidido)
- O Worker chama a API da Resend. Chave em segredo do Worker (`RESEND_CHAVE`), com permissão só de envio e restrita ao domínio de envio.
- Domínio de envio próprio (ex.: subdomínio do ECD) verificado na Resend com SPF, DKIM e DMARC. Remetente fixo, sem respostas (`Reply-To` para o contacto da Kendir).
- Escolher a região de dados na UE se a Resend a oferecer na conta; senão, registar a transferência nos termos (ver `ESPECIFICACAO.md` 10.4). Assinar o acordo de tratamento de dados da Resend.
- Webhook de devoluções e queixas (opcional na v1): endereço que devolve ou se queixa deixa de receber automaticamente. Webhook assinado e verificado.
- Os limites de 2.9 aplicam-se antes de chamar a Resend (protege a reputação do domínio e a conta).
- Os emails de prova atuais (Apps Script) continuam como estão até decisão em contrário.

## 8. Incidentes
- Passo 1: pôr `ALDEIA_ESTADO` em `so-leitura` ou `fechada`.
- Passo 2: rodar segredos afetados.
- Passo 3: avaliar se houve acesso a dados pessoais. Se sim, notificar a CNPD em 72 horas e informar as escolas (conforme os papéis RGPD acordados).
- Contacto de segurança na página Sobre e no repositório (ficheiro `SECURITY.md` a criar na produção).
