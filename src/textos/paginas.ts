// ─── Textos das páginas (editáveis no backoffice) ────────────────────────────
// [conteúdo Kendir] Marcação permitida nos textos: **negrito**, [texto](/rota), ^1^ (índice superior).
// Os campos "para" e "icone" não são editáveis (rotas e símbolos).

export const PAGINAS = {
  geral: {
    nomeApp: "Ensaio às Competências Digitais",
    faixaMosaico: "Aspeto Mosaico · Ágora Design System (AMA)",
    saltar: "Saltar para o conteúdo",
    rodape: "Ferramenta gratuita desenvolvida por {autoria} para uso pelo Estado Português",
    ligacoesRodape: { resultados: "Os meus resultados", cartao: "O meu cartão", seguranca: "Segurança digital", tutorial: "Tutorial", privacidade: "Privacidade", acessibilidade: "Acessibilidade", admin: "Administração", licenca: "Licença" },
    menu: { inicio: "Início", sobre: "Sobre", definicoes: "Definições" },
  },
  inicio: {
    etiqueta: "Gratuito · pt-PT · sem conta",
    titulo: "Antes da prova, o ecrã.",
    destaque: "Treina as tuas competências digitais antes das provas e testes importantes! Podes treinar-te a escrever no teclado, ler num ecrã, preencher campos, gerir o tempo, entre outras competências. Há também jogos e testes de segurança online.",
    subtitulo: "O Ensaio às Competências Digitais (ECD) ajuda a treinar estas competências. É gratuito. Não é preciso conta nem dados pessoais.",
    blocos: [
      { para: "/treinar", icone: "▶", titulo: "Treinar", texto: "Prepara-te para as provas e exames, treina uma atividade, joga, aprende a navegar em segurança ou entra com o código do teu professor." },
      { para: "/professor", icone: "✎", titulo: "Professor", texto: "Crie uma prova para as suas turmas, para avaliar as suas competências digitais." },
      { para: "/tutorial", icone: "?", titulo: "Tutorial", texto: "O funcionamento do Ensaio às Competências Digitais encontra-se explicado num breve tutorial. Tempo de leitura: 2 minutos." },
      { para: "/observatorio", icone: "◔", titulo: "Observatório", texto: "Estatísticas anónimas: que competências faltam e a quantas pessoas." },
    ],
    porque: {
      titulo: "Porquê",
      paragrafos: [
        "Desde 2025, as provas ModA do 4.º e 6.º anos e as provas finais do 9.º ano são feitas em suporte digital. O IAVE criou provas-ensaio para que todos os alunos cheguem à prova em situação de equidade.^1^",
        "Estudos em vários países mostram que o mesmo teste pode dar resultados mais baixos no computador do que em papel. A diferença tende a ser maior para alunos com menos acesso a tecnologia.^2, 3^",
        "Usar o telemóvel todos os dias não ensina a usar um formulário ou um teclado completo. No estudo ICILS 2023, cerca de um terço dos alunos portugueses do 8.º ano ficou abaixo do nível 2 de literacia digital.^4^",
      ],
    },
    comoFunciona: {
      titulo: "Como funciona",
      paragrafos: [
        "Escolhes a prova para a qual te preparas, ou uma atividade. Fazes atividades curtas, como num jogo. Cada uma dá uma pontuação de 0 a 100. No fim vês o que já dominas e o que podes treinar.",
        "Antes de começar escolhes o cenário: a redação do jornal da escola, ou um laboratório de experiências.",
        "Os professores montam uma prova, dão o código à turma e veem os resultados por código.",
      ],
    },
    dados: {
      titulo: "Os teus dados",
      paragrafos: [
        "Não há contas nem registos de pessoas. Os teus resultados ficam no teu navegador. Para estatísticas, cada atividade envia um registo anónimo que serve para perceber que competências faltam e a quantas pessoas. Podes desligar isso nas Definições.",
        "Sem endereço IP, sem impressão digital do dispositivo, sem analítica de terceiros. Por isso não há aviso de cookies.",
      ],
    },
    nivelMedio: {
      titulo: "Nível médio de competências digitais",
      media: "Média de todos os utilizadores: **{media}** pontos, nível **{faixa}** ({n} atividades concluídas). Mais números no [Observatório](/observatorio).",
      nota: "As pontuações descrevem o desempenho dos utilizadores nas diferentes atividades do ECD. Não são uma certificação DigComp. Os limiares são estimativas iniciais e poderão ser recalibrados.",
    },
    fontes: "1. IAVE, Preparar o Digit@l, 2025. 2. Backes e Cowan, Harvard EdLabs, 2019. 3. Kröhne e Martens, 2011; Lindner et al., 2024. 4. IAVE, Relatório Nacional ICILS 2023. Ligações completas em [Sobre](/sobre).",
  },
  treinar: {
    titulo: "Treinar",
    introducao: "Escolhe como queres treinar. Em todas as opções, antes de começar escolhes o cenário.",
    opcoes: [
      { para: "/teste", icone: "☰", titulo: "Provas e exames", texto: "Prepara-te para as provas ModA, as provas finais do 9.º ano e os exames nacionais, que se fazem no computador. No fim, tens acesso ao teu perfil de competências." },
      { para: "/treino", icone: "◎", titulo: "Atividade", texto: "Escolhe uma atividade e um de cinco níveis. É possível repetir as atividades e bater o recorde anterior." },
      { para: "/codigo", icone: "#", titulo: "Código", texto: "O teu professor deu-te um código? Introduz aqui para fazer a prova." },
      { para: "/jogos", icone: "🎲", titulo: "Jogos", texto: "Jogos para desenvolver competências: leitura com literatura portuguesa, escape room, mistério, folha de cálculo, email e um robô para programar." },
      { para: "/seguranca", icone: "🛡", titulo: "Segurança", texto: "Informações e testes sobre boas práticas online, exemplos de fraude e redes sociais." },
    ],
    rodape: "Primeira vez? Vê o [tutorial](/tutorial). Os teus carimbos estão no [cartão](/cartao).",
  },
  tutorial: {
    progresso: "Tutorial · passo {i} de {n}",
    saltar: "Saltar o tutorial",
    anterior: "Anterior",
    seguinte: "Seguinte",
    fim: "Voltar ao início",
    teclas: "Podes usar as setas ← → do teclado para mudar de passo.",
    aviso: { titulo: "Como funciona o ECD?", ver: "Ver o tutorial", agoraNao: "Agora não" },
    boasVindas: {
      titulo: "Bem-vindo ao Ensaio às Competências Digitais",
      paragrafos: [
        "As provas são cada vez mais feitas no computador. Aqui treinas o que essas provas pressupõem: escrever no teclado, ler ecrãs, usar menus e formulários, arrastar, usar atalhos, procurar num texto longo e escrever matemática. Há também jogos e testes de segurança online.",
        "É gratuito e não tem contas. Demora dois minutos a ver este tutorial. Podes saltá-lo quando quiseres.",
      ],
    },
    maneiras: {
      titulo: "Treinar: cinco maneiras",
      provas: { titulo: "Provas e exames", texto: "Uma preparação para as provas ModA, as provas finais e os exames nacionais, que se fazem no computador. No fim recebes o teu perfil de competências." },
      atividade: { titulo: "Atividade", texto: "Escolhes uma atividade e um de cinco níveis, do 1 (Iniciação) ao 5 (Perito). Repetes à vontade." },
      codigo: { titulo: "Código", texto: "O professor montou uma prova e deu-te um código. Escreves o código e fazes essa prova." },
      jogos: { titulo: "Jogos", texto: "Seis jogos para treinar de outra maneira: ler autores portugueses, sair de uma sala trancada, resolver um mistério, fazer um orçamento, escrever um email e programar um robô." },
      seguranca: { titulo: "Segurança", texto: "Três temas: boas práticas online, exemplos de fraude e redes sociais. Em cada um lês as informações e fazes um teste." },
    },
    cenario: { titulo: "Escolhe o cenário", texto: "Antes de começar escolhes onde se passa a história. O cenário muda as personagens, os títulos e os textos das tarefas. As regras e a pontuação são iguais.", personagens: "Personagens" },
    atividade: {
      titulo: "Como corre uma atividade",
      etapas: [
        { titulo: "1. Briefing", texto: "Uma personagem explica a tarefa em uma frase. Podes ouvi-la em voz alta." },
        { titulo: "2. Prática", texto: "Um item curto que não conta, para perceberes o que fazer." },
        { titulo: "3. Avaliação", texto: "A tarefa a sério. Algumas têm um relógio suave." },
        { titulo: "4. Resultado", texto: "Pontuação de 0 a 100, estrelas, uma dica concreta e um relatório tarefa a tarefa." },
      ],
    },
    pontuacao: { titulo: "Pontuação", texto: "Cada atividade dá uma pontuação de 0 a 100. Abaixo de 50 pontos, convém tentar novamente. De 50 a 74 ganhas uma estrela, de 75 a 90 duas e de 91 a 100 três. O teu melhor resultado em cada nível fica guardado neste navegador." },
    medida: {
      titulo: "Ajusta à tua medida",
      paragrafos: [
        "Em Definições podes mudar o aspeto (Original ou Mosaico), o tema claro ou escuro, o tamanho do texto, o contraste e o tempo alargado.",
        "Tudo funciona só com o teclado. Quando há arrastar, há sempre outra maneira: tocar no item e depois no destino.",
      ],
    },
    professores: {
      titulo: "Para professores",
      montar: { titulo: "Montar", texto: "Escolhe o nível, as atividades (também testes de segurança e jogos) e como os alunos se identificam (número de turma, alcunha ou nada)." },
      partilhar: { titulo: "Partilhar", texto: "Recebe um código e um QR para projetar na sala." },
      acompanhar: { titulo: "Acompanhar", texto: "Recebe os resultados por email, se quiser, e consulta-os numa página privada com exportação CSV." },
    },
    dados: {
      titulo: "Os teus dados",
      paragrafos: [
        "Não há contas. Os teus resultados ficam no teu navegador. Cada atividade envia um registo anónimo, sem nome nem IP, para estatísticas sobre as competências que faltam. Podes desligar isso em Definições.",
        "Os números de todos aparecem no Observatório. Grupos com menos de 20 tentativas ficam ocultos.",
      ],
    },
  },
  acessibilidade: {
    titulo: "Guia de acessibilidade",
    caminho: "Acessibilidade",
    introducao: "Para quem desenvolve, para escolas e para quem encomenda provas digitais. O enquadramento legal: o European Accessibility Act aplica-se desde 28 de junho de 2025; a EN 301 549 v4.1.1 (setembro de 2026) adota a WCAG 2.2 AA; os organismos públicos em Portugal seguem o Decreto-Lei 83/2018 e publicam uma declaração de acessibilidade. Este jogo compromete-se a cumprir todos os pontos abaixo.",
    colunas: [
      {
        titulo: "Para quem desenvolve",
        grupos: [
          { titulo: "Operação", itens: ["Tudo funciona só com teclado, por ordem lógica, com foco visível (WCAG 2.1.1, 2.4.7).", "O foco nunca fica escondido por cabeçalhos ou rodapés fixos (2.4.11).", "Todo o arrasto tem alternativa por clique ou toque (2.5.7).", "Alvos com pelo menos 24 por 24 px; de preferência 44 para crianças (2.5.8).", "Nunca exigir atalhos que o navegador ou o sistema reservam."] },
          { titulo: "Tempo", itens: ["Os temporizadores podem ser alargados por aluno, como acomodação (2.2.1).", "Os avisos de tempo são anunciados a leitores de ecrã, não só por cor.", "Expirar a sessão nunca perde respostas: guardar cada resposta e mostrar “Guardado”."] },
          { titulo: "Conteúdo", itens: ["Contraste de texto 4,5:1, de componentes 3:1. Nunca só a cor.", "Funciona a 200 % de zoom e a 320 px de largura sem scroll horizontal (1.4.4, 1.4.10).", "Rótulos e instruções visíveis e ligados aos campos. Os erros dizem o que está mal e como corrigir (3.3.1, 3.3.3).", "Não pedir a mesma informação duas vezes (3.3.7).", "Início de sessão, quando existe, sem testes de memória ou puzzles; permitir colar e gestores de palavras-passe (3.3.8).", "Ajuda no mesmo sítio em todos os ecrãs (3.2.6).", "Legendas e transcrições para áudio e vídeo; controlo de repetição nos itens com áudio.", "Respeitar o movimento reduzido e as definições de tipo de letra e espaçamento do utilizador (1.4.12).", "Linguagem simples. Testar as instruções com alunos da idade alvo."] },
        ],
      },
      {
        titulo: "Para escolas e entidades avaliadoras",
        grupos: [
          { titulo: "Antes da prova", itens: ["Dar aos alunos a interface real para praticar meses antes, não dias.", "Ensinar a interface, não só a matéria: navegação, listas de revisão, ferramentas, submissão.", "Testar nos dispositivos, teclados e rede reais da escola, com a turma toda ligada.", "Dar tempo às equipas de informática para instalar aplicações.", "Recolher cedo as necessidades de acomodação (mais tempo, leitor de ecrã, letra grande) e confirmar que funcionam na plataforma."] },
          { titulo: "Durante a prova", itens: ["Ter alternativa em papel ou offline pronta.", "Registar incidentes técnicos por aluno, para ler os resultados em contexto.", "Repor o tempo perdido por falha técnica."] },
          { titulo: "Ao comprar ou encomendar", itens: ["Exigir conformidade com a EN 301 549 (WCAG 2.2 AA) no caderno de encargos e pedir relatório de auditoria, não só autodeclaração.", "Exigir compatibilidade com as tecnologias de apoio usadas nas escolas.", "Comparar resultados digitais e em papel (efeito de modo) e publicar a análise.", "Publicar uma declaração de acessibilidade e um contacto para problemas."] },
        ],
      },
    ],
    declaracao: {
      titulo: "Declaração de acessibilidade deste sítio",
      texto: "Estado: em desenvolvimento, versão {versao}. Objetivo: WCAG 2.2 nível AA. A auditoria automática (axe-core, regras WCAG 2.2 A e AA) não encontrou problemas nas páginas e atividades, nos dois aspetos e nos dois temas; falta a revisão manual com leitor de ecrã. Problemas de acessibilidade: contactar a Kendir Studios. O aspeto Mosaico usa componentes do Ágora Design System da AMA; o aspeto Original usa componentes próprios com os mesmos requisitos. Ambos têm tema claro e escuro e uma opção de contraste reforçado (AAA).",
    },
  },
  sobre: {
    titulo: "Sobre",
    video: { titulo: "Apresentação do Ensaio às Competências Digitais", reservado: "Vídeo de apresentação", emBreve: "Em breve." },
    versao: "Ensaio às Competências Digitais (ECD), versão {versao} de {data}. Um projeto Eduardo Nunes & Kendir Studios (Worlds4Education - Jogos e Ambientes Educativos, Lda. | NIPC 516583824).",
    paragrafos: [
      "Plataforma web de código aberto, em português de Portugal, onde alunos treinam e medem as competências digitais práticas que as provas em computador pressupõem: escrever no teclado, ler ecrãs, preencher formulários, navegar, gerir o tempo, escrever matemática. Prepara para as provas ModA, as provas finais e os exames nacionais. Inclui também jogos e testes de segurança online.",
      "Sem contas, sem registos de pessoas e sem base de dados: a aplicação é um conjunto de ficheiros estáticos que qualquer escola ou entidade pode alojar. As estatísticas de uso são anónimas e vão para uma folha de cálculo controlada por quem publica a aplicação.",
    ],
    codigo: "Código-fonte:",
    estado: {
      titulo: "Estado",
      itens: [
        "Versão atual: motor de atividades, as 12 atividades jogáveis a 5 níveis (incluindo A Maqueta, de manipulação 3D), com tarefas, textos e alvos sorteados em cada tentativa, preparação para as provas ModA, provas finais, exames nacionais e ensino superior, treino, carimbos e cartão de imprensa, dois contextos narrativos (redação e laboratório), duas interfaces de utilização possíveis (Original e Mosaico) com tema claro e escuro, resultados locais, telemetria anónima com Observatório e ecrã de administração.",
        "Jogos (Biblioteca Viva, A Sala Trancada, Quem Apagou o Ficheiro?, Orçamento da Visita de Estudo, Correio da Redação, O Robô da Bancada) e Segurança digital (boas práticas online, exemplos de fraude, redes sociais), com cinco níveis e relatório. O professor pode incluí-los nas provas.",
        "Ferramentas de suporte: tutorial, sessões de professor com código, QR, resultados por email e página privada de resultados; auditoria automática de acessibilidade (WCAG 2.2 AA); protocolo de piloto e script de recalibração dos limiares.",
        "Backlog: piloto em escolas, recalibração dos limiares com os dados do piloto, revisão manual de acessibilidade com leitor de ecrã.",
      ],
    },
    rodape: "Primeira vez? Vê o [tutorial](/tutorial). Estatísticas de uso no [Observatório](/observatorio).",
    fontes: {
      titulo: "Fontes",
      lista: [
        { texto: "IAVE, Preparar o Digit@l: Provas-Ensaio 2025", url: "https://iave.pt/wp-content/uploads/2025/01/Provas-ensaio_Comunicacao-as-escolas_IAVE.pdf" },
        { texto: "Harvard GSE, Testing Mode Matters (Backes e Cowan)", url: "https://www.gse.harvard.edu/ideas/usable-knowledge/19/01/testing-mode-matters" },
        { texto: "Comparing Test-Taking Effort Between Paper-Based and Computer-Based Tests (PMC)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10846472/" },
        { texto: "Kröhne e Martens, Computer-based competence tests in the NEPS", url: "https://www.researchgate.net/publication/225123434" },
        { texto: "Kappan, Assessing our assessments: Paper vs. computer", url: "https://kappanonline.org/assessing-our-assessments-paper-vs-computer/" },
        { texto: "IAVE, ICILS 2023 Relatório Nacional", url: "https://iave.pt/wp-content/uploads/2024/11/Relatorio-Final-ICILS.pdf" },
        { texto: "Iniciativa Educação, Literacia digital em tempos de pandemia", url: "https://www.iniciativaeducacao.org/pt/ed-on/artigos/estatisticas/literacia-digital-em-tempos-de-pandemia-o-impacto-do-ensino-remoto-nas-competencias-digitais" },
        { texto: "Comissão Europeia, ICILS in Europe 2023", url: "https://op.europa.eu/en/publication-detail/-/publication/59721dc6-a0aa-11ef-85f0-01aa75ed71a1/" },
        { texto: "Público, Maioria dos alunos não terminou prova de aferição no tempo estipulado", url: "https://www.publico.pt/2023/05/29/sociedade/noticia/maioria-alunos-nao-terminou-prova-afericao-tempo-estipulado-problemas-tecnicos-2051484" },
        { texto: "JRC, DigComp 2.2", url: "https://publications.jrc.ec.europa.eu/repository/handle/JRC128415" },
        { texto: "AccessibleEU, EN 301 549 has been updated", url: "https://accessible-eu-centre.ec.europa.eu/content-corner/news/european-accessibility-standard-en-301-549-has-been-updated-2026-09-07_en" },
        { texto: "Ágora Design System (AMA) · Mosaico", url: "https://mosaico.gov.pt/ferramentas/agora-design-system" },
      ],
    },
  },
  privacidade: {
    titulo: "Privacidade",
    introducao: "Escrito em linguagem simples. Se algo não ficar claro, pergunta.",
    seccoes: [
      { titulo: "Não há contas", paragrafos: ["Ninguém se regista. Não pedimos nome, email nem idade. Os teus resultados ficam só no teu navegador, para veres a tua evolução; podes exportá-los ou apagá-los em “Os meus resultados”. O nome que escreveres nas Definições serve só para aparecer no teu ecrã de resultado e nunca sai do teu computador."] },
      { titulo: "Estatísticas anónimas", paragrafos: ["Para sabermos que competências faltam e a quantas pessoas, cada atividade concluída envia um pequeno registo anónimo: um identificador aleatório criado no teu navegador (não ligado a ti), a atividade, o nível, a pontuação, a duração, algumas medidas da atividade (por exemplo palavras por minuto), o tipo de dispositivo (computador, tablet, telemóvel), o contexto e o aspeto escolhidos, e se usaste tempo alargado. Não enviamos o endereço IP, nem impressão digital do dispositivo, nem usamos analítica ou publicidade de terceiros. Por isso não há aviso de cookies: só há armazenamento estritamente necessário.", "Os registos vão para uma folha de cálculo controlada pela entidade que publica a aplicação, na União Europeia, e servem só para estatísticas agregadas. No Observatório, qualquer grupo com menos de 20 tentativas fica oculto. Podes desligar o envio em Definições → Estatísticas anónimas; a aplicação funciona exatamente igual."] },
      { titulo: "Sessões de professor", paragrafos: ["Quando um professor cria uma sessão, guardamos o código, a configuração da prova e, se o professor o indicar, o seu email, para lhe enviar os resultados. O email só é usado depois de confirmado por ligação e é apagado 12 meses após a última tentativa. Nas tentativas feitas com o código vai também o identificador que o professor pediu (número de turma ou alcunha); recomendamos o número de turma em vez do nome."] },
      { titulo: "Base legal e contacto", paragrafos: ["Os dados anónimos não identificam ninguém e são tratados com base no interesse legítimo de melhorar a preparação dos alunos para provas digitais. Dúvidas ou pedidos: Kendir Studios."] },
    ],
  },
  licenca: {
    titulo: "Licença",
    introducao: "O Ensaio às Competências Digitais é uma ferramenta gratuita desenvolvida por {autoria} para uso pelo Estado Português. Qualquer pessoa, escola ou entidade pode usá-la, copiá-la, adaptá-la e publicá-la de forma gratuita, desde que mantenha a atribuição:",
    atribuicao: "“Ensaio às Competências Digitais, desenvolvido por {autoria}.”",
    seccoes: [
      { titulo: "Código-fonte: Licença MIT", paragrafos: ["Permite usar, alterar e redistribuir o código para qualquer fim, mantendo o aviso de direitos de autor da Kendir Studios em todas as cópias."] },
      { titulo: "Conteúdos: Creative Commons Atribuição 4.0 (CC BY 4.0)", paragrafos: ["Textos das atividades, narrativas, personagens, documentação e design. Podem ser partilhados e adaptados para qualquer fim, desde que se indique a autoria ({autoria}), se inclua uma ligação para a licença e se assinale o que foi alterado. [Texto da licença CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt)."] },
      { titulo: "Componentes de terceiros", paragrafos: ["O Ágora Design System (AMA), React, three.js, dnd-kit e as restantes bibliotecas mantêm as suas licenças próprias. As marcas e logótipos da Kendir Studios não estão incluídos nesta licença."] },
    ],
    nota: "O texto completo está no ficheiro LICENSE do código-fonte.",
  },
  professor: {
    titulo: "Professor",
    comoFuncionaTitulo: "Como funciona",
    resultadosTitulo: "Resultados da sessão",
    semLigacao: "Abra a ligação privada que recebeu ao criar a sessão (ou no email de confirmação). As sessões criadas neste navegador estão listadas em [Professor](/professor).",
    "introducao": "Monte uma prova para a turma: escolha o nível e as atividades, obtenha um código e dê-o aos alunos. Para receber os resultados dos seus alunos, indique um email.",
    "comoFunciona": [
      "Deve escolher o nível, as atividades e como os alunos se identificam.",
      "Irá receber um código alfanumérico e um código QR para projetar.",
      "Os alunos deverão aceder ao site, selecionar a opção Treinar → Código, inserir o código e executar a prova.",
      "Os resultados serão enviados por email e ficam numa página privada, sendo possível a sua exportação em formato CSV."
    ]
  },
  provas: {
    titulo: "Preparação para provas e exames",
    caminho: "Provas e exames",
    cartao: "Preparação {nome}",
    comecar: "Começar a preparação",
    retomar: "Retomar ({i}/{n})",
    atividades: "Nível {nivel} · {n} atividades: {lista}.",
    nota: "O ECD não reproduz as provas oficiais nem as substitui: treina as competências digitais de que precisas para as fazer no computador (escrever, ler no ecrã, usar ferramentas, gerir o tempo). Para treinar uma atividade de cada vez, vai a [Atividade](/treino).",
    "introducao": "Escolhe a prova para a qual te estás a preparar. A preparação é uma sequência de atividades curtas que treina o que essas provas pedem no computador. Podes pausar entre atividades e retomar neste dispositivo."
  },
  atividades: {
    tituloCatalogo: "Atividades",
    titulo: "Treino de competências",
    caminho: "Atividades",
    "introducaoCatalogo": "As atividades do ECD. Escolhe a prova para ver as atividades que entram na preparação e em que nível. Para os cinco níveis de dificuldade, vai a Treino.",
    "introducao": "Cada atividade tem cinco níveis, do 1 (Iniciação) ao 5 (Perito). Podes repetir sempre que precisares. O teu melhor desempenho fica guardado neste navegador, por nível, com as estrelas respetivas: abaixo de 50 pontos convém tentar novamente; de 50 a 74, 1 estrela; de 75 a 90, 2 estrelas; de 91 a 100, 3 estrelas."
  },
  jogos: {
    titulo: "Jogos",
    "introducao": "Jogos para desenvolver competências digitais e de literacia. Cada jogo tem cinco níveis e um relatório no fim. Não contam para a preparação de provas nem para os carimbos: são treino livre."
  },
  seguranca: {
    titulo: "Segurança digital",
    ajudaTitulo: "Onde pedir ajuda",
    aprender: "Aprender",
    testar: "Testar · nível {nivel}",
    "introducao": "Três temas para estares mais seguro na internet. Em cada um, lê as informações e depois faz o teste, com cinco níveis e um relatório no fim. Os testes de segurança não contam para a preparação de provas nem para os carimbos."
  },
  definicoes: {
    titulo: "Definições",
    "introducao": "Tudo fica guardado neste navegador. Nenhuma destas escolhas afeta a pontuação, exceto o tempo alargado, que fica registado no resultado como acomodação."
  },
  resultados: {
    titulo: "Os meus resultados",
    "introducao": "Não há contas: os teus resultados ficam só neste navegador, para veres a evolução e os melhores por nível. Podes exportá-los ou apagá-los quando quiseres."
  },
  observatorio: {
    titulo: "Observatório",
    "introducao": "Neste ecrã são apresentadas estatísticas anónimas sobre as competências avaliadas por todas as pessoas que usaram a aplicação, de forma anónima."
  },
  atividade: {
    briefing: { pratica: "Primeiro fazes um item de prática que não conta. Depois começa a avaliação.", melhor: "O teu melhor neste nível: **{pontos}** pontos.", comecar: "Começar a prática", saltar: "Saltar a prática", ouvir: "Ler em voz alta", alargado: "Tempo alargado ×{x} ativo." },
    etapas: { intro: "Briefing", pratica: "Prática (não conta)", avaliacao: "A contar", resultado: "Resultado" },
    resultado: { carimbo: "Ganhaste o {carimbo} de {dominio}.", bom: "Bom trabalho.", caminho: "Vais no bom caminho.", tenta: "Tenta novamente: vais conseguir.", verCartao: "Ver o meu {cartao}", recorde: "Novo recorde pessoal (antes: {antes}).", tempo: "Tempo: {s} s · Nível {nivel} ({nome})", repetir: "Repetir", proxima: "Próxima atividade: {titulo}", voltar: "Voltar ao treino", repetirEsta: "Repetir esta atividade", revInfo: "Rever as informações", voltarSeguranca: "Voltar à segurança", voltarJogos: "Voltar aos jogos" },
    relatorio: { estrelas0: "Ainda não ganhaste estrelas: vale a pena tentar novamente.", estrelas1: "Obtiveste 1 estrela.", estrelasN: "Obtiveste {n} estrelas.", tres: "Tens as três estrelas. Experimenta o nível seguinte.", falta: "Para {nome} precisas de {alvo} pontos: faltam {falta}.", nomes: ["a primeira estrela", "a segunda estrela", "a terceira estrela"], proximaVez: "Da próxima vez:", titulo: "Relatório da atividade", bemFeito: "Bem feito.", porResponder: "Por responder: em branco vale zero." },
  },
  codigo: {
    titulo: "Entrar com código",
    caminho: "Código",
    introducao: "Insere aqui o código que o teu professor indicou. Terá o formato **TEC7·4F7KQ2**. Após inserires o código, clica em “Entrar” para começar a prova.",
  },
};
