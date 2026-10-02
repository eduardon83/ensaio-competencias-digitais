# Telemetria anónima sem base de dados

A aplicação não tem contas nem registos de pessoas. Para haver estatísticas de uso (quantas pessoas avaliaram, que competências faltam, em que níveis), cada tentativa e cada teste concluído são enviados de forma anónima para um **ponto de recolha** que a entidade que publica a aplicação controla. Não há servidor nosso: o ponto de recolha é um Google Apps Script que escreve numa folha de cálculo Google. Custo zero, sem base de dados, e a folha é analisável diretamente por quem quiser (EduQA, ARTE, investigadores).

## O que é enviado

Por tentativa: identificador aleatório da sessão (criado no navegador, não ligado a nada), atividade, nível, pontuação, duração, origem (teste, treino, código), contexto, formato, extensão de tempo, classe de dispositivo (desktop, tablet, telemóvel), métricas da atividade (ex.: palavras por minuto, se usou a procura) e versão da aplicação.

Por teste concluído: sessão, ciclo, pontuação global, faixa, pontuação por domínio.

Quando a tentativa vem de um **código de professor**, leva também a sessão desse código e o identificador que o professor pediu (número de turma ou alcunha).

Por sessão de professor (folha `sessoes`): código, configuração da prova, hash do token privado do professor e, se o professor o indicar, o email (só usado depois de confirmado; apagado 12 meses após a última tentativa).

Nunca, de nenhum aluno: nome, email, IP (o script não o lê), impressão digital do dispositivo, cookies de terceiros. O utilizador pode desligar o envio em **Definições → Estatísticas anónimas**.

## Instalar o ponto de recolha (≈ 5 minutos)

1. Cria uma folha de cálculo Google vazia (por exemplo "ECD telemetria").
2. Menu **Extensões → Apps Script**. Apaga o conteúdo e cola `apps-script.gs`. Guarda.
3. **Definições do projeto (⚙) → Propriedades do script → Adicionar propriedade**: nome `ADMIN_CHAVE`, valor uma frase longa e secreta. É a chave do ecrã de administração.
4. **Implementar → Nova implementação → tipo Aplicação Web**. Executar como: **eu**. Quem tem acesso: **Qualquer pessoa**. Autoriza quando pedido (folha de cálculo e envio de email em teu nome).
5. Copia o URL que termina em `/exec`.
6. Na aplicação, cria `.env` (a partir de `.env.example`) com `VITE_TELEMETRIA_URL=<esse URL>` e faz `npm run build`. Sem este valor a aplicação funciona na mesma, sem enviar nada.

7. Para os resumos diários aos professores: no editor do Apps Script escolhe a função `instalarAcionadores` e carrega em **Executar** uma vez. Cria um acionador diário às 19h que chama `resumoDiario` (e apaga emails de sessões paradas há mais de 12 meses).

A primeira utilização cria automaticamente as folhas `tentativa`, `teste` e `sessoes` com cabeçalhos.

Se mudares o script depois, usa **Implementar → Gerir implementações → editar → Nova versão**, para o URL `/exec` se manter.

## Ver os dados

- **Folha de cálculo**: dados brutos, filtros, tabelas dinâmicas, gráficos. É a via mais simples para análise.
- **/observatorio** na aplicação: agregados públicos, com grupos de menos de 20 tentativas ocultos.
- **/admin** na aplicação: agregados completos depois de introduzir a `ADMIN_CHAVE` (verificada no script, não na aplicação). A chave fica só na sessão do navegador de quem a introduziu.

## Emails aos professores

O script envia emails com o MailApp da conta Google que o publica: confirmação do endereço, um email por atividade concluída ou um resumo diário (escolha do professor). Quota diária do Google: cerca de 100 destinatários por dia numa conta pessoal e 1 500 numa conta Google Workspace. Para uma utilização nacional, publica o script com uma conta Workspace da entidade. A ligação privada de resultados funciona sempre, mesmo sem email.

## Limites e alternativas

O Apps Script aguenta dezenas de milhares de linhas por folha sem problemas e tem quotas diárias generosas para uma aplicação escolar. Se um dia for preciso mais, o cliente (`src/dados/telemetria.ts`) só conhece um URL que aceita POST em JSON e GET para agregados: pode ser trocado por um Cloudflare Worker, uma Edge Function do Supabase ou qualquer outra coisa sem tocar no resto da aplicação.

## Mudar a chave ou revogar

Alterar `ADMIN_CHAVE` nas propriedades do script tem efeito imediato. Para parar a recolha, basta **Implementar → Gerir implementações → Arquivar**; a aplicação continua a funcionar e deixa de enviar.
