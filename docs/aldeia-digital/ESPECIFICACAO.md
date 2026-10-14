# Aldeia Digital · Especificação (v0.2, 2026-10-13)

Estado: implementado na v1.1.0 (fases F1 a F5; por publicar). As escolhas feitas nas decisões abertas estão na secção 14.
Documentos irmãos: `CURRICULO.md` (alinhamento com AE e DigComp), `SEGURANCA.md` (proteção do servidor), `design.md` (orientações de desenho).

## 1. O que é

A **Aldeia Digital** é um segundo modo do ECD para o professor criar com a sua turma. É uma **prova completa contada como história**. Cada aluno nasce na aldeia como um avatar (criança com fato de animal), recebe uma casa e avança por capítulos, visitando edifícios. Cada edifício tem missões: atividades, jogos e testes que o ECD já tem, e novas missões de cidadania digital ilustradas com a própria história.

Público: crianças e jovens do 1.º ciclo ao secundário, com foco no ensino básico.

Objetivos:
1. Motivar os alunos mais novos a fazer a prova inteira, em várias aulas, sem perder o fio.
2. Dar ao professor o perfil de competências por aluno e por turma, com relatórios de progresso e de conclusão.
3. Ligar as competências digitais à vida de aluno e de criança: a escola, a família, a proteção e o crescimento.
4. Manter a regra do ECD: sem contas, sem emails de alunos, dados mínimos e temporários.

Não é: uma rede social, uma loja, um ranking público, nem um diagnóstico para adultos.

### 1.1 Posicionamento
- Já existe um diagnóstico de competências digitais para a população em geral (Academia Portugal Digital, digital.gov.pt). A Aldeia Digital não compete com ele.
- A diferença: é para crianças, vive dentro da turma e da escola, aprende-se a jogar uma história, os contextos são os da vida de aluno (jornal de turma, laboratório, biblioteca, família), e não há conta.
- Detalhe e referenciais em `CURRICULO.md`.

### 1.2 Manutenção e validação
- O servidor (Cloudflare Worker) e o conteúdo são mantidos pela Kendir Studios.
- Validação pedagógica a pedir a EduQA e IAVE. Sugerido também: DGE (responsável pelas AE).

## 2. Entrada do professor: dois modos

A página Professor (`/professor`) passa a abrir com **duas opções lado a lado**. Não é um menu nem separadores: é uma escolha de modo. Clicar numa muda os blocos de configuração abaixo.

| | Teste de Competências | Aldeia Digital |
|---|---|---|
| Explicação curta (proposta) | “Uma prova curta, numa só aula. Escolhe os desafios e recebe os resultados.” | “Uma história em várias aulas. Cada aluno tem um avatar e uma casa, e avança pela aldeia.” |
| Vídeo | espaço para vídeo curto (a produzir) | espaço para vídeo curto (a produzir) |
| Blocos abaixo | os atuais: nível, atividades, identificação, tempo, email | os da secção 4 |

Regras:
- Predefinido: nenhum selecionado na primeira visita (as duas explicações visíveis); depois lembra a última escolha neste navegador.
- Acessibilidade: grupo de opções (`radiogroup`) com dois cartões grandes, cada um com título, frase, ícone e estado “escolhido” por forma e texto, não só por cor. Mudar de modo não apaga o que já foi preenchido no outro.
- “As minhas sessões” fica no fim da página e lista os dois tipos, com etiqueta.
- Textos editáveis no backoffice (`PAGINAS.professor`).

## 3. Rotas (proposta)

- `/professor`: escolha de modo (secção 2).
- `/professor/aldeia/painel`: painel do professor (pede o código do professor).
- `/aldeia` e `/aldeia/:codigo`: entrada do aluno e o jogo.
- `/codigo` aceita os dois tipos de código e encaminha (distingue pelo tamanho, ver 5.3).

## 4. Configuração da Aldeia pelo professor

| Campo | Valores | Notas |
|---|---|---|
| Nome da turma | texto curto, opcional | só para o professor (ex.: “5.º B”) |
| Tamanho da turma | 1 a 32 | número de lugares (avatares e casas). Pode aumentar depois |
| Nível | 1 a 5 ou percurso (ModA 4.º, ModA 6.º, 9.º, Secundário, Superior) | igual à prova atual |
| Extensão da história | Essencial, Completa, Personalizada | ver 7.3 |
| Dimensões de Cidadania | as 8 dimensões das AE de CD | a escola escolhe os anos do 2.º grupo; o professor marca as que está a trabalhar (ver `CURRICULO.md`) |
| Identificação | número de turma, primeiro nome, nome anónimo gerado | predefinido: nome anónimo gerado |
| Ritmo | Livre ou Guiado | Guiado: o professor abre cada capítulo na aula |
| Tempo alargado | ×1, ×1,25, ×1,5, ×2 | para a turma; acomodações individuais nas Definições do aluno |
| Data de fim | até 31 de agosto do ano letivo | depois a turma fecha e os dados são apagados |
| Email e alertas | opcional | ver 9.4 |

Ao criar, o professor recebe:
- Código da turma, QR e ligação para projetar.
- **Código do professor**, mostrado uma vez, com “Copiar” e “Guardar como PDF”. Aviso: sem ele não há acesso ao painel.
- Opcional: folha de **cartões de entrada** para imprimir (um por lugar) e uma **carta para os encarregados de educação** (o que é, que dados se guardam, como ajudar em casa).

## 5. Identidade dos alunos sem contas

### 5.1 Primeira entrada
1. O aluno (ou o encarregado de educação, no 1.º ciclo) escreve o código da turma.
2. Escolhe como se identifica, só nas formas que o professor permitiu:
   - número de turma (1 a 99);
   - primeiro nome (até 20 caracteres, aviso “só o primeiro nome”);
   - nome anónimo: o jogo propõe 3 (animal + adjetivo, ex.: “Dinossauro Charmoso”), com “Outros nomes”.
3. O nome é único na turma (sem diferença de maiúsculas e acentos). Se já existir, ver 5.2.
4. Escolhe o fato (animal) entre os lugares livres. Com nome anónimo, o animal do nome é o fato proposto.
5. **Nascimento do avatar**: mensagem “O teu avatar vai nascer!” e animação do ovo (ver `design.md` 6).
6. Personalizar cara e cabelo.
7. **“Guarda o teu nome”**: código da turma, nome e avatar, com “Guardar imagem” e “Imprimir”.
8. **Tutorial inicial** (ver 6.4 e `design.md` 7).

### 5.2 Voltar e conteúdo só do aluno
- **Sessão local**: o navegador guarda uma chave aleatória do aluno. No mesmo computador: “Continuar como Dinossauro Charmoso?” com um clique.
- **Outro computador**: código da turma + nome. Entra no seu progresso e recebe uma chave nova para esse navegador.
- O que é só do aluno (ninguém da turma vê): progresso e pontuações, guarda-roupa, interior da casa, cartão de carimbos, o seu Jornal da Aldeia e o treino nos edifícios. A turma vê apenas a fachada das casas e o avatar à porta.
- Nome já existente na primeira entrada: “Este nome já está na turma. És tu?” com “Sou eu, continuar” e “Não, escolher outro”. Fraqueza assumida: sessões temporárias, sem dados sensíveis.
- Nome esquecido: o professor vê a lista no painel. Sem recuperação automática.
- Computador partilhado: botão “Sair deste computador” apaga a chave local (aparece no fim de cada sessão e no tutorial).

### 5.3 Formato dos códigos
- Código da turma: 6 símbolos + 1 de verificação, alfabeto do ECD (sem 0/O/1/I/L), mostrado `XXX·XXXX`. Não colide com os códigos de prova (10 a 12).
- Código do professor: 12 símbolos + verificação, em grupos `XXXX-XXXX-XXXX`. Guardado só como HMAC (ver `SEGURANCA.md`).
- A configuração não vai dentro do código; o código é só um identificador.

### 5.4 Nomes anónimos
- Animais com género gramatical e adjetivos positivos com as duas formas: “a Raposa Corajosa”, “o Lince Veloz”.
- Sem adjetivos sobre corpo, aparência ou inteligência. Listas em `design.md` 5.
- Filtro de palavras impróprias para nomes escritos pelos alunos.

## 6. A aldeia

### 6.1 Edifícios
Núcleo (v1):

| Edifício | Função | Missões |
|---|---|---|
| Escola | início e fim da história, prova final | `painel`, `fecho`, `simulador` |
| Casas dos alunos | espaço pessoal: guarda-roupa, decoração, carimbos, treino | sem missões |
| Redação do Jornal | personagens do cenário Redação | `noticia`, `revisao`, `paginacao` + missões de Media |
| Laboratório | personagens do cenário Laboratório | `matematica`, `teclas`, `maqueta` |

Expansão:

| Edifício | Missões |
|---|---|
| Biblioteca | `encontra`, `leitura` |
| Arquivo | `arquivo` |
| Junta de Freguesia e Correios | `cartao`, `correio` + missões de Democracia e Instituições |
| Centro de Segurança Digital | testes de segurança + missões de Risco e Saúde |
| Mercado | `orcamento` + missões de Literacia Financeira |
| Oficina dos Robôs | `robo` |
| Museu | `sala-trancada` |
| Largo e Torre do Relógio | eventos, objetivo coletivo, festa final |
| Horta e Ecoponto | missões de Desenvolvimento Sustentável |

Os dois cenários atuais coexistem: cada missão usa o contexto do seu edifício.

### 6.2 Navegação
- Rato/toque (clicar no destino), teclado (setas ou WASD), e “Ir para” numa lista.
- **Mapa em lista** sempre disponível: todo o modo é jogável sem o mapa isométrico.
- Viagem rápida para edifícios desbloqueados.
- v1: os colegas aparecem só como casas e avatar à porta (sem andar em tempo real).

### 6.3 Mapa
- Aldeia fixa com 32 lotes no bairro; lotes vazios são jardins. Edifícios fora da história ficam “em obras”.

### 6.4 Tutorial inicial
Curto (8 passos, cerca de 2 minutos), saltável e repetível em “Ajuda”. Conteúdo:
1. A tua casa.
2. Como andar e o Mapa em lista.
3. Os edifícios e o que se faz em cada um.
4. Capítulos e missões: como se avança, repetir para melhorar.
5. Prémios: itens, estrelas, carimbos, troféus.
6. **Os teus dados**: o que se guarda, onde, quem vê, quando se apaga. É também uma primeira aprendizagem de proteção de dados (AE Media, 1.º ciclo; DigComp 4.2).
7. Ajudas: Ouvir, texto grande, modo calmo, sair deste computador.
8. A primeira missão.
Texto e desenho em `design.md` 7.

## 7. História e progressão

### 7.1 Premissa e arco
- Na semana da Festa da Aldeia, uma trovoada baralhou os computadores: notícias com erros, ficheiros trocados, a experiência do laboratório perdida, mensagens estranhas a circular. Cada aluno chega como recém-nascido na aldeia e ajuda a pôr tudo em ordem. A causa: o robô de limpeza da Junta foi mal programado. O aluno reprograma-o e a aldeia faz a festa.
- Arco de crescimento: de **recém-chegado** a **morador de pleno direito** da aldeia. Cada capítulo dá ao aluno mais responsabilidade na vida comum (fundamento em `CURRICULO.md` 2.3).
- Tom: sem vilões humilhados, sem medo. Os riscos aparecem como situações a resolver com calma e com ajuda de um adulto de confiança.

### 7.2 Capítulos (versão Completa)

| Cap. | Título provisório | Edifício | Missões |
|---|---|---|---|
| 0 | Nasce um morador | Casa, Escola | nascimento, tutorial, missão de prática (`painel`, não conta) |
| 1 | A sala de computadores | Escola | `painel`, `teclas`, missão “Regras da turma para o digital” |
| 2 | O jornal da turma | Jornal | `noticia`, `revisao`, `paginacao`, missão “Verdade ou boato na aldeia” |
| 3 | A experiência perdida | Laboratório | `matematica`, `maqueta` |
| 4 | Papéis por todo o lado | Biblioteca, Arquivo | `encontra`, `arquivo`, missão “De quem é esta imagem?” (direitos de autor) |
| 5 | A aldeia decide | Junta | `cartao`, `correio`, missão “A votação da festa” |
| 6 | Alerta na aldeia | Centro de Segurança | `fraude` + tema à escolha, missão “Pedir ajuda” |
| 7 | Quem baralhou a aldeia? | Junta, Oficina | `misterio`, `robo` |
| 8 | A Festa da Aldeia | Escola, Largo | `fecho`, `simulador` (prova final), festa |

Missões de cidadania entram conforme as dimensões escolhidas pelo professor (lista completa em `CURRICULO.md` 4). Duração: 4 a 6 aulas de 45 a 50 minutos.

### 7.3 Extensões
- **Essencial**: só os 12 desafios que contam para a preparação.
- **Completa**: tabela acima.
- **Personalizada**: o professor liga e desliga missões; capítulos vazios desaparecem; 0 e 8 são fixos.

### 7.4 Regras de avanço
- Uma missão fica concluída com qualquer pontuação. Abaixo de 50: “Podes tentar outra vez para ganhar mais”, sem bloquear.
- Capítulos abrem em sequência (Livre) ou pelo professor (Guiado).
- Repetir é sempre possível. Ficam a primeira e a melhor pontuação.
- O perfil de competências final usa só os 12 desafios (regra atual dos carimbos). Jogos, testes de segurança e missões de cidadania contam para a história, os prémios e um perfil de cidadania à parte.

### 7.5 Treinar com a história
- Depois de concluir uma missão, o edifício passa a ter “Treinar aqui”: a mesma atividade em modo prática, com os contextos e ilustrações da aldeia. Não conta para a prova.
- Em casa, o aluno pode treinar com a sua sessão (mesmo código e nome), sempre dentro da data de fim.

### 7.6 Final
- **Jornal da Aldeia**: primeira página com o avatar do aluno na capa, perfil de competências (como a `PrimeiraPagina`), perfil de cidadania, frases e “Para treinar”. Guardar como imagem.
- Festa no Largo quando todos terminam ou o professor encerra.

## 8. Recompensas

Recompensar esforço e progresso, nunca comparar alunos. Sem loja e sem moeda na v1.

| Acontecimento | Desbloqueia |
|---|---|
| Nascimento | fato inicial + 3 cores |
| Missão concluída | escolher 1 item de uma pequena seleção |
| Estrelas | cores e padrões |
| Carimbo (≥ 85) | troféu para a casa + emblema |
| Capítulo concluído | nova categoria e cena da história |
| Objetivo coletivo | decoração no Largo, todos veem |
| Fim | fato da festa |

Os desbloqueios são calculados no servidor a partir do progresso (ver `SEGURANCA.md`).

## 9. Professor: painel, relatórios e alertas

### 9.1 Painel
- Entrada com o código do professor.
- Turma: tabela por aluno (identificador, fato, capítulo, missões, competências, última atividade, acomodações usadas).
- Missões: média, faixas, tempo médio, primeira vs melhor.
- Perfil da turma por competência e por dimensão de cidadania (gráficos com tabela, `Graficos.tsx`).
- Miniatura da aldeia com o estado de cada aluno.
- Ações: abrir capítulo, aumentar lugares, mudar nome de um lugar, apagar um aluno, fechar a turma, apagar tudo (uma confirmação).

### 9.2 Relatório de progresso
A pedido ou periódico. Conteúdo:
- Resumo: alunos ativos e inativos, % de missões feitas por capítulo, capítulo em que está a maioria.
- Competências: média da turma nos desafios feitos até agora, com faixas.
- **Quem precisa de apoio**: alunos em “A começar” em 2 ou mais competências, ou sem atividade há N dias.
- Missões mais difíceis para a turma.
- Por aluno: capítulo, missões, primeira e melhor pontuação, tempo.
- Exportar CSV e PDF.

### 9.3 Relatório de conclusão
Quando a turma termina ou fecha:
- Perfil final de cada aluno (resumo do Jornal da Aldeia) e perfil da turma.
- **Evolução**: primeira tentativa vs melhor, por competência.
- Perfil de cidadania por dimensão trabalhada.
- “Para treinar” agrupado: que competências trabalhar com que alunos.
- Nota para o PADDE da escola (evidência agregada, sem nomes; ver `CURRICULO.md` 2.4).
- Exportar CSV e PDF. Aviso: os dados são apagados 30 dias depois da data de fim.

### 9.4 Alertas e emails
Alertas no painel (sempre) e por email (se o professor quiser):

| Alerta | Regra (predefinida, ajustável) |
|---|---|
| Aluno parado | sem atividade há 7 dias com a turma a avançar |
| Aluno com dificuldade | abaixo de 50 em 3 missões seguidas |
| Capítulo pronto | 80 % da turma terminou o capítulo (útil no Guiado) |
| Turma concluída | todos terminaram, relatório de conclusão pronto |
| Fecho próximo | faltam 7 dias para a data de fim: exportar |
| Lugares esgotados | alguém tentou entrar sem lugar livre |

Opções de email: nenhum, **resumo semanal** (predefinido), resumo diário, só marcos (capítulos e conclusão). Alertas no email entram no resumo seguinte, nunca mais de 1 email por dia por turma.

Regras do email:
- Só depois de confirmar o endereço por ligação. Ligação para deixar de receber em todos os emails.
- Conteúdo mínimo: números da turma e identificadores (número ou nome anónimo). O primeiro nome só aparece se o professor o autorizar.
- Detalhe completo só no painel, com o código do professor. O email nunca leva o código.
- Envio: **Resend** (decidido; configuração da conta e do domínio pelo product owner). Ver `SEGURANCA.md` 2.9 e 7.
- Textos dos emails editáveis no backoffice (ver 11.1).

## 10. Dados e privacidade

### 10.1 Por aluno
`nome`, `nomeNormalizado`, `lugar`, `aparencia`, `casa`, `progresso` por missão (primeira e melhor pontuação, estrelas, tentativas, duração, data), `desbloqueios`, hashes das chaves de dispositivo, `criadoEm`, `vistoEm`. Cerca de 5 kB.
Nunca: email, data de nascimento, IP guardado, impressão digital do dispositivo, texto livre além do nome.

### 10.2 Por turma
HMAC do código do professor, configuração, capítulos abertos, data de fim, email opcional (confirmado), datas.

### 10.3 Retenção
- Fecha na data de fim (máximo 31 de agosto). Apagamento automático 30 dias depois.
- O professor pode apagar tudo antes (uma confirmação).
- Telemetria anónima do ECD igual, com `origem: "aldeia"`, sem nome.

### 10.4 Papéis RGPD e documentos legais (proposta)
Papéis:
- **Escola (agrupamento) = responsável pelo tratamento.** O professor usa a Aldeia na sua atividade letiva, em nome da escola.
- **Kendir Studios = subcontratante** (art. 28.º do RGPD): aloja, mantém e apaga, só segundo as instruções do serviço.
- **Subcontratantes ulteriores**: Cloudflare (alojamento e dados) e Resend (email). Indicar país, garantias de transferência e ligação às políticas de cada um.
- Para o email do professor (conta do serviço, avisos), a Kendir é responsável. É o único dado de adulto.
- Se a EduQA, a DGE ou outra entidade adotar a Aldeia oficialmente, os papéis revêem-se com ela.

Documentos (todos curtos, em linguagem simples, editáveis no backoffice):
1. **Termos de utilização para professores**, aceites com uma caixa ao criar a turma. Conteúdo: serviço gratuito e sem garantia de disponibilidade; uso só para fins educativos; o professor age em nome da escola e informa a direção; não usar nomes completos nem dados sensíveis; guardar o código do professor; informar os encarregados de educação; a Kendir pode fechar turmas abusivas; lei portuguesa.
2. **Termos de tratamento de dados** (anexo aos termos, aceites no mesmo passo): finalidade, categorias de dados, duração, segurança, subcontratantes ulteriores, aviso de violação de dados à escola sem demora, apoio aos direitos dos titulares, apagamento no fim.
3. **Privacidade** (página atual alargada com uma secção Aldeia Digital).
4. **Carta para encarregados de educação** (PDF gerado na criação da turma): o que é, que dados, quem vê, quando se apaga, como pedir para apagar (através do professor).
5. **Explicação para crianças**: o passo 6 do tutorial (ver 6.4). É a versão da informação adaptada à idade.
6. **Avaliação de impacto (AIPD) simples**, feita pela Kendir e disponível para as escolas: dados de crianças em escala justificam-na como boa prática.

Notas:
- Base legal provável para a escola: missão de interesse público na educação (art. 6.º, n.º 1, alínea e) do RGPD). Sem consentimento, não se aplica a idade de consentimento digital (13 anos em Portugal). Confirmar com o encarregado de proteção de dados de um agrupamento piloto e com aconselhamento jurídico.
- O primeiro nome é dado pessoal: recomendar número ou nome anónimo.
- Atualizar FAQ e `README.txt` na produção.

## 11. Arquitetura

- **Decidido**: Cloudflare Worker (já existe) com um **Durable Object por turma** (consistência forte, nomes únicos, apagamento por alarme). Pormenores e controlos em `SEGURANCA.md`.
- API na mesma origem (`/api/aldeia/...`): a CSP atual (`connect-src 'self'`) já cobre.
- Sem Worker (Docker/estático): Aldeia só local, no mesmo navegador, sem painel. A aplicação diz isso claramente.
- Cliente: `RepositorioAldeia` ao lado do `Repositorio` atual (grava local e sincroniza, com fila se faltar rede). As missões chamam o motor existente com `origem: "aldeia"`. As atividades não mudam.
- Mapa num módulo carregado à parte (`React.lazy`), como a Maqueta. Canvas 2D próprio ou PixiJS (a decidir). 30 fps em computadores fracos e Chromebooks; mapa com arte ≤ 1,5 MB.
- Todos os textos no sistema de textos, editáveis no backoffice (ver 11.1). Nenhum texto dentro de imagens.
- Missões de cidadania: novo tipo de definição sobre o componente `Situacoes.tsx` (escolha em situações ilustradas), com `numero` >= 300.

### 11.1 Textos editáveis no backoffice
A Aldeia tem muito texto (história, diálogos, tutorial, missões, emails). Tudo fica editável no backoffice, como o resto do ECD (`src/textos/registo.ts`, `sistema.ts`, Worker `/api/textos`).

Novo grupo **Aldeia Digital** no backoffice, com secções:

| Secção | Conteúdo |
|---|---|
| História | premissa, títulos e textos de abertura e fecho de cada capítulo |
| Diálogos | falas por personagem e por momento (chegada a um edifício, antes e depois de cada missão, celebração, “vamos outra vez”) |
| Nascimento | falas da Dona Cegonha, etiqueta do ovo, indicações de toque |
| Tutorial | 8 passos, com versão por ciclo |
| Missões de cidadania | situações, opções, explicações, por ciclo |
| Edifícios e lugares | nomes, descrições, etiquetas do Mapa em lista |
| Prémios | nomes dos fatos, itens e emblemas, e as descrições para leitor de ecrã |
| Nomes anónimos | animais e adjetivos (as formas de género ficam técnicas, ver abaixo) |
| Interface | HUD, menus, avisos, erros, “Guarda o teu nome”, sair deste computador |
| Professor | escolha de modo, configuração, painel, relatórios, alertas |
| Emails | assunto e corpo de cada modelo (confirmação, resumo, alertas, conclusão) |
| Documentos | termos, tratamento de dados, carta aos encarregados de educação, secção da Privacidade |

Regras para quem desenvolve:
- **Chaves estáveis por id, não por índice.** Os conteúdos da Aldeia são objetos com ids (`capitulos.jornal.abertura`, `dialogos.graca.antesNoticia`), nunca listas cuja ordem conte. Assim reordenar capítulos não estraga textos já editados no KV (problema conhecido das chaves atuais por índice).
- **Variantes por ciclo** como campos irmãos: `{ c1, c23, sec }`. Se faltar uma variante, usa a do ciclo abaixo.
- **Variáveis** entre chavetas, já protegidas pelo backoffice: `{nome}`, `{turma}`, `{capitulo}`, `{pontos}`, `{animal}`. Para concordância de género do nome anónimo: `{o}` (o/a), `{bemvindo}` (Bem-vindo/Bem-vinda). Preferir frases neutras quando possível.
- **Campos técnicos fora** (lista `negar`): ids, género gramatical, ligações entre missões e atividades, regras de desbloqueio, respostas certas das missões de cidadania (a explicação é editável, a opção certa não).
- **Emails**: o Worker lê os mesmos textos do KV `TEXTOS` para montar os emails. Só texto simples com a marcação já existente (**negrito** e ligações para o próprio sítio); o Worker escapa tudo. Editar emails exige a chave de administração ou de edição.
- **Pré-visualização** no backoffice para diálogos (balão com retrato) e emails (modelo com dados de exemplo). Desejável, não obrigatório na v1.
- Limites do Worker (`LIMITE_ENTRADAS` 6 000 alterações, `LIMITE_TOTAL` 1,5 MB): rever se a Aldeia fizer passar perto.
- `scripts/importar-textos.mjs` tem de aprender as chaves da Aldeia para passar a versão final para o código.

## 12. Acessibilidade
- Tudo jogável sem o mapa (Mapa em lista).
- Teclado total; foco visível no mapa.
- Leitor de ecrã: descrição do mapa e lista equivalente; diálogos em `aria-live`; avatar e itens descritos em texto.
- Diálogos com “Ouvir”, sem avanço automático.
- Modo calmo: sem animações ambientes, celebrações estáticas, sem som. O nascimento tem versão sem movimento.
- Estados nunca só por cor. Som opcional, desligado por omissão.

## 13. Fases

| Fase | Entrega |
|---|---|
| F0 | Especificação, currículo, segurança e design aprovados; validação inicial com EduQA e IAVE |
| F1 | Página Professor com dois modos; protótipo do mapa; andar; Mapa em lista; uma missão |
| F2 | Worker: turmas, códigos, identidade, retoma, Durable Objects, controlos de segurança, ambiente de testes |
| F3 | Nascimento, tutorial, história, capítulos, desbloqueios, casa |
| F4 | Painel, relatórios, alertas e emails |
| F5 | Missões de cidadania; arte e animações finais |
| F6 | Testes de carga e abuso, auditoria de acessibilidade, piloto com turmas |

## 14. Decisões

Fechadas (2026-10-13): Worker Cloudflare com manutenção da Kendir; email por Resend; todos os textos editáveis no backoffice; nome **Aldeia Digital**; dois modos na página Professor; repositório público; sem contas, sessão local + nome único; foco em crianças e vida escolar.

Escolhas da implementação (2026-10-13, a confirmar pelo product owner): 1 Durable Objects; 2 um código de turma; 3 máximo 32; 4 só marcos, sem moeda; 5 fora da v1; 6 objetivo coletivo: 3 em cada 4 alunos acabam o capítulo do meio da história e o Largo ganha grinaldas; 7 pixel art (pacote de arte v1.1); 8 Canvas 2D; 9 primeiro nome permitido como opção, não recomendado; 10 30 dias; 11 proposta em vigor nos termos; 12 Turnstile não implementado.

Abertas:
1. Durable Objects (proposto) ou D1.
2. Um código de turma (proposto) ou um por aluno.
3. Tamanho máximo da turma: 32?
4. Desbloqueios só por marcos (proposto) ou também moeda.
5. Colegas a andar na aldeia em tempo real (fora da v1).
6. Regra do objetivo coletivo.
7. Estilo gráfico: vetorial (proposto) ou pixel art.
8. Canvas 2D ou PixiJS.
9. Permitir primeiro nome?
10. Retenção de 30 dias após o fim.
11. Papéis RGPD: validar a proposta de 10.4 com um agrupamento piloto e aconselhamento jurídico.
12. Turnstile (Cloudflare) na criação de turmas: aceitável na política de privacidade?
